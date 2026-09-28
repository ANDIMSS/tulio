import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { AppUser } from '../types/auth';
import { resolveTenantForUser } from '../lib/tenantUtils';

export type { AppUser };

export const SUPER_ADMIN_EMAILS = [
  'conecdevce@gmail.com',
  'conectdevce@gmail.com',
];

export function checkIsSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isExpired: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  isExpired: false,
  authError: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!firebaseUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          // Initialize user document adhering strictly to firestore.rules
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            isApproved: false,
            isAdmin: false,
            tenantId: '',
            createdAt: new Date().toISOString(),
          });
        }

        // Trigger tenant claim resolution on login (for owner first login)
        try {
          await resolveTenantForUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
        } catch (resolveErr) {
          console.warn('[AUTH] Notice during resolveTenantForUser:', resolveErr);
        }

        // Listen in real-time to user profile changes
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setAppUser(docSnap.data() as AppUser);
          } else {
            setAppUser(null);
          }
          setLoading(false);
        }, (err) => {
          console.error('[AUTH] Erro ao escutar perfil do usuário:', err);
          setLoading(false);
        });

      } catch (err: any) {
        console.error('[AUTH] Erro ao inicializar usuário:', err);
        setAuthError(err.message || 'Erro ao sincronizar perfil do usuário.');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('[AUTH] Erro ao autenticar com Google:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setAuthError(err.message || 'Erro ao realizar login com o Google.');
      }
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAppUser(null);
      setAuthError(null);
    } catch (err: any) {
      console.error('[AUTH] Erro ao deslogar:', err);
      setAuthError(err.message || 'Erro ao sair da conta.');
    }
  };

  const isSuperAdmin = Boolean(user?.email && checkIsSuperAdmin(user.email));

  const isAdmin = Boolean(
    isSuperAdmin ||
    appUser?.isAdmin ||
    (appUser as any)?.role === 'admin' ||
    (appUser as any)?.role === 'superadmin' ||
    appUser?.platformRole === 'super_admin'
  );

  const isExpired = Boolean(
    appUser?.licenseExpiresAt &&
    !isSuperAdmin &&
    new Date(appUser.licenseExpiresAt).getTime() < Date.now()
  );

  return (
    <AuthContext.Provider value={{
      user,
      appUser,
      loading,
      isAdmin,
      isSuperAdmin,
      isExpired,
      authError,
      signInWithGoogle,
      signOutUser,
      loginWithGoogle: signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
