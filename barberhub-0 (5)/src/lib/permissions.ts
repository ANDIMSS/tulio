import { AppUser } from '../types/auth';
import { Tenant, TenantMember, TenantRole, Permission } from '../types/tenant';

export const ALL_PERMISSIONS: Permission[] = [
  'appointments.read',
  'appointments.write',
  'appointments.delete',
  'crm.read',
  'crm.write',
  'crm.delete',
  'finance.read',
  'finance.write',
  'finance.delete',
  'clients.read',
  'clients.write',
  'clients.delete',
  'settings.read',
  'settings.write',
  'members.read',
  'members.manage',
  'landing.read',
  'landing.write',
  'notifications.read',
  'notifications.write',
  'reports.read',
  'audit.read',
];

export const DEFAULT_ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  owner: [
    'appointments.read',
    'appointments.write',
    'appointments.delete',
    'crm.read',
    'crm.write',
    'crm.delete',
    'finance.read',
    'finance.write',
    'finance.delete',
    'clients.read',
    'clients.write',
    'clients.delete',
    'settings.read',
    'settings.write',
    'members.read',
    'members.manage',
    'landing.read',
    'landing.write',
    'notifications.read',
    'notifications.write',
    'reports.read',
    'audit.read',
  ],
  manager: [
    'appointments.read',
    'appointments.write',
    'appointments.delete',
    'crm.read',
    'crm.write',
    'crm.delete',
    'clients.read',
    'clients.write',
    'clients.delete',
    'landing.read',
    'landing.write',
    'settings.read',
    'members.read',
    'notifications.read',
    'notifications.write',
    'reports.read',
    // Note: finance.*, settings.write, members.manage require explicit permissions
  ],
  barber: [
    'appointments.read',
    'appointments.write',
    'clients.read',
    'notifications.read',
    'landing.read',
    // Note: No finance, no crm, no delete appointments, no settings.write, no members.manage
  ],
};

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'appointments',
    name: 'Agendamentos',
    description: 'Gestão da grade de horários e marcação de serviços',
    permissions: [
      { key: 'appointments.read', label: 'Visualizar agendamentos', description: 'Consultar agendamentos do tenant' },
      { key: 'appointments.write', label: 'Criar / Editar agendamentos', description: 'Agendar e alterar atendimentos' },
      { key: 'appointments.delete', label: 'Excluir / Cancelar agendamentos', description: 'Remover agendamentos da grade' },
    ],
  },
  {
    id: 'crm',
    name: 'CRM & Funil',
    description: 'Gestão de leads, funil de retenção e recuperação de clientes',
    permissions: [
      { key: 'crm.read', label: 'Visualizar CRM e Leads', description: 'Consultar status e métricas do funil' },
      { key: 'crm.write', label: 'Atualizar CRM e Leads', description: 'Mover fases e adicionar observações' },
      { key: 'crm.delete', label: 'Excluir Leads do CRM', description: 'Remover leads ou registros do funil' },
    ],
  },
  {
    id: 'finance',
    name: 'Financeiro',
    description: 'Transações, faturamento, categorias e gráficos financeiros',
    permissions: [
      { key: 'finance.read', label: 'Visualizar Financeiro', description: 'Acessar faturamento e transações' },
      { key: 'finance.write', label: 'Lançar / Editar Transações', description: 'Inserir receitas, despesas e categorias' },
      { key: 'finance.delete', label: 'Excluir Transações', description: 'Remover registros contábeis' },
    ],
  },
  {
    id: 'clients',
    name: 'Clientes',
    description: 'Base de dados e histórico de clientes cadastrados',
    permissions: [
      { key: 'clients.read', label: 'Consultar Clientes', description: 'Ver contatos e histórico de visitas' },
      { key: 'clients.write', label: 'Cadastrar / Editar Clientes', description: 'Atualizar dados de contato de clientes' },
      { key: 'clients.delete', label: 'Excluir Clientes', description: 'Arquivar ou excluir clientes da base' },
    ],
  },
  {
    id: 'settings',
    name: 'Configurações',
    description: 'Dados da barbearia, horários de funcionamento e dados de contato',
    permissions: [
      { key: 'settings.read', label: 'Visualizar Configurações', description: 'Ver configurações da empresa' },
      { key: 'settings.write', label: 'Alterar Configurações', description: 'Editar nome, telefone, horários e endereço' },
    ],
  },
  {
    id: 'members',
    name: 'Equipe & Membros',
    description: 'Gestão de usuários da barbearia e permissões de acesso',
    permissions: [
      { key: 'members.read', label: 'Visualizar Membros', description: 'Listar profissionais e equipe' },
      { key: 'members.manage', label: 'Gerenciar Membros', description: 'Adicionar, alterar e remover membros' },
    ],
  },
  {
    id: 'landing',
    name: 'Landing Page & Catálogo',
    description: 'Catálogo de serviços, profissionais, fotos e depoimentos',
    permissions: [
      { key: 'landing.read', label: 'Visualizar Landing / Catálogo', description: 'Ver serviços e diferenciais' },
      { key: 'landing.write', label: 'Editar Landing / Catálogo', description: 'Publicar e alterar serviços e equipe' },
    ],
  },
  {
    id: 'notifications',
    name: 'Notificações',
    description: 'Avisos automáticos de retorno e lembretes de clientes',
    permissions: [
      { key: 'notifications.read', label: 'Visualizar Notificações', description: 'Acessar lista de alertas' },
      { key: 'notifications.write', label: 'Disparar / Marcar Notificações', description: 'Gerenciar notificações enviadas' },
    ],
  },
  {
    id: 'reports',
    name: 'Relatórios & Métricas',
    description: 'Relatórios analíticos e indicadores de desempenho',
    permissions: [
      { key: 'reports.read', label: 'Visualizar Relatórios', description: 'Consultar relatórios e indicadores' },
    ],
  },
  {
    id: 'audit',
    name: 'Auditoria & Logs',
    description: 'Trilha de auditoria imutável e histórico de segurança',
    permissions: [
      { key: 'audit.read', label: 'Consultar Auditoria', description: 'Visualizar registros imutáveis de auditoria' },
    ],
  },
];

/**
 * Valida se um usuário possui uma permissão granular no contexto do tenant.
 */
export function hasTenantPermission(
  permission: Permission,
  user: AppUser | null,
  member: TenantMember | null,
  tenant: Tenant | null,
  isSuperAdmin: boolean = false
): boolean {
  // Super Admin da plataforma possui bypass completo
  if (isSuperAdmin || user?.platformRole === 'super_admin') {
    return true;
  }

  if (!user || !user.isApproved) {
    return false;
  }

  // Validação de expiração de licença
  if (user.licenseExpiresAt) {
    const expiresMs = new Date(user.licenseExpiresAt).getTime();
    if (!isNaN(expiresMs) && Date.now() > expiresMs) {
      return false;
    }
  }

  // Tenant precisa estar ativo
  if (tenant && (tenant.status === 'suspended' || tenant.status === 'expired' || tenant.status === 'cancelled')) {
    return false;
  }

  // Tenant Admin / Owner do tenant possui todas as permissões dentro do seu próprio tenant
  const isOwner = (tenant && tenant.ownerUid === user.uid) || member?.role === 'owner' || user.isAdmin === true;
  if (isOwner) {
    return true;
  }

  // Membro inativo não tem permissões
  if (member && member.active === false) {
    return false;
  }

  // Se o membro possuir permissões explícitas configuradas
  if (member?.permissions && Array.isArray(member.permissions)) {
    if (member.permissions.includes(permission)) {
      return true;
    }
  }

  // Fallback baseado no papel (role)
  const role: TenantRole = member?.role || 'barber';
  const defaultList = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.barber;
  return defaultList.includes(permission);
}

/**
 * Retorna todas as permissões efetivas do usuário no tenant atual
 */
export function getEffectivePermissions(
  user: AppUser | null,
  member: TenantMember | null,
  tenant: Tenant | null,
  isSuperAdmin: boolean = false
): Set<Permission> {
  const result = new Set<Permission>();
  for (const perm of ALL_PERMISSIONS) {
    if (hasTenantPermission(perm, user, member, tenant, isSuperAdmin)) {
      result.add(perm);
    }
  }
  return result;
}
