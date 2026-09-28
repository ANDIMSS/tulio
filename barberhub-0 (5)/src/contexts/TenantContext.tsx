import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Tenant {
  id: string;
  name: string;
  tradeName?: string;
  slug?: string;
  status: 'active' | 'pending' | 'blocked' | 'suspended' | 'cancelled' | 'expired';
  plan?: string;
  planId?: string;
  accessMode?: 'full' | 'landing_only' | 'blocked';
  customDomain?: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string;
  tenantStatus: string;
  loadingTenant: boolean;
  adminTenantMode: string;
  selectTenantForAdmin: (id: string | null, mode?: string) => void;
  hasPermission: (permission: string) => boolean;
}

const defaultTenant: Tenant = {
  id: 'ArrPlNCJajXW8EUSTk0a',
  name: 'Empresa',
  tradeName: 'Empresa',
  status: 'active',
  accessMode: 'full'
};

const TenantContext = createContext<TenantContextType>({
  tenant: defaultTenant,
  tenantId: defaultTenant.id,
  tenantStatus: 'active',
  loadingTenant: false,
  adminTenantMode: 'none',
  selectTenantForAdmin: () => {},
  hasPermission: () => true
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string>(() => {
    // 1. URL search params priority
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('tenantId') || urlParams.get('tenant_id');
      if (queryId) return queryId;

      const stored = sessionStorage.getItem('barberhub_selected_tenant_id');
      if (stored) return stored;
    }
    return 'ArrPlNCJajXW8EUSTk0a';
  });

  const [tenant, setTenant] = useState<Tenant | null>(defaultTenant);
  const [tenantStatus, setTenantStatus] = useState<string>('active');
  const [loadingTenant, setLoadingTenant] = useState<boolean>(true);
  const [adminTenantMode, setAdminTenantMode] = useState<string>('none');

  // Resolve tenant from publicTenants collection
  useEffect(() => {
    let isMounted = true;

    async function resolveTenant() {
      try {
        setLoadingTenant(true);
        const pubSnap = await getDocs(collection(db, 'publicTenants'));
        const list: Tenant[] = pubSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || data.tradeName || 'Barbearia',
            tradeName: data.tradeName || data.name || 'Barbearia',
            slug: data.slug || '',
            status: data.status || 'active',
            planId: data.planId || 'starter',
            accessMode: data.accessMode || 'full',
            customDomain: data.customDomain || ''
          };
        });

        if (!isMounted) return;

        if (list.length > 0) {
          // Check URL query param slug/id
          const urlParams = new URLSearchParams(window.location.search);
          const requestedSlug = (urlParams.get('t') || urlParams.get('tenant') || urlParams.get('empresa') || '').toLowerCase().trim();
          const requestedId = urlParams.get('tenantId') || urlParams.get('tenant_id');

          // Check pathname (e.g. /t/slug or /slug)
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          const pathSlug = pathSegments[0] === 't' && pathSegments[1] ? pathSegments[1].toLowerCase().trim() : (pathSegments[0] || '').toLowerCase().trim();

          let matched = list.find(t => {
            if (requestedId && t.id === requestedId) return true;
            if (requestedSlug && (t.slug?.toLowerCase() === requestedSlug || t.id.toLowerCase() === requestedSlug)) return true;
            if (pathSlug && (t.slug?.toLowerCase() === pathSlug || t.id.toLowerCase() === pathSlug)) return true;
            return false;
          });

          // Check if current tenantId matches any tenant
          if (!matched && tenantId) {
            matched = list.find(t => t.id === tenantId);
          }

          // Fallback to first active tenant
          if (!matched) {
            matched = list.find(t => t.status === 'active') || list[0];
          }

          if (matched) {
            setTenantId(matched.id);
            setTenant(matched);
            setTenantStatus(matched.status || 'active');
          }
        }
      } catch (err) {
        console.warn('Tenant resolution notice:', err);
      } finally {
        if (isMounted) {
          setLoadingTenant(false);
        }
      }
    }

    resolveTenant();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to active tenant updates
  useEffect(() => {
    if (!tenantId) return;

    const unsub = onSnapshot(
      doc(db, 'publicTenants', tenantId),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setTenant({
            id: snap.id,
            name: d.name || d.tradeName || 'Barbearia',
            tradeName: d.tradeName || d.name || 'Barbearia',
            slug: d.slug || '',
            status: d.status || 'active',
            planId: d.planId || 'starter',
            accessMode: d.accessMode || 'full',
            customDomain: d.customDomain || ''
          });
          setTenantStatus(d.status || 'active');
        }
      },
      (err) => {
        console.warn('publicTenants active listener notice:', err);
      }
    );

    return () => unsub();
  }, [tenantId]);

  const selectTenantForAdmin = (id: string | null, mode: string = 'none') => {
    if (id) {
      setTenantId(id);
      setAdminTenantMode(mode);
      try {
        sessionStorage.setItem('barberhub_selected_tenant_id', id);
      } catch {}
    } else {
      setAdminTenantMode('none');
      try {
        sessionStorage.removeItem('barberhub_selected_tenant_id');
      } catch {}
    }
  };

  const hasPermission = () => true;

  return (
    <TenantContext.Provider value={{
      tenant,
      tenantId,
      tenantStatus: (tenantStatus as any) || 'active',
      loadingTenant,
      adminTenantMode,
      selectTenantForAdmin,
      hasPermission
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
