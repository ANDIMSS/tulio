export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  tenantId?: string;
  isApproved: boolean;            // true = acesso liberado | false = bloqueado / pendente
  isAdmin: boolean;               // true = tem privilégios de administrador do tenant
  platformRole?: 'super_admin' | null; // Papel de administração global da plataforma
  createdAt: string;              // Data ISO
  licenseDurationType?: '3_months' | '6_months' | '12_months' | 'lifetime' | string;
  licenseExpiresAt?: string | null; // Data ISO de expiração (null se vitalício)
  licenseExpiresAtTimestamp?: any;
  licenseExpiresAtMillis?: number | null;
  licenseSetAt?: string;          // Data ISO em que a licença foi definida
}
