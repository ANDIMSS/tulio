import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const DB_NAME = 'BarbershopMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

// In-memory cache of created blob URLs so we don't recreate them repeatedly
const objectUrlCache = new Map<string, string>();

/**
 * Returns synchronous object URL if already cached in memory
 */
export function getVideoObjectUrlFromCache(id: string): string | undefined {
  const cleanId = id.startsWith('local_media:') ? id.replace('local_media:', '') : id;
  return objectUrlCache.get(cleanId);
}

/**
 * Initializes the IndexedDB instance for local video storage with a safety timeout
 */
function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado neste navegador.'));
    }

    let isSettled = false;
    const timeoutTimer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        reject(new Error('Timeout ao abrir IndexedDB.'));
      }
    }, 2500);

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        try {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        } catch (upgradeErr) {
          console.warn('[openMediaDB] Upgrade error:', upgradeErr);
        }
      };

      request.onsuccess = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          resolve(request.result);
        }
      };

      request.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          reject(request.error || new Error('Erro ao abrir banco de mídia local.'));
        }
      };

      request.onblocked = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          reject(new Error('IndexedDB bloqueado por outra aba.'));
        }
      };
    } catch (openErr) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeoutTimer);
        reject(openErr);
      }
    }
  });
}

/**
 * Saves a video file/blob to local IndexedDB and returns a lightweight identifier `local_media:{id}`
 */
export async function saveVideoBlobToIndexedDB(id: string, fileOrBlob: Blob): Promise<string> {
  const mediaId = id.startsWith('local_media:') ? id.replace('local_media:', '') : id;

  // 1. Immediately create and cache an active blob Object URL so playback is instant
  try {
    const activeUrl = URL.createObjectURL(fileOrBlob);
    objectUrlCache.set(mediaId, activeUrl);
  } catch (urlErr) {
    console.warn('[saveVideoBlobToIndexedDB] createObjectURL notice:', urlErr);
  }

  // 2. Persist to IndexedDB asynchronously with timeout so caller is never blocked
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => resolve(), 2000); // don't block more than 2s
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const record = {
          id: mediaId,
          blob: fileOrBlob,
          type: fileOrBlob.type || 'video/mp4',
          size: fileOrBlob.size,
          updatedAt: Date.now()
        };

        const putReq = store.put(record);
        putReq.onsuccess = () => {
          clearTimeout(timer);
          resolve();
        };
        putReq.onerror = () => {
          clearTimeout(timer);
          reject(putReq.error);
        };
      } catch (txErr) {
        clearTimeout(timer);
        resolve();
      }
    });
  } catch (err) {
    console.warn('[saveVideoBlobToIndexedDB] Aviso de persistência local:', err);
  }

  return `local_media:${mediaId}`;
}

/**
 * Resolves a video reference (`local_media:{id}`, `blob:...`, or `https://...`) to a playable URL.
 */
export async function resolveVideoPlaybackUrl(rawUrl?: string): Promise<string> {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith('local_media:')) {
    return trimmed;
  }

  const mediaId = trimmed.replace('local_media:', '');

  // 1. Check in-memory active cache
  if (objectUrlCache.has(mediaId)) {
    return objectUrlCache.get(mediaId)!;
  }

  // 2. Fetch from IndexedDB
  try {
    const db = await openMediaDB();
    const blobRecord = await new Promise<{ id: string; blob: Blob } | null>((resolve, reject) => {
      const timer = setTimeout(() => resolve(null), 2000);
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(mediaId);
        getReq.onsuccess = () => {
          clearTimeout(timer);
          resolve(getReq.result || null);
        };
        getReq.onerror = () => {
          clearTimeout(timer);
          reject(getReq.error);
        };
      } catch (txErr) {
        clearTimeout(timer);
        resolve(null);
      }
    });

    if (blobRecord && blobRecord.blob) {
      const objectUrl = URL.createObjectURL(blobRecord.blob);
      objectUrlCache.set(mediaId, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn('[resolveVideoPlaybackUrl] Erro ao recuperar vídeo do IndexedDB:', err);
  }

  return '';
}

/**
 * Uploads a video file:
 * 1. Validates size (up to 100MB).
 * 2. Creates instant local blob URL & caches it immediately.
 * 3. Attempts Firebase Cloud Storage upload with progress reporting and cancellation timeout.
 * 4. If Cloud Storage succeeds, returns the public https:// URL.
 * 5. If Cloud Storage is unavailable, fails, or times out, safely returns the instant local_media identifier.
 */
export async function uploadExperienceVideoSmart(
  tenantId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; isLocal: boolean }> {
  const targetTenantId = tenantId || 'default';

  if (file.size > 100 * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`O arquivo de vídeo tem ${sizeMb}MB e ultrapassa o limite recomendado de 100MB. Escolha um arquivo menor ou utilize um link do YouTube / Vimeo.`);
  }

  const vidId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // Instant local caching
  const localRef = await saveVideoBlobToIndexedDB(vidId, file);
  onProgress?.(10);

  // Attempt Firebase Cloud Storage upload if storage is initialized
  if (storage) {
    try {
      const rawExt = (file.name && file.name.includes('.')) ? (file.name.split('.').pop() || 'mp4') : 'mp4';
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
      const contentType = file.type || (cleanExt === 'webm' ? 'video/webm' : cleanExt === 'mov' ? 'video/quicktime' : 'video/mp4');

      const storagePath = `tenants/${targetTenantId}/public/experiences/videos/${vidId}.${cleanExt}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType,
      });

      const cloudUrl = await new Promise<string>((resolve, reject) => {
        // Safety timeout of 25 seconds for upload so the app never hangs indefinitely
        const timeoutTimer = setTimeout(() => {
          try {
            uploadTask.cancel();
          } catch {}
          reject(new Error('Cloud upload timeout'));
        }, 25000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const pct = Math.min(98, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
              onProgress?.(pct);
            }
          },
          (err) => {
            clearTimeout(timeoutTimer);
            reject(err);
          },
          async () => {
            clearTimeout(timeoutTimer);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress?.(100);
              resolve(downloadUrl);
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });

      if (cloudUrl) {
        return { url: cloudUrl, isLocal: false };
      }
    } catch (storageErr: any) {
      console.warn('[uploadExperienceVideoSmart] Upload em nuvem indisponível ou interrompido. Mantendo vídeo no armazenamento local:', storageErr?.message || storageErr);
      onProgress?.(100);
    }
  }

  return { url: localRef, isLocal: true };
}
