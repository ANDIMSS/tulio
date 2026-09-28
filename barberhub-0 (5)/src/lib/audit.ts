import { collection, doc, setDoc, WriteBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuditLog, CreateAuditLogParams } from '../types/audit';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'appcheck',
  'secret',
  'credential',
  'apikey',
  'privatekey',
  'auth',
  'bearer',
  'refreshtoken',
];

/**
 * Sanitizes metadata to strictly exclude passwords, tokens, API keys, or private credentials.
 */
export function sanitizeAuditMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
    if (isSensitive) {
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Generates an AuditLog payload with strict actorUid, tenantId, and schemaVersion.
 */
export function buildAuditLogPayload(params: CreateAuditLogParams): {
  path: string;
  id: string;
  data: AuditLog;
} {
  const currentUser = auth.currentUser;
  const actorUid = currentUser?.uid || 'system_anonymous';
  const actorEmail = currentUser?.email || null;
  const now = new Date();
  const createdAt = now.toISOString();
  const createdAtMillis = now.getTime();
  const id = `audit_${createdAtMillis}_${Math.random().toString(36).substring(2, 9)}`;

  const sanitizedMetadata = sanitizeAuditMetadata(params.metadata) || {};

  const data: AuditLog = {
    id,
    tenantId: params.tenantId || null,
    actorUid,
    actorEmail,
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    targetId: params.targetId,
    description: params.description,
    metadata: sanitizedMetadata,
    createdAt,
    createdAtMillis,
    schemaVersion: 1,
    severity: params.severity || 'info',
  };

  const path = params.tenantId
    ? `tenants/${params.tenantId}/audit_logs/${id}`
    : `platform_audit_logs/${id}`;

  return { path, id, data };
}

/**
 * Persists an audit log entry to Firestore (append-only).
 */
export async function logAuditEvent(params: CreateAuditLogParams): Promise<void> {
  try {
    const { path, data } = buildAuditLogPayload(params);
    const docRef = doc(db, path);
    await setDoc(docRef, data);
  } catch (err) {
    // Non-blocking catch to prevent cascading failures if audit write fails
    console.warn('[AUDIT_LOG_ERROR] Failed to record audit log:', err);
  }
}

/**
 * Adds an audit log creation operation into an existing Firestore WriteBatch.
 */
export function addAuditLogToBatch(
  batch: WriteBatch,
  params: CreateAuditLogParams
): void {
  try {
    const { data } = buildAuditLogPayload(params);
    const colRef = params.tenantId
      ? collection(db, 'tenants', params.tenantId, 'audit_logs')
      : collection(db, 'platform_audit_logs');
    const newDocRef = doc(colRef, data.id);
    batch.set(newDocRef, data);
  } catch (err) {
    console.warn('[AUDIT_BATCH_ERROR] Failed to append audit log to batch:', err);
  }
}
