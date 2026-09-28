/**
 * BarberHub Centralized Error Handling System
 * 
 * Provides safe normalization, categorization, and localized user-friendly
 * error messages for Firebase (Auth, Firestore, Storage, App Check) and runtime errors.
 * Never leaks stack traces, secrets, database structures, or security rules to the end user.
 */

export type ErrorCategory = 
  | 'network'
  | 'permission_denied'
  | 'unauthenticated'
  | 'not_found'
  | 'already_exists'
  | 'conflict'
  | 'quota_exceeded'
  | 'storage_error'
  | 'app_check_failed'
  | 'validation'
  | 'timeout'
  | 'cancelled'
  | 'unknown';

export interface AppErrorDetails {
  category: ErrorCategory;
  userMessage: string;
  originalCode?: string;
  isRetryable: boolean;
  timestamp: string;
}

/**
 * Normalizes any unknown error into a structured AppErrorDetails object.
 */
export function normalizeAppError(error: unknown, fallbackMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.'): AppErrorDetails {
  const timestamp = new Date().toISOString();
  
  if (!error) {
    return {
      category: 'unknown',
      userMessage: fallbackMessage,
      isRetryable: false,
      timestamp,
    };
  }

  const errObj = error as any;
  const rawCode: string = String(errObj?.code || errObj?.name || '').toLowerCase();
  const rawMessage: string = String(errObj?.message || '').toLowerCase();

  // 1. Network & Offline errors
  if (
    rawCode.includes('unavailable') ||
    rawCode.includes('network') ||
    rawMessage.includes('network') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('offline') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return {
      category: 'network',
      userMessage: 'Sua conexão com a internet parece instável. Verifique sua rede e tente novamente.',
      originalCode: rawCode || 'network-offline',
      isRetryable: true,
      timestamp,
    };
  }

  // 2. Permission Denied / Authorization
  if (
    rawCode.includes('permission-denied') ||
    rawCode.includes('unauthorized') ||
    rawMessage.includes('permission') ||
    rawMessage.includes('missing or insufficient permissions')
  ) {
    return {
      category: 'permission_denied',
      userMessage: 'Você não tem permissão para realizar esta operação ou seu acesso expirou.',
      originalCode: rawCode || 'permission-denied',
      isRetryable: false,
      timestamp,
    };
  }

  // 3. Unauthenticated
  if (
    rawCode.includes('unauthenticated') ||
    rawCode.includes('auth/user-not-found') ||
    rawCode.includes('auth/id-token-expired') ||
    rawMessage.includes('unauthenticated')
  ) {
    return {
      category: 'unauthenticated',
      userMessage: 'Sessão expirada ou não autenticada. Por favor, faça login novamente.',
      originalCode: rawCode || 'unauthenticated',
      isRetryable: false,
      timestamp,
    };
  }

  // 4. Firebase App Check / Token Verification
  if (
    rawCode.includes('app-check') ||
    rawMessage.includes('app check') ||
    rawMessage.includes('appcheck')
  ) {
    return {
      category: 'app_check_failed',
      userMessage: 'Falha na verificação de segurança do navegador. Atualize a página e tente novamente.',
      originalCode: rawCode || 'app-check-failed',
      isRetryable: true,
      timestamp,
    };
  }

  // 5. Already Exists / Conflict (e.g. slot booking conflict)
  if (
    rawCode.includes('already-exists') ||
    rawMessage.includes('já existe') ||
    rawMessage.includes('acabou de ser reservado') ||
    rawMessage.includes('já está em uso') ||
    rawMessage.includes('conflito')
  ) {
    return {
      category: 'conflict',
      userMessage: errObj?.message && !errObj.message.includes('Firebase') 
        ? errObj.message 
        : 'Este item ou horário já foi reservado por outro cliente. Por favor, selecione outro horário.',
      originalCode: rawCode || 'already-exists',
      isRetryable: false,
      timestamp,
    };
  }

  // 6. Not Found
  if (
    rawCode.includes('not-found') ||
    rawMessage.includes('not found') ||
    rawMessage.includes('não encontrada') ||
    rawMessage.includes('não encontrado')
  ) {
    return {
      category: 'not_found',
      userMessage: errObj?.message && !errObj.message.includes('Firebase')
        ? errObj.message
        : 'O registro solicitado não foi encontrado no sistema.',
      originalCode: rawCode || 'not-found',
      isRetryable: false,
      timestamp,
    };
  }

  // 7. Storage Errors & File Size
  if (
    rawCode.includes('storage/unauthorized') ||
    rawCode.includes('storage/quota-exceeded') ||
    rawCode.includes('storage/invalid-format') ||
    rawMessage.includes('storage') ||
    rawMessage.includes('tamanho') ||
    rawMessage.includes('mime')
  ) {
    let msg = 'Erro no processamento do arquivo. Verifique o tamanho (máx 5MB) e formato (JPG, PNG, WebP).';
    if (rawMessage.includes('tamanho') || rawMessage.includes('excede')) {
      msg = 'O arquivo selecionado excede o tamanho máximo permitido.';
    }
    return {
      category: 'storage_error',
      userMessage: msg,
      originalCode: rawCode || 'storage-error',
      isRetryable: false,
      timestamp,
    };
  }

  // 8. Quota & Rate Limit
  if (
    rawCode.includes('resource-exhausted') ||
    rawCode.includes('quota') ||
    rawMessage.includes('quota')
  ) {
    return {
      category: 'quota_exceeded',
      userMessage: 'Limite temporário de requisições atingido. Por favor, aguarde alguns instantes antes de tentar novamente.',
      originalCode: rawCode || 'resource-exhausted',
      isRetryable: true,
      timestamp,
    };
  }

  // 9. Timeout / Deadline Exceeded
  if (
    rawCode.includes('deadline-exceeded') ||
    rawCode.includes('timeout') ||
    rawMessage.includes('timeout')
  ) {
    return {
      category: 'timeout',
      userMessage: 'O tempo limite da requisição foi excedido. Por favor, tente novamente.',
      originalCode: rawCode || 'deadline-exceeded',
      isRetryable: true,
      timestamp,
    };
  }

  // 10. Explicit Domain / Validation error with a clean message
  if (typeof errObj?.message === 'string' && errObj.message.trim() && !errObj.message.includes('FirebaseError:')) {
    return {
      category: 'validation',
      userMessage: errObj.message.trim(),
      originalCode: rawCode || 'validation-error',
      isRetryable: false,
      timestamp,
    };
  }

  return {
    category: 'unknown',
    userMessage: fallbackMessage,
    originalCode: rawCode || 'unknown-error',
    isRetryable: false,
    timestamp,
  };
}

/**
 * Returns a safe, user-friendly Portuguese message for any error.
 */
export function getFriendlyErrorMessage(error: unknown, fallbackMessage?: string): string {
  const normalized = normalizeAppError(error, fallbackMessage);
  return normalized.userMessage;
}

/**
 * Safe technical logger for debugging without exposing secrets or leaking sensitive PII.
 */
export function logTechnicalError(context: string, error: unknown, metadata?: Record<string, any>): void {
  const normalized = normalizeAppError(error);
  
  // Strip any accidental sensitive keys from metadata
  const safeMeta: Record<string, any> = {};
  if (metadata && typeof metadata === 'object') {
    for (const [key, value] of Object.entries(metadata)) {
      const lower = key.toLowerCase();
      if (!lower.includes('token') && !lower.includes('password') && !lower.includes('secret') && !lower.includes('key')) {
        safeMeta[key] = value;
      }
    }
  }

  if (process.env.NODE_ENV !== 'production' || import.meta.env.DEV) {
    console.warn(`[TECHNICAL ERROR] [${context}]`, {
      category: normalized.category,
      code: normalized.originalCode,
      message: normalized.userMessage,
      timestamp: normalized.timestamp,
      metadata: safeMeta,
      rawError: error,
    });
  } else {
    // In production, keep concise structured console output
    console.warn(`[APP ERROR] [${context}] [${normalized.category}] ${normalized.userMessage}`);
  }
}
