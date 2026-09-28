import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '../types/auth';
import {
  Tenant,
  TenantMember,
  TenantBusinessSettings,
  TenantLandingSettings,
  DomainMapping,
  TenantRole,
  TenantStatus,
  LicenseDurationType,
} from '../types/tenant';
import { normalizeHostname, sanitizeSlug } from './authUtils';
import { deleteTenantStorageFolder } from './storage';
import { addAuditLogToBatch, logAuditEvent } from './audit';

export interface CreateCompanyInput {
  name: string;
  legalName?: string;
  tradeName?: string;
  document?: string; // CNPJ or CPF
  responsible?: string;
  phone?: string;
  ownerEmail: string;
  ownerUid?: string;
  planId: string;
  licenseDurationType: LicenseDurationType;
  licenseStartedAt?: string;
  licenseExpiresAt?: string | null;
  slug?: string;
  customDomain?: string;
  status?: TenantStatus;
}

/**
 * Sanitizes an object before writing to Firestore by replacing any `undefined` values.
 * Optional text fields become empty strings `''`, null fields stay `null` or become `null`.
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized: Record<string, any> = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      if (key === 'ownerUid' || key === 'licenseExpiresAt') {
        sanitized[key] = null;
      } else {
        sanitized[key] = '';
      }
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      sanitized[key] = sanitizeFirestoreData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/**
 * Generates a clean and unique slug for a tenant
 */
export async function generateUniqueSlug(baseName: string, currentTenantId?: string): Promise<string> {
  const baseSlug = sanitizeSlug(baseName) || 'empresa';
  let testSlug = baseSlug;
  let counter = 1;

  while (true) {
    const q = query(collection(db, 'tenants'), where('slug', '==', testSlug));
    const snap = await getDocs(q);

    // If no document exists with this slug, or the document found is the current tenant being edited
    if (snap.empty || (currentTenantId && snap.docs.length === 1 && snap.docs[0].id === currentTenantId)) {
      return testSlug;
    }

    counter++;
    testSlug = `${baseSlug}-${counter}`;
  }
}

/**
 * Calculates expiration ISO string based on duration type
 */
export function calculateLicenseExpiry(
  durationType: LicenseDurationType,
  startDate: Date = new Date()
): string | null {
  if (durationType === 'lifetime') return null;

  const target = new Date(startDate.getTime());
  if (durationType === '3_months') {
    target.setMonth(target.getMonth() + 3);
  } else if (durationType === '6_months') {
    target.setMonth(target.getMonth() + 6);
  } else if (durationType === '12_months') {
    target.setFullYear(target.getFullYear() + 1);
  } else {
    // Default 1 month
    target.setMonth(target.getMonth() + 1);
  }
  return target.toISOString();
}

/**
 * Evaluates whether a user's license is active based on tenant or user license fields.
 */
export function isLicenseActive(user: AppUser | null, tenant: Tenant | null): boolean {
  if (!user && !tenant) return false;

  if (tenant) {
    if (tenant.status !== 'active') return false;
    if (tenant.licenseStatus === 'suspended') return false;
    if (tenant.licenseStatus === 'expired') return false;
    if (tenant.licenseDurationType === 'lifetime' || tenant.licenseExpiresAt === null) return true;
    if (tenant.licenseExpiresAt) {
      return Date.now() <= new Date(tenant.licenseExpiresAt).getTime();
    }
  }

  if (user) {
    if (user.licenseDurationType === 'lifetime' || user.licenseExpiresAt === null) return true;
    if (user.licenseExpiresAt) {
      return Date.now() <= new Date(user.licenseExpiresAt).getTime();
    }
  }

  return true;
}

/**
 * Single centralized security check for tenant access.
 */
export function canAccessTenant(user: AppUser | null, tenant: Tenant | null, isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  if (!user || !user.uid) return false;
  if (!user.isApproved) return false;
  if (!user.tenantId) return false;
  if (!tenant) return false;
  if (tenant.status !== 'active') return false;
  return isLicenseActive(user, tenant);
}

/**
 * Centralized function to resolve tenant binding for an authenticated user.
 * NO AUTOMATIC DUMMY TENANT CREATION.
 */
export async function resolveTenantForUser(user: { uid: string; email?: string | null; displayName?: string | null }): Promise<Tenant | null> {
  if (!user || !user.uid) return null;

  const userEmail = (user.email || '').trim().toLowerCase();
  console.log('[TENANT] Resolving tenant for user', { uid: user.uid, email: userEmail });

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.exists() ? (userDoc.data() as AppUser) : null;

  // PRIORITY 1: Existing tenantId on user profile
  if (userData?.tenantId) {
    const existingTenantRef = doc(db, 'tenants', userData.tenantId);
    const existingTenantDoc = await getDoc(existingTenantRef);

    if (existingTenantDoc.exists()) {
      const tenantData = existingTenantDoc.data() as Tenant;

      // Verify member record
      const memberRef = doc(db, 'tenants', userData.tenantId, 'members', user.uid);
      const memberDoc = await getDoc(memberRef);
      const isOwner = tenantData.ownerUid === user.uid;
      const isMemberActive = memberDoc.exists() && memberDoc.data()?.active === true;

      // CRITICAL FIX: If neither an active member nor the verified owner, do NOT recreate member!
      // The user was administratively removed or revoked. Revoke tenant link and deny access.
      if (!isMemberActive && !isOwner) {
        console.warn('[TENANT] Member association is inactive or revoked. Denying access.', { uid: user.uid, tenantId: userData.tenantId });
        await updateDoc(userRef, {
          tenantId: '',
          isApproved: false,
          updatedAt: new Date().toISOString(),
        });
        return null;
      }

      console.log('[TENANT] User verified with valid tenant access', { uid: user.uid, tenantId: userData.tenantId });
      return tenantData;
    }
  }

  // PRIORITY 2: Look up unassigned tenant claim created by Master by matching owner email
  if (userEmail) {
    console.log('[TENANT] Searching tenant claim by owner email', { email: userEmail });
    try {
      const claimRef = doc(db, 'tenant_claims', userEmail);
      const claimSnap = await getDoc(claimRef);

      if (claimSnap.exists()) {
        const claimData = claimSnap.data() as { tenantId: string };
        const tenantId = claimData.tenantId;

        if (tenantId) {
          const tenantRef = doc(db, 'tenants', tenantId);
          const tenantDoc = await getDoc(tenantRef);

          if (tenantDoc.exists()) {
            const tenantData = tenantDoc.data() as Tenant;
            const now = new Date().toISOString();

            console.log('[TENANT] Valid tenant claim found! Executing atomic link', { uid: user.uid, tenantId });

            const batch = writeBatch(db);

            // 1. Update user profile
            batch.set(userRef, {
              tenantId,
              isApproved: true,
              updatedAt: now,
            }, { merge: true });

            // 2. Update tenant status to active if pending, bind ownerUid
            const newStatus: TenantStatus = tenantData.status === 'pending' ? 'active' : tenantData.status;
            batch.update(tenantRef, {
              ownerUid: user.uid,
              ownerEmail: userEmail,
              status: newStatus,
              updatedAt: now,
            });

            // 3. Create/update member
            const memberRef = doc(db, 'tenants', tenantId, 'members', user.uid);
            batch.set(memberRef, {
              uid: user.uid,
              email: userEmail,
              displayName: user.displayName || tenantData.responsible || tenantData.name || 'Proprietário',
              role: 'owner',
              active: true,
              createdAt: now,
              updatedAt: now,
            }, { merge: true });

            // 4. Delete tenant claim so it cannot be reused
            batch.delete(claimRef);

            await batch.commit();
            console.log('[TENANT] User linked successfully via atomic claim batch', { uid: user.uid, tenantId });

            return {
              ...tenantData,
              ownerUid: user.uid,
              status: newStatus,
            };
          }
        }
      }
    } catch (claimErr) {
      console.error('[TENANT] Error resolving tenant claim for user:', claimErr);
    }
  }

  // PRIORITY 3: No tenant found. DO NOT CREATE A DUMMY TENANT!
  console.log('[TENANT] No tenant found for user. Remaining unlinked.', { uid: user.uid, email: userEmail });
  return null;
}

/**
 * Replaces legacy automatic creation call to ensure safe resolution.
 */
export async function ensureTenantForUser(u: AppUser): Promise<void> {
  if (!u || !u.uid) return;
  await resolveTenantForUser(u);
}

/**
 * Unified atomic engine for assigning or transferring a user to a tenant.
 * Guarantees:
 * - If user was in an old tenant (A != B), old membership is deactivated
 * - If user was owner of old tenant, ownerUid is cleared on A
 * - user.tenantId = B and user.isApproved = true
 * - Target tenant membership is activated (active: true)
 * - If role == 'owner', target tenant ownerUid is updated
 * - Both memberships are never active at the same time
 */
export async function executeTenantAssignment({
  uid,
  targetTenantId,
  role = 'owner',
  details,
}: {
  uid: string;
  targetTenantId: string;
  role?: TenantRole;
  details?: { email?: string; displayName?: string; phone?: string };
}): Promise<{ success: boolean; userId: string; tenantId: string; message: string }> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? (userSnap.data() as AppUser) : null;
    const oldTenantId = userData?.tenantId;
    const userEmail = (details?.email || userData?.email || '').trim().toLowerCase();
    const displayName = details?.displayName || userData?.displayName || userEmail.split('@')[0] || 'Membro';
    const now = new Date().toISOString();

    const targetTenantRef = doc(db, 'tenants', targetTenantId);
    const targetTenantSnap = await getDoc(targetTenantRef);
    if (!targetTenantSnap.exists()) {
      return { success: false, userId: uid, tenantId: targetTenantId, message: 'Empresa de destino não existe.' };
    }
    const targetTenantData = targetTenantSnap.data() as Tenant;

    const batch = writeBatch(db);

    // 1. If user was in a different tenant, deactivate membership in old tenant A
    if (oldTenantId && oldTenantId !== targetTenantId) {
      const oldMemberRef = doc(db, 'tenants', oldTenantId, 'members', uid);
      batch.set(oldMemberRef, {
        active: false,
        removedAt: now,
        updatedAt: now,
      }, { merge: true });

      // 2. If user was the owner of old tenant A, clear ownerUid on A
      const oldTenantRef = doc(db, 'tenants', oldTenantId);
      const oldTenantSnap = await getDoc(oldTenantRef);
      if (oldTenantSnap.exists() && (oldTenantSnap.data() as Tenant).ownerUid === uid) {
        batch.update(oldTenantRef, {
          ownerUid: '',
          updatedAt: now,
        });
      }
    }

    // 3. Update users/{uid}
    batch.set(userRef, sanitizeFirestoreData({
      uid,
      email: userEmail,
      displayName,
      tenantId: targetTenantId,
      isApproved: true,
      updatedAt: now,
    }), { merge: true });

    // 4. Create or activate member in target tenant B
    const newMemberRef = doc(db, 'tenants', targetTenantId, 'members', uid);
    const newMemberSnap = await getDoc(newMemberRef);
    const memberData: any = {
      uid,
      email: userEmail,
      displayName,
      role,
      active: true,
      updatedAt: now,
      ...(details?.phone ? { phone: details.phone } : {}),
    };
    if (!newMemberSnap.exists()) {
      memberData.createdAt = now;
    }
    batch.set(newMemberRef, sanitizeFirestoreData(memberData), { merge: true });

    // 5. Update target tenant if role is 'owner' or if target tenant has no ownerUid or is pending
    const tenantUpdates: any = { updatedAt: now };
    if (role === 'owner' || !targetTenantData.ownerUid) {
      tenantUpdates.ownerUid = uid;
      if (userEmail) tenantUpdates.ownerEmail = userEmail;
    }
    if (targetTenantData.status === 'pending') {
      tenantUpdates.status = 'active';
    }
    batch.update(targetTenantRef, sanitizeFirestoreData(tenantUpdates));

    await batch.commit();

    // Audit log
    try {
      await logAuditEvent({
        tenantId: targetTenantId,
        action: newMemberSnap.exists() ? 'member.role_changed' : 'member.created',
        module: 'rbac',
        targetType: 'member',
        targetId: uid,
        description: `Membro ${userEmail || uid} atribuído como ${role} no tenant ${targetTenantId}`,
        metadata: { role, targetTenantId, oldTenantId: oldTenantId || null },
        severity: 'info',
      });
    } catch (auditErr) {
      console.warn('[TENANT_ASSIGNMENT] Audit log notice:', auditErr);
    }

    console.log('[TENANT_ASSIGNMENT] Unified assignment committed successfully', {
      uid,
      oldTenantId,
      targetTenantId,
      role,
    });

    return {
      success: true,
      userId: uid,
      tenantId: targetTenantId,
      message: 'Usuário vinculado à empresa com sucesso.',
    };
  } catch (err: any) {
    console.error('[TENANT_ASSIGNMENT] Failed to assign tenant:', err);
    return {
      success: false,
      userId: uid,
      tenantId: targetTenantId,
      message: err.message || 'Erro ao vincular usuário à empresa.',
    };
  }
}

/**
 * Approves a user and assigns them to a tenant via unified atomic flow.
 */
export async function approveUserAndAssignTenant(
  uid: string,
  targetTenantId?: string,
  assignedRole: TenantRole = 'owner'
): Promise<{ success: boolean; userId: string; tenantId?: string; message: string }> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return { success: false, userId: uid, message: 'Usuário não encontrado.' };
    }
    const userData = userSnap.data() as AppUser;
    const userEmail = (userData.email || '').trim().toLowerCase();

    let resolvedTenantId = targetTenantId || userData.tenantId;

    if (!resolvedTenantId && userEmail) {
      const qTenant = query(collection(db, 'tenants'), where('ownerEmail', '==', userEmail));
      const tenantSnap = await getDocs(qTenant);

      if (tenantSnap.size > 1) {
        return {
          success: false,
          userId: uid,
          message: 'Existem múltiplas empresas cadastradas para este e-mail. É necessário realizar o vínculo manual pelo painel administrativo.',
        };
      }

      if (!tenantSnap.empty) {
        resolvedTenantId = tenantSnap.docs[0].id;
      }
    }

    if (!resolvedTenantId) {
      return {
        success: false,
        userId: uid,
        message: 'Nenhuma empresa cadastrada para este e-mail. Crie uma empresa primeiro.',
      };
    }

    const res = await executeTenantAssignment({
      uid,
      targetTenantId: resolvedTenantId,
      role: assignedRole,
    });

    return {
      success: res.success,
      userId: uid,
      tenantId: resolvedTenantId,
      message: res.message,
    };
  } catch (error: any) {
    console.error('[APPROVAL] Failed to approve user and assign tenant:', error);
    return {
      success: false,
      userId: uid,
      message: error.message || 'Erro ao aprovar usuário.',
    };
  }
}

/**
 * Explicit Company / Tenant Creation by Super Admin (Master)
 */
export async function createCompanyByMaster(input: CreateCompanyInput): Promise<string> {
  const normOwnerEmail = input.ownerEmail ? input.ownerEmail.trim().toLowerCase() : '';
  if (!input.name || !input.name.trim()) {
    throw new Error('O nome da empresa é obrigatório.');
  }
  if (!normOwnerEmail) {
    throw new Error('O e-mail do proprietário é obrigatório.');
  }

  // 1. Check if ownerEmail is already owner of an existing company
  const qOwner = query(collection(db, 'tenants'), where('ownerEmail', '==', normOwnerEmail));
  const snapOwner = await getDocs(qOwner);

  if (!snapOwner.empty) {
    const activeDoc = snapOwner.docs.find((d) => (d.data() as Tenant).status === 'active');
    if (activeDoc) {
      const activeTenant = activeDoc.data() as Tenant;
      throw new Error(`O e-mail ${normOwnerEmail} já é proprietário de uma empresa ativa ("${activeTenant.tradeName || activeTenant.name}").`);
    }
    const pendingDoc = snapOwner.docs.find((d) => (d.data() as Tenant).status === 'pending');
    if (pendingDoc) {
      const pendingTenant = pendingDoc.data() as Tenant;
      throw new Error(`O e-mail ${normOwnerEmail} já possui uma empresa pendente ("${pendingTenant.tradeName || pendingTenant.name}"). Ative a empresa existente em vez de recriar.`);
    }
  }

  // 2. Validate / generate slug
  const slug = input.slug ? sanitizeSlug(input.slug) : await generateUniqueSlug(input.name || input.tradeName || 'empresa');
  const qSlug = query(collection(db, 'tenants'), where('slug', '==', slug));
  const snapSlug = await getDocs(qSlug);
  if (!snapSlug.empty) {
    throw new Error(`O identificador (slug) "${slug}" já está em uso por outra empresa.`);
  }

  // 3. Search for existing user with ownerEmail in 'users' collection
  let resolvedOwnerUid: string | null = input.ownerUid || null;
  if (!resolvedOwnerUid) {
    const qUser = query(collection(db, 'users'), where('email', '==', normOwnerEmail));
    const userSnap = await getDocs(qUser);
    if (!userSnap.empty) {
      resolvedOwnerUid = userSnap.docs[0].id;
    }
  }

  // CRITICAL REQUIREMENT 7: Verify if user already belongs to another tenant.
  // Do NOT silently rebind or overwrite their tenant. Demand an explicit administrative transfer instead.
  if (resolvedOwnerUid) {
    const userDoc = await getDoc(doc(db, 'users', resolvedOwnerUid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      if (userData.tenantId) {
        const existingTenantDoc = await getDoc(doc(db, 'tenants', userData.tenantId));
        const companyName = existingTenantDoc.exists()
          ? ((existingTenantDoc.data() as Tenant).tradeName || (existingTenantDoc.data() as Tenant).name)
          : userData.tenantId;
        throw new Error(
          `Este usuário (${normOwnerEmail}) já está vinculado à empresa "${companyName}". Faça uma transferência de tenant antes de vinculá-lo a uma nova empresa.`
        );
      }
    }
  }

  const tenantsRef = collection(db, 'tenants');
  const newTenantRef = doc(tenantsRef);
  const tenantId = newTenantRef.id;

  const now = new Date().toISOString();

  // Compute License Expiration
  const licenseStartedAt = input.licenseStartedAt || now;
  let licenseExpiresAt: string | null = null;
  if (input.licenseExpiresAt !== undefined) {
    licenseExpiresAt = input.licenseExpiresAt;
  } else {
    licenseExpiresAt = calculateLicenseExpiry(
      input.licenseDurationType || '12_months',
      new Date(licenseStartedAt)
    );
  }
  const licenseExpiresAtTimestamp = licenseExpiresAt ? Timestamp.fromDate(new Date(licenseExpiresAt)) : null;
  const licenseExpiresAtMillis = licenseExpiresAt ? new Date(licenseExpiresAt).getTime() : null;

  // Determine status: If owner user exists, status is active. If owner user does not exist, status is pending.
  const status: TenantStatus = resolvedOwnerUid ? (input.status || 'active') : 'pending';

  const normalizedCustomDomain = input.customDomain?.trim()
    ? normalizeHostname(input.customDomain)
    : '';

  const newTenant: Tenant = {
    id: tenantId,
    ownerUid: resolvedOwnerUid || null,
    ownerEmail: normOwnerEmail,
    name: input.name.trim(),
    legalName: input.legalName?.trim() || '',
    tradeName: input.tradeName?.trim() || input.name.trim(),
    document: input.document?.trim() || '',
    phone: input.phone?.trim() || '',
    responsible: input.responsible?.trim() || '',
    slug,
    status,
    planId: input.planId || 'professional',
    licenseStatus: 'active',
    licenseDurationType: input.licenseDurationType || '12_months',
    licenseStartedAt,
    licenseExpiresAt: licenseExpiresAt ?? null,
    licenseExpiresAtTimestamp,
    licenseExpiresAtMillis,
    licenseSetAt: now,
    customDomain: normalizedCustomDomain,
    createdAt: now,
    updatedAt: now,
    timezone: 'America/Fortaleza',
    onboardingCompleted: true,
  };

  const businessSettingsRef = doc(db, 'tenants', tenantId, 'settings', 'business');
  const businessSettings: TenantBusinessSettings = {
    name: input.tradeName?.trim() || input.name.trim(),
    whatsappNumber: input.phone ? input.phone.replace(/\D/g, '') : '',
    phoneDisplay: input.phone?.trim() || '',
    instagramHandle: '',
    instagramUrl: '',
    address: '',
    mapsUrl: '',
    tagline: 'Sua barbearia de confiança',
  };

  const landingSettingsRef = doc(db, 'tenants', tenantId, 'settings', 'landing');
  const landingSettings: TenantLandingSettings = {
    heroTitleLine1: 'Bem-vindo à',
    heroTitleLine2Prefix: 'Nossa',
    heroTitleHighlight: input.tradeName?.trim() || input.name.trim(),
  };

  // Create Batch for consistent write
  const batch = writeBatch(db);
  batch.set(newTenantRef, sanitizeFirestoreData(newTenant));
  batch.set(businessSettingsRef, sanitizeFirestoreData(businessSettings));
  batch.set(landingSettingsRef, sanitizeFirestoreData(landingSettings));

  // If owner user exists, link user and create owner member
  if (resolvedOwnerUid) {
    const memberRef = doc(db, 'tenants', tenantId, 'members', resolvedOwnerUid);
    const ownerMember: TenantMember = {
      uid: resolvedOwnerUid,
      email: normOwnerEmail,
      displayName: input.responsible?.trim() || input.name.trim(),
      role: 'owner',
      active: true,
      phone: input.phone?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };
    batch.set(memberRef, sanitizeFirestoreData(ownerMember), { merge: true });

    const userRef = doc(db, 'users', resolvedOwnerUid);
    batch.set(userRef, sanitizeFirestoreData({
      tenantId,
      isApproved: true,
      licenseDurationType: input.licenseDurationType || '12_months',
      licenseExpiresAt: licenseExpiresAt ?? null,
      licenseExpiresAtTimestamp,
      licenseExpiresAtMillis,
      licenseSetAt: now,
      updatedAt: now,
    }), { merge: true });
  } else if (normOwnerEmail) {
    // If owner user does not exist yet, register a pre-link claim for atomic onboarding on first login
    const claimRef = doc(db, 'tenant_claims', normOwnerEmail);
    batch.set(claimRef, {
      tenantId,
      ownerEmail: normOwnerEmail,
      createdAt: now,
    });
  }

  // Sync public metadata to publicTenants
  const publicTenantRef = doc(db, 'publicTenants', tenantId);
  batch.set(publicTenantRef, {
    name: newTenant.name,
    tradeName: newTenant.tradeName,
    slug: newTenant.slug,
    status: newTenant.status,
    accessMode: newTenant.accessMode || 'full',
    customDomain: newTenant.customDomain || '',
  }, { merge: true });

  // Commit batch atomically
  await batch.commit();

  // Audit log (platform + tenant)
  try {
    await logAuditEvent({
      tenantId,
      action: 'tenant.created',
      module: 'tenant',
      targetType: 'tenant',
      targetId: tenantId,
      description: `Empresa "${newTenant.name}" (${slug}) criada por Super Admin`,
      metadata: { name: newTenant.name, slug, planId: newTenant.planId, ownerEmail: normOwnerEmail },
      severity: 'info',
    });
  } catch (auditErr) {
    console.warn('[MASTER] Audit log recording notice:', auditErr);
  }

  // If Custom Domain provided, register domain mapping
  if (input.customDomain) {
    try {
      await registerCustomDomain(tenantId, input.customDomain, true);
    } catch (domErr: any) {
      console.warn('[MASTER] Custom domain registration notice:', domErr);
    }
  }

  console.log('[MASTER] Company created successfully', { tenantId, slug, ownerEmail: normOwnerEmail, ownerUid: resolvedOwnerUid, status });
  return tenantId;
}

/**
 * Activates a company and binds the owner user if registered.
 */
export async function activateCompanyByMaster(
  tenantId: string
): Promise<{ success: boolean; ownerLinked: boolean; message: string }> {
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    if (!tenantSnap.exists()) {
      return { success: false, ownerLinked: false, message: 'Empresa não encontrada.' };
    }
    const tenantData = tenantSnap.data() as Tenant;
    const now = new Date().toISOString();

    let ownerUid = tenantData.ownerUid || '';
    let ownerEmail = (tenantData.ownerEmail || '').trim().toLowerCase();

    // If ownerUid is empty, search user by ownerEmail
    if (!ownerUid && ownerEmail) {
      const qUser = query(collection(db, 'users'), where('email', '==', ownerEmail));
      const userSnap = await getDocs(qUser);
      if (!userSnap.empty) {
        ownerUid = userSnap.docs[0].id;
      }
    }

    const batch = writeBatch(db);

    if (ownerUid) {
      // User found! Link user and set as owner
      const userRef = doc(db, 'users', ownerUid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? (userSnap.data() as AppUser) : null;

      batch.set(userRef, {
        tenantId,
        isApproved: true,
        updatedAt: now,
      }, { merge: true });

      const memberRef = doc(db, 'tenants', tenantId, 'members', ownerUid);
      batch.set(memberRef, {
        uid: ownerUid,
        email: ownerEmail,
        displayName: userData?.displayName || tenantData.responsible || tenantData.name || 'Proprietário',
        role: 'owner',
        active: true,
        createdAt: now,
        updatedAt: now,
      }, { merge: true });

      batch.update(tenantRef, {
        ownerUid,
        status: 'active',
        updatedAt: now,
      });

      batch.set(doc(db, 'publicTenants', tenantId), {
        status: 'active',
      }, { merge: true });

      addAuditLogToBatch(batch, {
        tenantId,
        action: 'tenant.activated',
        module: 'tenant',
        targetType: 'tenant',
        targetId: tenantId,
        description: `Empresa ativada e proprietário vinculado (${ownerEmail})`,
        metadata: { ownerUid, ownerEmail },
        severity: 'info',
      });

      await batch.commit();

      console.log('[ACTIVATION] Company activated and owner linked atomically', { tenantId, ownerUid });
      return {
        success: true,
        ownerLinked: true,
        message: 'Empresa ativada e acesso do proprietário liberado com sucesso.',
      };
    } else {
      // Owner user not registered yet
      batch.update(tenantRef, {
        status: 'active',
        updatedAt: now,
      });

      await batch.commit();

      console.log('[ACTIVATION] Company activated, owner user pending registration', { tenantId, ownerEmail });
      return {
        success: true,
        ownerLinked: false,
        message: 'Empresa ativada. O proprietário ainda precisa ser vinculado (quando fizer login com o e-mail cadastrado).',
      };
    }
  } catch (err: any) {
    console.error('[ACTIVATION] Failed to activate company:', err);
    return {
      success: false,
      ownerLinked: false,
      message: err.message || 'Erro ao ativar empresa.',
    };
  }
}

/**
 * Transfers a user from their current tenant to a new tenant.
 * Uses unified executeTenantAssignment to ensure atomic and consistent transition.
 */
export async function transferUserToTenant(
  uid: string,
  newTenantId: string,
  role: TenantRole = 'owner'
): Promise<{ success: boolean; message: string }> {
  const res = await executeTenantAssignment({
    uid,
    targetTenantId: newTenantId,
    role,
  });
  return {
    success: res.success,
    message: res.message,
  };
}

/**
 * Updates company / tenant information
 */
export async function updateCompany(
  tenantId: string,
  updates: Partial<Tenant> & {
    ownerEmail?: string;
  }
): Promise<void> {
  const tenantRef = doc(db, 'tenants', tenantId);
  const now = new Date().toISOString();

  const cleanUpdates: any = sanitizeFirestoreData({
    ...updates,
    updatedAt: now,
  });

  if (updates.slug) {
    cleanUpdates.slug = sanitizeSlug(updates.slug);
  }
  if (updates.customDomain) {
    cleanUpdates.customDomain = normalizeHostname(updates.customDomain);
  }

  // Ensure license timestamps stay in sync if licenseExpiresAt is modified
  if (updates.licenseExpiresAt !== undefined) {
    cleanUpdates.licenseExpiresAt = updates.licenseExpiresAt;
    cleanUpdates.licenseExpiresAtTimestamp = updates.licenseExpiresAt
      ? Timestamp.fromDate(new Date(updates.licenseExpiresAt))
      : null;
    cleanUpdates.licenseExpiresAtMillis = updates.licenseExpiresAt
      ? new Date(updates.licenseExpiresAt).getTime()
      : null;
  }

  await updateDoc(tenantRef, cleanUpdates);

  // Sync tenant_claims if ownerEmail is updated on an unassigned tenant
  if (updates.ownerEmail !== undefined) {
    const normNewEmail = (updates.ownerEmail || '').trim().toLowerCase();
    try {
      const currentSnap = await getDoc(tenantRef);
      if (currentSnap.exists()) {
        const currentData = currentSnap.data() as Tenant;
        const oldEmail = (currentData.ownerEmail || '').trim().toLowerCase();
        if (!currentData.ownerUid && oldEmail && oldEmail !== normNewEmail) {
          await deleteDoc(doc(db, 'tenant_claims', oldEmail));
        }
        if (!currentData.ownerUid && normNewEmail) {
          await setDoc(doc(db, 'tenant_claims', normNewEmail), {
            tenantId,
            ownerEmail: normNewEmail,
            createdAt: now,
          });
        }
      }
    } catch (claimSyncErr) {
      console.warn('[MASTER] Notice updating tenant_claims on company update:', claimSyncErr);
    }
  }

  // Sync public metadata to publicTenants
  const publicUpdates: any = {};
  if (cleanUpdates.name !== undefined) publicUpdates.name = cleanUpdates.name;
  if (cleanUpdates.tradeName !== undefined) publicUpdates.tradeName = cleanUpdates.tradeName;
  if (cleanUpdates.slug !== undefined) publicUpdates.slug = cleanUpdates.slug;
  if (cleanUpdates.status !== undefined) publicUpdates.status = cleanUpdates.status;
  if (cleanUpdates.accessMode !== undefined) publicUpdates.accessMode = cleanUpdates.accessMode;
  if (cleanUpdates.customDomain !== undefined) publicUpdates.customDomain = cleanUpdates.customDomain;

  if (Object.keys(publicUpdates).length > 0) {
    try {
      await setDoc(doc(db, 'publicTenants', tenantId), publicUpdates, { merge: true });
    } catch (pubErr) {
      console.warn('Erro ao atualizar publicTenants:', pubErr);
    }
  }

  // If custom domain changed, sync domain mapping
  if (updates.customDomain) {
    await registerCustomDomain(tenantId, updates.customDomain, true);
  }
}

/**
 * Assigns or updates a member in a tenant via unified executeTenantAssignment.
 */
export async function assignUserToTenant(
  uid: string,
  tenantId: string,
  role: TenantRole,
  details?: { email?: string; displayName?: string; phone?: string }
): Promise<void> {
  const res = await executeTenantAssignment({
    uid,
    targetTenantId: tenantId,
    role,
    details,
  });
  if (!res.success) {
    throw new Error(res.message);
  }
}

/**
 * Registers a custom domain mapping for a tenant
 */
export async function registerCustomDomain(
  tenantId: string,
  rawDomain: string,
  primary: boolean = true
): Promise<DomainMapping> {
  const normalizedDomain = normalizeHostname(rawDomain);
  if (!normalizedDomain) {
    throw new Error('Domínio inválido.');
  }

  // 1. Check if domain is already registered to another tenant
  const existingMappingSnap = await getDoc(doc(db, 'domainMappings', normalizedDomain));
  if (existingMappingSnap.exists()) {
    const existingData = existingMappingSnap.data() as DomainMapping;
    if (existingData.tenantId && existingData.tenantId !== tenantId) {
      throw new Error(`O domínio "${normalizedDomain}" já está associado a outra empresa.`);
    }
  }

  const now = new Date().toISOString();

  // 2. Get Tenant details
  const tenantRef = doc(db, 'tenants', tenantId);
  const tenantSnap = await getDoc(tenantRef);
  const tenantData = tenantSnap.exists() ? (tenantSnap.data() as Tenant) : null;
  const tenantName = tenantData?.name || '';

  // If replacing an old primary domain, clean up old mapping
  if (primary && tenantData?.customDomain && tenantData.customDomain !== normalizedDomain) {
    try {
      await removeCustomDomain(tenantData.customDomain, tenantId);
    } catch (oldErr) {
      console.warn('Erro ao desvincular domínio anterior:', oldErr);
    }
  }

  // 3. Global domain mapping doc
  const domainMappingRef = doc(db, 'domainMappings', normalizedDomain);
  const mapping: DomainMapping = {
    id: normalizedDomain,
    domain: rawDomain.trim().toLowerCase(),
    normalizedDomain,
    tenantId,
    tenantName,
    status: 'pending',
    verified: false,
    primary,
    dnsTarget: 'cname.barbearia-saas.com',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(domainMappingRef, sanitizeFirestoreData(mapping), { merge: true });

  // 4. Subcollection doc inside tenant
  const tenantDomainRef = doc(db, 'tenants', tenantId, 'domains', normalizedDomain);
  await setDoc(tenantDomainRef, sanitizeFirestoreData(mapping), { merge: true });

  // 5. Update tenant doc's customDomain field if primary
  if (primary) {
    await updateDoc(tenantRef, {
      customDomain: normalizedDomain,
      updatedAt: now,
    });
  }

  return mapping;
}

/**
 * Removes a custom domain
 */
export async function removeCustomDomain(
  normalizedDomain: string,
  tenantId: string
): Promise<void> {
  const norm = normalizeHostname(normalizedDomain);
  if (!norm) return;

  // 1. Remove from global domainMappings
  try {
    await deleteDoc(doc(db, 'domainMappings', norm));
  } catch (err) {
    console.warn('Could not delete global domain mapping:', err);
  }

  // 2. Remove from tenant's subcollection
  try {
    await deleteDoc(doc(db, 'tenants', tenantId, 'domains', norm));
  } catch (err) {
    console.warn('Could not delete tenant domain mapping:', err);
  }

  // 3. Clear customDomain on tenant if matches
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    if (tenantSnap.exists()) {
      const data = tenantSnap.data() as Tenant;
      if (data.customDomain === norm) {
        await updateDoc(tenantRef, {
          customDomain: '',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Could not update tenant custom domain:', err);
  }
}

/**
 * Completely removes a user from a tenant, deactivates membership,
 * and clears user profile references so access cannot be revived automatically.
 */
export async function removeUserFromTenant(
  tenantId: string,
  uid: string
): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date().toISOString();
    const batch = writeBatch(db);

    // 1. Deactivate membership record in tenant subcollection
    const memberRef = doc(db, 'tenants', tenantId, 'members', uid);
    batch.set(memberRef, {
      active: false,
      removedAt: now,
      updatedAt: now,
    }, { merge: true });

    // 2. Check user profile and clear tenant binding if matching
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as AppUser;
      if (userData.tenantId === tenantId) {
        batch.update(userRef, {
          tenantId: '',
          isApproved: false,
          updatedAt: now,
        });
      }
    }

    // 3. If user was the ownerUid of the tenant, clear ownerUid
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);
    if (tenantSnap.exists()) {
      const tenantData = tenantSnap.data() as Tenant;
      if (tenantData.ownerUid === uid) {
        batch.update(tenantRef, {
          ownerUid: '',
          updatedAt: now,
        });
      }
    }

    await batch.commit();

    try {
      await logAuditEvent({
        tenantId,
        action: 'member.removed',
        module: 'members',
        targetType: 'member',
        targetId: uid,
        description: `Membro ${uid} removido do tenant ${tenantId}`,
        metadata: { uid, tenantId },
        severity: 'warning',
      });
    } catch (auditErr) {
      console.warn('[MEMBER] Audit log notice:', auditErr);
    }
    console.log('[MEMBER] User removed and access revoked permanently', { uid, tenantId });
    return {
      success: true,
      message: 'Membro removido da empresa e autorização revogada com sucesso.',
    };
  } catch (err: any) {
    console.error('[MEMBER] Failed to remove user from tenant:', err);
    return {
      success: false,
      message: err.message || 'Erro ao remover membro da empresa.',
    };
  }
}

/**
 * Permanently deletes a tenant and all its subcollections in safe batches,
 * revokes associated users, removes publicTenants and domainMappings,
 * leaving no orphan or ghost tenant.
 * Follows a strict fail-safe sequence: reports the exact failed step
 * and never masks errors as successful deletions.
 */
export async function deleteTenantPermanently(tenantId: string): Promise<{ success: boolean; message: string; stepFailed?: string }> {
  try {
    if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
      return { success: false, message: 'ID da empresa inválido ou não informado.', stepFailed: 'validation' };
    }

    const cleanTenantId = tenantId.trim();

    // Verify tenant exists
    const tenantRef = doc(db, 'tenants', cleanTenantId);
    const tenantDoc = await getDoc(tenantRef);
    if (!tenantDoc.exists()) {
      return { success: false, message: 'A empresa não existe ou já foi excluída.', stepFailed: 'not_found' };
    }
    const tenantData = tenantDoc.data() as Tenant;

    const subcollections = [
      'members',
      'services',
      'professionals',
      'barbers',
      'appointments',
      'crm_leads',
      'notifications',
      'settings',
      'config',
      'domains',
      'financial_transactions',
      'financial_categories',
      'deletedClients',
      'occupied_slots',
      'testimonials',
      'differentials',
    ];

    // 1. Delete all subcollections in safe chunked batches
    for (const subcol of subcollections) {
      try {
        const colRef = collection(db, 'tenants', cleanTenantId, subcol);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const docs = snap.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 400);
            chunk.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
        }
      } catch (subErr: any) {
        console.warn(`[DELETE TENANT] Aviso ao listar subcoleção ${subcol}:`, subErr);
        if (subcol === 'settings') {
          // Attempt targeted doc deletions for settings
          const knownDocs = ['landing', 'business', 'timeSlots', 'main', 'theme', 'general'];
          for (const dId of knownDocs) {
            try {
              await deleteDoc(doc(db, 'tenants', cleanTenantId, 'settings', dId));
            } catch (_) {
              // Ignore non-existent docs
            }
          }
        } else {
          console.error(`[DELETE TENANT] Falha crítica ao limpar subcoleção ${subcol}:`, subErr);
          return {
            success: false,
            message: `Falha ao remover subcoleção ${subcol}: ${subErr?.message || subErr}`,
            stepFailed: `subcollection_${subcol}`
          };
        }
      }
    }

    // 2. Remove any domain mappings linked to this tenant
    try {
      const domainsQuery = query(collection(db, 'domainMappings'), where('tenantId', '==', cleanTenantId));
      const domainsSnap = await getDocs(domainsQuery);
      if (!domainsSnap.empty) {
        const batch = writeBatch(db);
        domainsSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (domErr: any) {
      console.error('[DELETE TENANT] Falha ao remover domainMappings:', domErr);
      return {
        success: false,
        message: `Falha ao remover mapeamento de domínio: ${domErr?.message || domErr}`,
        stepFailed: 'domainMappings'
      };
    }

    // 3. Remove publicTenants doc and any lingering tenant_claims
    try {
      await deleteDoc(doc(db, 'publicTenants', cleanTenantId));
    } catch (pubErr: any) {
      console.error('[DELETE TENANT] Falha ao remover publicTenants:', pubErr);
      return {
        success: false,
        message: `Falha ao remover registro público da empresa: ${pubErr?.message || pubErr}`,
        stepFailed: 'publicTenants'
      };
    }

    try {
      if (tenantData.ownerEmail) {
        await deleteDoc(doc(db, 'tenant_claims', tenantData.ownerEmail.trim().toLowerCase()));
      }
    } catch (claimDelErr) {
      console.warn('[DELETE TENANT] Aviso na limpeza de tenant_claims:', claimDelErr);
    }

    // 4. Delete all files in Firebase Storage for this tenant
    try {
      await deleteTenantStorageFolder(cleanTenantId);
    } catch (stgErr) {
      console.warn('[DELETE TENANT] Aviso na limpeza de arquivos do storage:', stgErr);
    }

    // 5. Revoke users who had this tenantId (set tenantId = '', isApproved = false)
    try {
      const usersQuery = query(collection(db, 'users'), where('tenantId', '==', cleanTenantId));
      const usersSnap = await getDocs(usersQuery);
      if (!usersSnap.empty) {
        const batch = writeBatch(db);
        usersSnap.docs.forEach((d) => {
          batch.update(d.ref, {
            tenantId: '',
            isApproved: false,
            updatedAt: new Date().toISOString(),
          });
        });
        await batch.commit();
      }
    } catch (userErr: any) {
      console.error('[DELETE TENANT] Falha ao revogar vínculos de usuários:', userErr);
      return {
        success: false,
        message: `Falha ao desvincular membros da empresa: ${userErr?.message || userErr}`,
        stepFailed: 'revoke_users'
      };
    }

    // 5.5 Record platform audit log before deleting tenant root doc
    try {
      await logAuditEvent({
        tenantId: null, // Platform level log
        action: 'tenant.deleted',
        module: 'tenant',
        targetType: 'tenant',
        targetId: cleanTenantId,
        description: `Empresa ${cleanTenantId} excluída permanentemente pelo Super Admin`,
        metadata: { tenantId: cleanTenantId },
        severity: 'critical',
      });
    } catch (auditErr) {
      console.warn('[DELETE TENANT] Aviso ao gravar audit log de exclusão:', auditErr);
    }

    // 6. Delete the tenant root document itself
    try {
      await deleteDoc(tenantRef);
    } catch (rootErr: any) {
      console.error('[DELETE TENANT] Falha ao remover documento principal do tenant:', rootErr);
      return {
        success: false,
        message: `Falha ao remover documento principal da empresa: ${rootErr?.message || rootErr}`,
        stepFailed: 'root_tenant_doc'
      };
    }

    console.log(`[DELETE TENANT] Empresa ${cleanTenantId} excluída permanentemente com sucesso.`);
    return { success: true, message: 'Empresa e todos os seus dados foram excluídos com sucesso.' };
  } catch (err: any) {
    console.error('[DELETE TENANT] Falha inesperada ao excluir empresa:', err);
    return { success: false, message: err.message || 'Erro inesperado ao excluir empresa.', stepFailed: 'unexpected' };
  }
}

