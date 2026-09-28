import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence benign connection retry warnings in sandbox/iframe environments
setLogLevel('error');

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreDb = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreDb;

// ==========================================
// Firebase App Check com reCAPTCHA Enterprise
// ==========================================
let appCheck: AppCheck | null = null;

if (typeof window !== 'undefined') {
  const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
  const customDebugToken = (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || '').trim();
  
  const isDevOrPreview =
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('run.app') ||
    window.location.hostname.includes('webcontainer') ||
    window.location.hostname.includes('googleusercontent.com');

  if (customDebugToken) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = customDebugToken;
  } else if (isDevOrPreview) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Somente inicializa reCAPTCHA Enterprise no domínio de produção autorizado,
  // ou em dev se houver token de debug explicitamente cadastrado no console
  if (recaptchaSiteKey && (!isDevOrPreview || customDebugToken)) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err: any) {
      console.warn('[Firebase App Check] Aviso ao inicializar AppCheck:', err?.message || err);
    }
  }
}

export { appCheck };
export default app;

