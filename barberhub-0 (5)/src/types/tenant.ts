export type TenantStatus = 'pending' | 'active' | 'suspended' | 'expired' | 'cancelled';
export type LicenseStatus = 'active' | 'expired' | 'suspended';
export type LicenseDurationType = '3_months' | '6_months' | '12_months' | 'lifetime' | string;
export type TenantRole = 'owner' | 'manager' | 'barber';
export type TenantAccessMode = 'landing_only' | 'full' | 'blocked';

export type Permission =
  | 'appointments.read'
  | 'appointments.write'
  | 'appointments.delete'
  | 'crm.read'
  | 'crm.write'
  | 'crm.delete'
  | 'finance.read'
  | 'finance.write'
  | 'finance.delete'
  | 'clients.read'
  | 'clients.write'
  | 'clients.delete'
  | 'settings.read'
  | 'settings.write'
  | 'members.read'
  | 'members.manage'
  | 'landing.read'
  | 'landing.write'
  | 'notifications.read'
  | 'notifications.write'
  | 'reports.read'
  | 'audit.read';

export interface Tenant {
  id: string;
  ownerUid: string | null;
  ownerEmail?: string;
  name: string;
  legalName?: string;
  tradeName?: string;
  document?: string;
  phone?: string;
  responsible?: string;
  slug: string;
  status: TenantStatus;
  accessMode?: TenantAccessMode;
  masterMaintenanceEnabled?: boolean;
  planId: string;
  licenseStatus: LicenseStatus;
  licenseDurationType?: LicenseDurationType;
  licenseStartedAt?: string;
  licenseExpiresAt?: string | null;
  licenseExpiresAtTimestamp?: any;
  licenseExpiresAtMillis?: number | null;
  licenseSetAt?: string;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  onboardingCompleted?: boolean;
}

export interface TenantMember {
  uid: string;
  email: string;
  displayName: string;
  role: TenantRole;
  active: boolean;
  phone?: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt?: string;
}

export interface DomainMapping {
  id?: string;
  domain: string;
  normalizedDomain: string;
  tenantId: string;
  tenantName?: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'removed';
  verified: boolean;
  primary?: boolean;
  dnsTarget?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxBarbers: number;
  hasCrm: boolean;
  hasCustomDomain: boolean;
  hasFinancials: boolean;
  popular?: boolean;
}

export interface TenantBusinessSettings {
  name: string;
  whatsappNumber: string;
  phoneDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  address: string;
  mapsUrl: string;
  tagline: string;
}

export interface TenantLandingSettings {
  heroTitleLine1: string;
  heroTitleLine2Prefix: string;
  heroTitleHighlight: string;
  logoUrl?: string;
}

