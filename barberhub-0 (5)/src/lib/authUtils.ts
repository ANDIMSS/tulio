import { SaaSPlan } from '../types/tenant';

export function sanitizeSlug(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeHostname(input?: string | null): string {
  if (!input) return '';
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.split('/')[0].split('?')[0].split('#')[0];
  domain = domain.split(':')[0];
  domain = domain.replace(/\.+$/, '');
  return domain;
}

export function canMasterAccessSystem(isSuperAdmin: boolean, tenant: any): boolean {
  if (!isSuperAdmin) return false;
  if (!tenant) return false;
  return true;
}

export function canCustomerAccessSystem(appUser: any, tenant: any, isExpired?: boolean): boolean {
  if (!appUser) return false;
  if (isExpired) return false;

  // Super admins or platform admins have full access
  if (appUser.role === 'superadmin' || appUser.platformRole === 'super_admin') {
    return true;
  }

  // Check user approval status if explicitly defined
  if (appUser.isApproved === false) {
    return false;
  }

  // Check user license expiration if defined
  if (appUser.licenseExpiresAt) {
    const expDate = new Date(appUser.licenseExpiresAt).getTime();
    if (!isNaN(expDate) && Date.now() > expDate) {
      return false;
    }
  }

  // Check tenant status
  if (tenant) {
    if (tenant.status === 'blocked' || tenant.status === 'suspended' || tenant.status === 'cancelled') {
      return false;
    }

    if (tenant.licenseExpiresAt) {
      const tenantExp = new Date(tenant.licenseExpiresAt).getTime();
      if (!isNaN(tenantExp) && Date.now() > tenantExp) {
        return false;
      }
    }

    if (tenant.licenseStatus === 'expired' || tenant.licenseStatus === 'suspended') {
      return false;
    }
  }

  return true;
}

export function resolveUserDestination(optionsOrUser: any): string {
  if (!optionsOrUser) return 'tenant';

  // Support legacy single-argument call: resolveUserDestination(user)
  if (typeof optionsOrUser === 'object' && optionsOrUser !== null) {
    if ('role' in optionsOrUser && !('currentHash' in optionsOrUser || 'tenant' in optionsOrUser || 'adminTenantMode' in optionsOrUser)) {
      if (optionsOrUser.role === 'admin' || optionsOrUser.role === 'superadmin') return 'dashboard';
      return 'site';
    }
  }

  const {
    user,
    appUser,
    tenant,
    tenantStatus,
    isSuperAdmin,
    isExpired,
    currentHash,
    adminTenantMode,
  } = optionsOrUser;

  // Master Admin route: hash #admin
  if (currentHash === '#admin') {
    return 'admin';
  }

  // If superadmin in preview or editor mode
  if (adminTenantMode && adminTenantMode !== 'none') {
    return 'tenant';
  }

  // Super Admin bypass
  if (isSuperAdmin || (user?.email && (user.email.toLowerCase() === 'conecdevce@gmail.com' || user.email.toLowerCase() === 'conectdevce@gmail.com'))) {
    return 'tenant';
  }

  // Check pending or blocked appUser
  if (appUser) {
    if (appUser.isApproved === false) {
      return 'pending';
    }
    if (appUser.status === 'blocked' || appUser.status === 'suspended') {
      return 'blocked';
    }
  }

  // Check tenant status
  if (tenant) {
    if (tenant.status === 'blocked' || tenant.status === 'suspended' || tenant.status === 'cancelled') {
      return 'blocked';
    }
    if (tenant.accessMode === 'landing_only') {
      return 'landing_only';
    }
  }

  if (tenantStatus === 'blocked') {
    return 'blocked';
  }

  if (isExpired) {
    return 'blocked';
  }

  return 'tenant';
}

export const DEFAULT_SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'basic',
    name: 'Plano Bronze',
    badge: 'Essencial',
    description: 'Ideal para profissionais autônomos e barbearias em início de jornada.',
    priceMonthly: 79.9,
    priceYearly: 767.0,
    maxBarbers: 2,
    hasCrm: false,
    hasCustomDomain: false,
    hasFinancials: true,
    popular: false,
    features: [
      'Até 2 barbeiros',
      'Agendamento online 24h',
      'Lembretes via WhatsApp',
      'Controle financeiro simplificado',
      'Subdomínio exclusivo (slug)'
    ]
  },
  {
    id: 'professional',
    name: 'Plano Prata Profissional',
    badge: 'Mais Recomendado',
    popular: true,
    description: 'Perfeito para barbearias consolidadas com foco em equipe e fidelização.',
    priceMonthly: 149.9,
    priceYearly: 1439.0,
    maxBarbers: 6,
    hasCrm: true,
    hasCustomDomain: true,
    hasFinancials: true,
    features: [
      'Até 6 barbeiros cadastrados',
      'CRM completo & clientes inativos',
      'Domínio personalizado próprio',
      'Relatórios e métricas de desempenho',
      'Controle de comissões por barbeiro',
      'Suporte prioritário via WhatsApp'
    ]
  },
  {
    id: 'enterprise',
    name: 'Plano Ouro VIP',
    badge: 'Escala & Franquia',
    description: 'Para redes de barbearias, franquias ou operações com alta demanda.',
    priceMonthly: 289.9,
    priceYearly: 2783.0,
    maxBarbers: 999,
    hasCrm: true,
    hasCustomDomain: true,
    hasFinancials: true,
    popular: false,
    features: [
      'Barbeiros ilimitados',
      'Múltiplas unidades e permissões RBAC',
      'CRM avançado com campanhas',
      'Domínio próprio com SSL gerenciado',
      'Gestão financeira e comissões avançadas',
      'Atendimento e suporte VIP'
    ]
  }
];
