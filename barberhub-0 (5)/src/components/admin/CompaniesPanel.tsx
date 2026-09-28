import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
  Settings2,
  Eye,
  Edit3,
  MonitorPlay
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Tenant, TenantStatus } from '../../types/tenant';
import { CreateCompanyModal } from './CreateCompanyModal';
import { CompanyDetailModal } from './CompanyDetailModal';
import { ConfigAccessModal } from './ConfigAccessModal';
import { DEFAULT_SAAS_PLANS } from '../../lib/authUtils';

interface CompaniesPanelProps {
  onSelectAction: (tenantId: string, action: 'landing_editor' | 'landing_preview' | 'system_maintenance') => void;
  onShowToast: (msg: string) => void;
}

export const CompaniesPanel: React.FC<CompaniesPanelProps> = ({
  onSelectAction,
  onShowToast,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TenantStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [configTenant, setConfigTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'tenants'),
      (snap) => {
        const list: Tenant[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Tenant);
        });
        // Sort by createdAt desc
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setTenants(list);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao listar empresas:', err);
        setLoading(false);
        onShowToast('Erro ao carregar lista de empresas.');
      }
    );

    return () => unsub();
  }, []);

  // Metrics
  const totalCompanies = tenants.length;
  const activeCompanies = tenants.filter((t) => t.status === 'active' || (!t.status && t.licenseStatus === 'active')).length;
  const pendingCompanies = tenants.filter((t) => t.status === 'pending').length;
  const suspendedCompanies = tenants.filter((t) => t.status === 'suspended').length;
  const expiredCompanies = tenants.filter((t) => {
    if (t.status === 'expired' || t.licenseStatus === 'expired') return true;
    if (t.licenseExpiresAt && new Date().getTime() > new Date(t.licenseExpiresAt).getTime()) return true;
    return false;
  }).length;

  // Filtered List
  const filteredTenants = tenants.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.tradeName && t.tradeName.toLowerCase().includes(term)) ||
      (t.slug && t.slug.toLowerCase().includes(term)) ||
      (t.ownerEmail && t.ownerEmail.toLowerCase().includes(term)) ||
      (t.responsible && t.responsible.toLowerCase().includes(term)) ||
      (t.customDomain && t.customDomain.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-[#16161a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Empresas</span>
            <Building2 className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCompanies}</div>
          <div className="text-[11px] text-gray-500 mt-1">Tenants cadastrados</div>
        </div>

        <div className="bg-[#16161a] border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ativas</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeCompanies}</div>
          <div className="text-[11px] text-gray-500 mt-1">Em operação normal</div>
        </div>

        <div className="bg-[#16161a] border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingCompanies}</div>
          <div className="text-[11px] text-gray-500 mt-1">Aguardando liberação</div>
        </div>

        <div className="bg-[#16161a] border border-rose-500/20 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Suspensas</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{suspendedCompanies}</div>
          <div className="text-[11px] text-gray-500 mt-1">Bloqueadas pelo Master</div>
        </div>

        <div className="bg-[#16161a] border border-gray-700 rounded-xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Expiradas</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-300">{expiredCompanies}</div>
          <div className="text-[11px] text-gray-500 mt-1">Licença vencida</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, slug, e-mail, domínio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#16161a] border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:border-gold outline-none"
          />
        </div>

        {/* Status Filter Buttons & Create Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#16161a] border border-white/10 rounded-xl p-1 gap-1 text-xs">
            {(['all', 'active', 'pending', 'suspended', 'expired'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                  statusFilter === st
                    ? 'bg-gold text-black font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st === 'all' ? 'Todas' : st === 'active' ? 'Ativas' : st === 'pending' ? 'Pendentes' : st === 'suspended' ? 'Suspensas' : 'Expiradas'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-black font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-gold/10 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-[#16161a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121214] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Empresa & Slug</th>
                <th className="px-4 py-3.5">Contrato / Plano</th>
                <th className="px-4 py-3.5">Acesso</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mb-2" />
                    <span>Carregando empresas...</span>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Building2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-semibold text-white">Nenhuma empresa encontrada</p>
                    <p className="text-xs text-gray-500 mt-1">Clique em "+ Nova Empresa" para cadastrar o primeiro tenant comercial.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const plan = DEFAULT_SAAS_PLANS.find((p) => p.id === t.planId) || DEFAULT_SAAS_PLANS[1];
                  const isExpired = t.licenseExpiresAt && new Date().getTime() > new Date(t.licenseExpiresAt).getTime();
                  const effectiveStatus = isExpired ? 'expired' : t.status || 'active';

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Empresa & Slug */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-xs flex-shrink-0">
                            {t.name ? t.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm hover:text-gold cursor-pointer" onClick={() => setSelectedTenantId(t.id)}>
                              {t.tradeName || t.name}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <span>/{t.slug || t.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contrato / Plano */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-200">
                            {plan.name}
                          </span>
                          <span className={isExpired ? 'text-[10px] text-rose-400 font-semibold' : 'text-[10px] text-gray-400'}>
                            {t.licenseExpiresAt
                              ? `Vence: ${new Date(t.licenseExpiresAt).toLocaleDateString('pt-BR')}`
                              : 'Licença: Vitalícia'}
                          </span>
                        </div>
                      </td>

                      {/* Acesso */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {t.accessMode === 'full' ? (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Sistema Completo</span>
                          ) : t.accessMode === 'landing_only' ? (
                            <span className="text-[11px] text-amber-400 flex items-center gap-1"><MonitorPlay className="w-3 h-3"/> Somente Landing</span>
                          ) : (
                            <span className="text-[11px] text-rose-400 flex items-center gap-1"><XCircle className="w-3 h-3"/> Bloqueado</span>
                          )}
                          {t.masterMaintenanceEnabled && (
                            <span className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                              Manutenção Liberada
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            effectiveStatus === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : effectiveStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : effectiveStatus === 'suspended'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}
                        >
                          {effectiveStatus}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectAction(t.id, 'landing_editor')}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Editar Landing"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> <span className="text-[10px] font-medium pr-1">Landing</span>
                          </button>

                          <button
                            onClick={() => onSelectAction(t.id, 'landing_preview')}
                            className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Preview Landing"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span className="text-[10px] font-medium pr-1">Preview</span>
                          </button>

                          <button
                            onClick={() => onSelectAction(t.id, 'system_maintenance')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Acessar Sistema (Master)"
                          >
                            <Settings2 className="w-3.5 h-3.5" /> <span className="text-[10px] font-medium pr-1">Sistema</span>
                          </button>

                          <button
                            onClick={() => setConfigTenant(t)}
                            className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold text-gold hover:text-black transition-colors cursor-pointer flex items-center gap-1"
                            title="Configurar Acesso"
                          >
                            <MonitorPlay className="w-3.5 h-3.5" /> <span className="text-[10px] font-medium pr-1">Acesso</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCompanyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newId) => {
            onShowToast('Nova empresa cadastrada com sucesso!');
            setSelectedTenantId(newId);
          }}
        />
      )}

      {selectedTenantId && (
        <CompanyDetailModal
          tenantId={selectedTenantId}
          isOpen={Boolean(selectedTenantId)}
          onClose={() => setSelectedTenantId(null)}
          onShowToast={onShowToast}
        />
      )}

      {configTenant && (
        <ConfigAccessModal
          tenant={configTenant}
          isOpen={Boolean(configTenant)}
          onClose={() => setConfigTenant(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
