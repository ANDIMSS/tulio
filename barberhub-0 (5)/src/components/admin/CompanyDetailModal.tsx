import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Users,
  ShieldCheck,
  Globe,
  Settings,
  UserPlus,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { doc, collection, onSnapshot, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Tenant,
  TenantMember,
  TenantRole,
  TenantStatus,
  LicenseDurationType,
  DomainMapping,
} from '../../types/tenant';
import {
  updateCompany,
  calculateLicenseExpiry,
  assignUserToTenant,
  approveUserAndAssignTenant,
  registerCustomDomain,
  removeCustomDomain,
  removeUserFromTenant,
  deleteTenantPermanently,
} from '../../lib/tenantUtils';
import { DEFAULT_SAAS_PLANS, sanitizeSlug, normalizeHostname } from '../../lib/authUtils';
import { logAuditEvent } from '../../lib/audit';

interface CompanyDetailModalProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectAsPreview?: (tenantId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  tenantId,
  isOpen,
  onClose,
  onSelectAsPreview,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'license' | 'domains' | 'settings'>('overview');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [domains, setDomains] = useState<DomainMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [responsible, setResponsible] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<TenantStatus>('active');
  const [planId, setPlanId] = useState('professional');

  // Member form
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TenantRole>('barber');
  const [newMemberUid, setNewMemberUid] = useState('');

  // Domain form
  const [newDomainInput, setNewDomainInput] = useState('');

  useEffect(() => {
    if (!isOpen || !tenantId) return;
    setLoading(true);

    // 1. Listen to Tenant
    const unsubTenant = onSnapshot(doc(db, 'tenants', tenantId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Tenant;
        setTenant(data);
        setName(data.name || '');
        setTradeName(data.tradeName || data.name || '');
        setLegalName(data.legalName || '');
        setDocument(data.document || '');
        setPhone(data.phone || '');
        setResponsible(data.responsible || '');
        setOwnerEmail(data.ownerEmail || '');
        setSlug(data.slug || '');
        setStatus(data.status || 'active');
        setPlanId(data.planId || 'professional');
      }
      setLoading(false);
    });

    // 2. Listen to Members
    const unsubMembers = onSnapshot(collection(db, 'tenants', tenantId, 'members'), (snap) => {
      const list: TenantMember[] = [];
      snap.forEach((d) => list.push(d.data() as TenantMember));
      setMembers(list);
    });

    // 3. Listen to Domains
    const unsubDomains = onSnapshot(collection(db, 'tenants', tenantId, 'domains'), (snap) => {
      const list: DomainMapping[] = [];
      snap.forEach((d) => list.push(d.data() as DomainMapping));
      setDomains(list);
    });

    return () => {
      unsubTenant();
      unsubMembers();
      unsubDomains();
    };
  }, [isOpen, tenantId]);

  if (!isOpen) return null;

  const handleSaveOverview = async () => {
    try {
      setSaving(true);
      await updateCompany(tenantId, {
        name,
        tradeName,
        legalName,
        document,
        phone,
        responsible,
        ownerEmail,
        slug: sanitizeSlug(slug),
        status,
        planId,
      });

      await logAuditEvent({
        tenantId,
        action: 'tenant.updated',
        module: 'tenant',
        targetType: 'tenant',
        targetId: tenantId,
        description: `Informações da empresa "${name}" atualizadas`,
        metadata: { name, tradeName, status, planId },
        severity: 'info',
      });

      onShowToast('Informações da empresa salvas com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      onShowToast(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLicense = async (duration: LicenseDurationType) => {
    try {
      setSaving(true);
      const now = new Date();
      const expiresAt = calculateLicenseExpiry(duration, now);

      await updateCompany(tenantId, {
        licenseStatus: 'active',
        licenseDurationType: duration,
        licenseStartedAt: now.toISOString(),
        licenseExpiresAt: expiresAt,
        licenseSetAt: now.toISOString(),
        status: 'active',
      });

      // Update owner user if exists
      if (tenant?.ownerUid) {
        await updateDoc(doc(db, 'users', tenant.ownerUid), {
          licenseExpiresAt: expiresAt,
          licenseExpiresAtTimestamp: expiresAt ? Timestamp.fromDate(new Date(expiresAt)) : null,
          licenseExpiresAtMillis: expiresAt ? new Date(expiresAt).getTime() : null,
          licenseDurationType: duration,
          licenseSetAt: now.toISOString(),
          isApproved: true,
        });
      }

      await logAuditEvent({
        tenantId,
        action: 'tenant.license_updated',
        module: 'tenant',
        targetType: 'tenant',
        targetId: tenantId,
        description: `Licença comercial atualizada para duração ${duration}`,
        metadata: { duration, expiresAt },
        severity: 'warning',
      });

      onShowToast('Licença comercial da empresa atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar licença:', err);
      onShowToast(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    try {
      setSaving(true);
      const email = newMemberEmail.trim().toLowerCase();

      // Search if user exists in 'users' collection
      let targetUid = newMemberUid.trim();
      if (!targetUid) {
        const qUser = query(collection(db, 'users'), where('email', '==', email));
        const userSnap = await getDocs(qUser);
        if (!userSnap.empty) {
          targetUid = userSnap.docs[0].id;
        }
      }

      if (targetUid) {
        await approveUserAndAssignTenant(targetUid, tenantId, newMemberRole);
        onShowToast(`Usuário ${email} vinculado e aprovado como ${newMemberRole === 'owner' ? 'Proprietário' : newMemberRole === 'manager' ? 'Gerente' : 'Barbeiro'}!`);
      } else {
        const generatedUid = `member_${Date.now()}`;
        await assignUserToTenant(generatedUid, tenantId, newMemberRole, {
          email,
          displayName: newMemberName.trim() || email.split('@')[0],
        });
        onShowToast('Membro convidado e adicionado ao tenant com sucesso!');
      }

      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberUid('');
    } catch (err: any) {
      console.error('Erro ao adicionar membro:', err);
      onShowToast(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberUid: string) => {
    if (!window.confirm('Tem certeza que deseja remover este membro da empresa? Esta ação revogará permanentemente o acesso do usuário.')) return;
    try {
      const res = await removeUserFromTenant(tenantId, memberUid);
      if (!res.success) {
        throw new Error(res.message);
      }
      onShowToast(res.message);
    } catch (err: any) {
      console.error('Erro ao remover membro:', err);
      onShowToast(`Erro: ${err.message}`);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    try {
      setSaving(true);
      const norm = normalizeHostname(newDomainInput);
      await registerCustomDomain(tenantId, norm, domains.length === 0);
      await logAuditEvent({
        tenantId,
        action: 'domain.added',
        module: 'settings',
        targetType: 'domain',
        targetId: norm,
        description: `Domínio personalizado "${norm}" registrado`,
        metadata: { domain: norm },
        severity: 'info',
      });
      setNewDomainInput('');
      onShowToast(`Domínio ${norm} registrado com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao registrar domínio:', err);
      onShowToast(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDomain = async (normDomain: string) => {
    if (!window.confirm(`Deseja remover o domínio ${normDomain}?`)) return;
    try {
      await removeCustomDomain(normDomain, tenantId);
      await logAuditEvent({
        tenantId,
        action: 'domain.removed',
        module: 'settings',
        targetType: 'domain',
        targetId: normDomain,
        description: `Domínio personalizado "${normDomain}" desvinculado`,
        metadata: { domain: normDomain },
        severity: 'warning',
      });
      onShowToast(`Domínio ${normDomain} desvinculado.`);
    } catch (err: any) {
      console.error('Erro ao remover domínio:', err);
      onShowToast(`Erro: ${err.message}`);
    }
  };

  const currentPlan = DEFAULT_SAAS_PLANS.find((p) => p.id === tenant?.planId) || DEFAULT_SAAS_PLANS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121214] border border-white/10 rounded-xl shadow-2xl text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{tenant?.tradeName || tenant?.name || 'Detalhes da Empresa'}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                    tenant?.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : tenant?.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {tenant?.status || 'active'}
                </span>
                <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                  {currentPlan.name}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span>Tenant ID: <code className="text-gray-300 font-mono">{tenantId}</code></span>
                <span>•</span>
                <span>Slug: <code className="text-gold font-mono">/{tenant?.slug}</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelectAsPreview && (
              <button
                onClick={() => {
                  onSelectAsPreview(tenantId);
                  onShowToast(`Visualizando barbearia "${tenant?.name}"`);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-semibold hover:bg-gold hover:text-black transition-all cursor-pointer"
                title="Abrir este tenant na aplicação"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir no App</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-[#16161a] overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Building2 },
            { id: 'members', label: `Usuários & Membros (${members.length})`, icon: Users },
            { id: 'license', label: 'Licença & Plano', icon: ShieldCheck },
            { id: 'domains', label: `Domínios (${domains.length})`, icon: Globe },
            { id: 'settings', label: 'Configurações', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
              <span>Carregando dados do tenant...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: VISÃO GERAL */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Nome da Empresa</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Nome Fantasia (Exibição)</label>
                      <input
                        type="text"
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Razão Social</label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">CNPJ / CPF</label>
                      <input
                        type="text"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Nome do Responsável</label>
                      <input
                        type="text"
                        value={responsible}
                        onChange={(e) => setResponsible(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">E-mail do Proprietário</label>
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Status do Tenant</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TenantStatus)}
                        className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none cursor-pointer"
                      >
                        <option value="active">Ativo (Liberado)</option>
                        <option value="pending">Pendente (Aguardando)</option>
                        <option value="suspended">Suspenso (Bloqueado)</option>
                        <option value="expired">Expirado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/10">
                    <button
                      onClick={handleSaveOverview}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gold hover:bg-gold/90 text-black font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MEMBROS & USUÁRIOS */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  {/* Formulário de Adicionar Membro */}
                  <div className="p-4 rounded-xl bg-[#1A1A1E] border border-white/10">
                    <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> Vincular Novo Membro ao Tenant
                    </h3>
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="E-mail do usuário"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Nome / Apelido"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as TenantRole)}
                          className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                        >
                          <option value="owner">Proprietário (Owner)</option>
                          <option value="manager">Gerente (Manager)</option>
                          <option value="barber">Barbeiro / Atendente</option>
                        </select>
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Adicionar Membro</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Lista de Membros */}
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#1A1A1E] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">Membro</th>
                          <th className="px-4 py-3">E-mail</th>
                          <th className="px-4 py-3">Função (RBAC)</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {members.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                              Nenhum membro registrado ainda neste tenant.
                            </td>
                          </tr>
                        ) : (
                          members.map((m) => (
                            <tr key={m.uid} className="hover:bg-white/5">
                              <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs">
                                  {m.displayName ? m.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span>{m.displayName || 'Sem nome'}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-400">{m.email}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                    m.role === 'owner'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : m.role === 'manager'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  }`}
                                >
                                  {m.role === 'owner' ? 'Proprietário' : m.role === 'manager' ? 'Gerente' : 'Barbeiro'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="w-3 h-3" /> Ativo
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveMember(m.uid)}
                                  className="text-gray-400 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Remover membro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: LICENÇA & PLANO */}
              {activeTab === 'license' && (
                <div className="space-y-6">
                  {/* Status Atual da Licença */}
                  <div className="p-4 rounded-xl bg-[#1A1A1E] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">
                        Status da Licença Comercial
                      </h4>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <span>Plano: {currentPlan.name}</span>
                        <span>•</span>
                        <span>
                          Expira em:{' '}
                          {tenant?.licenseExpiresAt
                            ? new Date(tenant.licenseExpiresAt).toLocaleDateString('pt-BR')
                            : 'Licença Vitalícia'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleUpdateLicense('3_months')}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white hover:bg-gold hover:text-black transition-all cursor-pointer"
                      >
                        + 3 Meses
                      </button>
                      <button
                        onClick={() => handleUpdateLicense('6_months')}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white hover:bg-gold hover:text-black transition-all cursor-pointer"
                      >
                        + 6 Meses
                      </button>
                      <button
                        onClick={() => handleUpdateLicense('12_months')}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs text-gold hover:bg-gold hover:text-black transition-all cursor-pointer font-semibold"
                      >
                        + 12 Meses (Anual)
                      </button>
                      <button
                        onClick={() => handleUpdateLicense('lifetime')}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer font-bold"
                      >
                        Vitalício
                      </button>
                    </div>
                  </div>

                  {/* Seleção de Plano */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Recursos do Plano Atual
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {DEFAULT_SAAS_PLANS.map((p) => {
                        const isSelected = p.id === tenant?.planId;
                        return (
                          <div
                            key={p.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/10'
                                : 'bg-[#1A1A1E] border-white/10 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-sm text-white">{p.name}</h5>
                              {p.badge && (
                                <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{p.description}</p>
                            <div className="text-lg font-bold text-white mb-3">
                              R$ {p.priceMonthly.toFixed(2)}{' '}
                              <span className="text-xs font-normal text-gray-400">/mês</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-gray-300 mb-4">
                              {p.features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-gold flex-shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                            {!isSelected && (
                              <button
                                onClick={async () => {
                                  try {
                                    setSaving(true);
                                    await updateCompany(tenantId, { planId: p.id });
                                    onShowToast(`Plano alterado para ${p.name}!`);
                                  } catch (err: any) {
                                    onShowToast(`Erro: ${err.message}`);
                                  } finally {
                                    setSaving(false);
                                  }
                                }}
                                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-gold hover:text-black text-xs font-medium text-white transition-colors cursor-pointer"
                              >
                                Migrar para {p.name}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DOMÍNIOS */}
              {activeTab === 'domains' && (
                <div className="space-y-6">
                  {/* Adicionar Domínio */}
                  <div className="p-4 rounded-xl bg-[#1A1A1E] border border-white/10">
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Cadastrar Domínio Personalizado
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">
                      Permite que os clientes acessem a barbearia diretamente pelo domínio próprio da empresa.
                    </p>
                    <form onSubmit={handleAddDomain} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Ex: barbeariaimperial.com.br ou app.minhabarbearia.com"
                        value={newDomainInput}
                        onChange={(e) => setNewDomainInput(e.target.value)}
                        className="flex-1 bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-gold hover:bg-gold/90 text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Adicionar Domínio</span>
                      </button>
                    </form>
                  </div>

                  {/* Lista de Domínios */}
                  <div className="space-y-3">
                    {domains.length === 0 ? (
                      <div className="p-6 rounded-xl border border-white/10 bg-[#1A1A1E] text-center text-gray-400 text-xs">
                        Nenhum domínio personalizado configurado para esta empresa. O acesso é feito através do slug padrão: <code className="text-gold">/{tenant?.slug}</code>
                      </div>
                    ) : (
                      domains.map((dom) => (
                        <div
                          key={dom.normalizedDomain}
                          className="p-4 rounded-xl border border-white/10 bg-[#1A1A1E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-white">{dom.normalizedDomain}</h5>
                                {dom.primary && (
                                  <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">
                                    Principal
                                  </span>
                                )}
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Ativo
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Apontamento DNS: Entrada CNAME direcionada para <code className="text-gray-200">cname.barbearia-saas.com</code>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveDomain(dom.normalizedDomain)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Desvincular</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CONFIGURAÇÕES */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">
                      Slug & Identificação da URL
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      O slug é o endereço único de acesso na plataforma quando a empresa não utiliza domínio próprio.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500 mr-1 select-none">https://seusite.com/</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                          className="flex-1 bg-transparent text-sm text-gold outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSaveOverview}
                        disabled={saving}
                        className="px-4 py-2 bg-gold hover:bg-gold/90 text-black text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Atualizar Slug
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone: Excluir Empresa */}
                  <div className="pt-6 border-t border-rose-500/20">
                    <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      Zona de Perigo: Excluir Empresa
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">
                      A exclusão de empresa removerá todas as subcoleções (membros, serviços, barbeiros, agendamentos, leads, configurações, domínios e marcações públicas). Usuários vinculados terão acesso revogado. Esta ação é definitiva e irreversível.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmText('');
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir Esta Empresa
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação Forte: Digite EXCLUIR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#16161A] border border-rose-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Excluir Empresa Definitivamente</h3>
                <p className="text-xs text-gray-400">Ação irreversível de administrador Master</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Você está prestes a apagar completamente os dados da empresa <strong className="text-white font-semibold">{tenant?.name}</strong>. Todas as subcoleções e vínculos serão excluídos permanentemente.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-400">
                Para confirmar, digite exatamente <strong className="text-rose-400">EXCLUIR</strong> abaixo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="EXCLUIR"
                className="w-full bg-[#121214] border border-rose-500/30 focus:border-rose-500 text-sm text-white px-3 py-2 rounded-lg outline-none uppercase font-mono tracking-wider"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingCompany}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim() !== 'EXCLUIR' || isDeletingCompany}
                onClick={async () => {
                  if (deleteConfirmText.trim() !== 'EXCLUIR') return;
                  setIsDeletingCompany(true);
                  try {
                    const res = await deleteTenantPermanently(tenantId);
                    if (res.success) {
                      onShowToast('Empresa excluída com sucesso.');
                      setShowDeleteModal(false);
                      onClose();
                    } else {
                      onShowToast('Erro: ' + res.message);
                    }
                  } catch (err: any) {
                    onShowToast('Falha ao excluir empresa: ' + err.message);
                  } finally {
                    setIsDeletingCompany(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30"
              >
                {isDeletingCompany ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirmar Exclusão
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
