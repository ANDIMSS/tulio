/**
 * Safe localStorage wrapper with automatic error handling,
 * quota exceeded recovery, and client-side image compression.
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      
      let payloadToStore = value;

      // Proactive optimization for services, appointments, or professionals:
      // If the JSON payload exceeds ~500KB, sanitize oversized data URL images to fit easily within quota.
      if (payloadToStore.length > 500000 && (key === 'services' || key === 'appointments' || key === 'professionals')) {
        try {
          const parsed = JSON.parse(payloadToStore);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((item: any) => {
              if (typeof item.image === 'string' && item.image.startsWith('data:') && item.image.length > 50000) {
                return { ...item, image: '' };
              }
              return item;
            });
            payloadToStore = JSON.stringify(sanitized);
          }
        } catch {}
      }

      window.localStorage.setItem(key, payloadToStore);
      return true;
    } catch (error: any) {
      // Handle QuotaExceededError with silent fallback recovery
      if (
        error?.name === 'QuotaExceededError' ||
        error?.code === 22 ||
        error?.code === 1014 ||
        error?.number === -2147024882 ||
        (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota'))
      ) {
        try {
          // Remove non-essential temp keys
          ['temp_preview', 'draft_image', 'debug_logs'].forEach(k => {
            try { window.localStorage.removeItem(k); } catch {}
          });

          // Strip heavy images from services/appointments if still failing
          if (key === 'services' || key === 'appointments' || key === 'professionals') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                const lightweight = parsed.map((item: any) => ({
                  ...item,
                  image: typeof item.image === 'string' && item.image.startsWith('data:') ? '' : item.image
                }));
                window.localStorage.setItem(key, JSON.stringify(lightweight));
                return true;
              }
            } catch {}
          }

          // Retry setting sanitized payload
          const stripped = value.length > 100000 ? value.substring(0, 100000) : value;
          window.localStorage.setItem(key, stripped);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      // Ignore removal errors
    }
  }
};

/**
 * Resizes and compresses image to a lightweight JPEG Data URL (under ~60KB)
 * to prevent localStorage QuotaExceededError while preserving great visual quality.
 */
export async function compressImage(
  fileOrDataUrl: File | Blob | string,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          width = maxWidth;
          height = maxHeight;
        }

        // Calculate aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (typeof fileOrDataUrl === 'string') {
            return resolve(fileOrDataUrl);
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
          return;
        }

        // High quality image smoothing during downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('[compressImage] Canvas compression failed, using fallback reader:', err);
        if (typeof fileOrDataUrl === 'string') {
          resolve(fileOrDataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        }
      }
    };

    img.onload = handleLoad;
    img.onerror = (e) => {
      console.warn('[compressImage] Image loading error:', e);
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads an image/asset to Firebase Storage under `tenants/{tenantId}/public/{folder}/{filename}`
 * and returns the https:// download URL.
 * Ensures only https:// URLs are saved to Firestore, never data:image/... base64.
 */
export async function uploadPublicAsset(
  tenantId: string,
  folder: string,
  fileOrBlob: File | Blob,
  customName?: string
): Promise<string> {
  if (!tenantId) throw new Error('tenantId é obrigatório para upload.');
  const ext = fileOrBlob.type?.includes('png') ? 'png' : fileOrBlob.type?.includes('webp') ? 'webp' : 'jpg';
  const name = customName || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const storagePath = `tenants/${tenantId}/public/${cleanFolder}/${name}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, fileOrBlob, {
    contentType: fileOrBlob.type || 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Standardized service image uploader:
 * Compresses the image on client-side, uploads to Firebase Storage,
 * and returns the public https:// URL.
 */
export async function uploadServiceImage(
  tenantId: string,
  fileOrBlob: File | Blob,
  serviceId?: string
): Promise<string> {
  if (!tenantId) throw new Error('ID da empresa é obrigatório para upload de imagem.');
  
  let processedBlob: Blob = fileOrBlob;
  try {
    const compressedDataUrl = await compressImage(fileOrBlob, 800, 800, 0.8);
    const res = await fetch(compressedDataUrl);
    processedBlob = await res.blob();
  } catch (compErr) {
    console.warn('[uploadServiceImage] Compression notice:', compErr);
  }

  const ext = 'jpg';
  const name = serviceId ? `${serviceId}_${Date.now()}.${ext}` : `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const storagePath = `tenants/${tenantId}/public/services/${name}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, processedBlob, {
    contentType: 'image/jpeg',
  });

  return await getDownloadURL(snapshot.ref);
}

/**
 * Standardized experience image uploader:
 * Compresses the image on client-side, uploads to Firebase Storage,
 * and returns the public https:// URL.
 */
export async function uploadExperienceImage(
  tenantId: string,
  fileOrBlob: File | Blob,
  experienceId?: string
): Promise<string> {
  if (!tenantId) throw new Error('ID da empresa é obrigatório para upload de imagem da experiência.');
  
  let processedBlob: Blob = fileOrBlob;
  try {
    const compressedDataUrl = await compressImage(fileOrBlob, 800, 800, 0.8);
    const res = await fetch(compressedDataUrl);
    processedBlob = await res.blob();
  } catch (compErr) {
    console.warn('[uploadExperienceImage] Compression notice:', compErr);
  }

  const ext = 'jpg';
  const name = experienceId ? `${experienceId}_${Date.now()}.${ext}` : `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const storagePath = `tenants/${tenantId}/public/experiences/${name}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, processedBlob, {
    contentType: 'image/jpeg',
  });

  return await getDownloadURL(snapshot.ref);
}

import { uploadExperienceVideoSmart, resolveVideoPlaybackUrl, saveVideoBlobToIndexedDB, getVideoObjectUrlFromCache } from './videoStorage';
export { resolveVideoPlaybackUrl, saveVideoBlobToIndexedDB, uploadExperienceVideoSmart, getVideoObjectUrlFromCache };

/**
 * Standardized experience video uploader:
 * Uploads video to Firebase Storage under `tenants/{tenantId}/public/experiences/videos/{name}`
 * and returns the public https:// URL.
 * If storage upload is unavailable or fails, falls back safely to IndexedDB media storage.
 */
export async function uploadExperienceVideo(
  tenantId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; isLocal: boolean }> {
  return await uploadExperienceVideoSmart(tenantId, file, onProgress);
}

/**
 * Optimizes logo image preserving 100% of original PNG, SVG, and WebP transparency:
 * - SVG: returns pristine vector data URL without rasterizing to canvas.
 * - PNG / WebP: preserves byte-exact file without degradation if under 600KB.
 * - Oversized PNG: scales down smoothly onto a fully transparent canvas rect (RGBA 0,0,0,0), exporting strictly as image/png.
 * - NEVER exports as image/jpeg (which would turn transparency to black).
 * - NEVER exports as lossy webp (which can discard alpha channel).
 */
export async function compressLogoImage(
  fileOrDataUrl: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800
): Promise<string> {
  // Case 1: SVG format -> ALWAYS return pristine vector Data URL
  // Never rasterize vector SVG onto canvas!
  if (typeof fileOrDataUrl !== 'string') {
    if (fileOrDataUrl.type === 'image/svg+xml') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      });
    }
  } else if (fileOrDataUrl.startsWith('data:image/svg+xml') || fileOrDataUrl.includes('<svg')) {
    return fileOrDataUrl;
  }

  // Case 2: PNG or WebP files that are already lightweight (< 600KB)
  // Preserve byte-exact original file with 100% alpha fidelity without running through canvas!
  if (typeof fileOrDataUrl !== 'string') {
    const isPng = fileOrDataUrl.type === 'image/png';
    const isWebP = fileOrDataUrl.type === 'image/webp';
    if ((isPng || isWebP) && fileOrDataUrl.size < 600 * 1024) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      });
    }
  }

  // Case 3: Oversized images or data URLs needing downscaling
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          width = maxWidth;
          height = maxHeight;
        }

        // Scale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (typeof fileOrDataUrl === 'string') return resolve(fileOrDataUrl);
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
          return;
        }

        // CRITICAL: Explicitly clear entire canvas rect to pristine transparent RGBA(0, 0, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // High quality rendering with smooth alpha interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // ALWAYS export as PNG to ensure 100% alpha transparency is preserved.
        // NEVER export as image/jpeg (which replaces transparency with opaque black).
        // NEVER export as lossy image/webp (which can discard alpha channel in many browsers).
        const pngUrl = canvas.toDataURL('image/png');
        resolve(pngUrl);
      } catch (err) {
        console.warn('[compressLogoImage] Fallback to FileReader:', err);
        if (typeof fileOrDataUrl === 'string') return resolve(fileOrDataUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    img.onload = handleLoad;
    img.onerror = (e) => {
      console.warn('[compressLogoImage] Error loading image:', e);
      if (typeof fileOrDataUrl === 'string') return resolve(fileOrDataUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('Falha ao processar arquivo de imagem'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Standardized tenant logo image uploader:
 * 1. Uploads the original File/Blob directly to Firebase Storage with its exact MIME type (image/png, image/svg+xml, image/webp).
 * 2. Never converts PNG/SVG to JPEG.
 * 3. Gracefully falls back to a transparent local Data URL if Firebase Storage is unavailable.
 * Ensures the logo ALWAYS preserves full alpha transparency and crisp vector/raster fidelity.
 */
export async function uploadLogoImage(
  tenantId: string,
  fileOrBlob: File | Blob
): Promise<string> {
  if (!tenantId) throw new Error('ID da empresa é obrigatório para upload da logo.');

  // 1. Direct Cloud Upload to Firebase Storage with original File/Blob
  if (storage) {
    try {
      const mime = fileOrBlob.type || 'image/png';
      let ext = 'png';
      if (mime === 'image/svg+xml') ext = 'svg';
      else if (mime === 'image/webp') ext = 'webp';
      else if (mime === 'image/jpeg' || mime === 'image/jpg') ext = 'jpg';
      else ext = 'png';

      let blobToUpload: File | Blob = fileOrBlob;

      // If it is an excessively huge PNG (> 3MB), resize to lossless PNG with alpha
      if (mime.includes('png') && fileOrBlob.size > 3 * 1024 * 1024) {
        try {
          const downscaled = await compressLogoImage(fileOrBlob, 1000, 1000);
          const res = await fetch(downscaled);
          blobToUpload = await res.blob();
        } catch (resizeErr) {
          console.warn('[uploadLogoImage] Downscale notice:', resizeErr);
        }
      }

      const name = `logo_${Date.now()}.${ext}`;
      const storagePath = `tenants/${tenantId}/public/logo/${name}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, blobToUpload, {
        contentType: mime,
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (downloadUrl) {
        return downloadUrl;
      }
    } catch (storageErr: any) {
      console.warn('[uploadLogoImage] Firebase Storage upload error, falling back to local optimized Data URL:', storageErr?.message || storageErr);
    }
  }

  // 2. Guaranteed local Data URL fallback with pristine transparency
  return await compressLogoImage(fileOrBlob, 800, 800);
}

/**
 * Recursively deletes all files and subfolders under a tenant's storage path:
 * `tenants/${tenantId}/`
 */
export async function deleteTenantStorageFolder(tenantId: string): Promise<void> {
  if (!tenantId) return;
  try {
    const rootRef = ref(storage, `tenants/${tenantId}`);
    
    async function deleteFolderRecursive(folderRef: any) {
      const listRes = await listAll(folderRef);
      // Delete all files in this directory
      const deleteFilePromises = listRes.items.map((itemRef) => deleteObject(itemRef).catch(() => {}));
      await Promise.all(deleteFilePromises);
      // Recurse into all subfolders
      const subfolderPromises = listRes.prefixes.map((prefixRef) => deleteFolderRecursive(prefixRef));
      await Promise.all(subfolderPromises);
    }

    await deleteFolderRecursive(rootRef);
  } catch (err) {
    console.warn(`[STORAGE CLEANUP] Warning while cleaning storage for tenant ${tenantId}:`, err);
  }
}


