export type AuditSeverity = 'info' | 'warning' | 'critical';

export type AuditModule =
  | 'rbac'
  | 'members'
  | 'settings'
  | 'landing'
  | 'finance'
  | 'crm'
  | 'clients'
  | 'appointments'
  | 'tenant'
  | 'platform';

export interface AuditLog {
  id: string;
  tenantId: string | null;
  actorUid: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  module: AuditModule;
  targetType?: string;
  targetId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdAtMillis?: number;
  schemaVersion: number;
  severity?: AuditSeverity;
}

export interface CreateAuditLogParams {
  tenantId?: string | null;
  action: string;
  module: AuditModule;
  targetType?: string;
  targetId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}
