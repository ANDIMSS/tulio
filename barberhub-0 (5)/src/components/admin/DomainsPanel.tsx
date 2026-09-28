import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  Server,
  Building2,
  Loader2,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DomainMapping, Tenant } from '../../types/tenant';
import { registerCustomDomain, removeCustomDomain } from '../../lib/tenantUtils';
import { normalizeHostname } from '../../lib/authUtils';

interface DomainsPanelProps {
  onShowToast: (msg: string) => void;
}

export const DomainsPanel: React.FC<DomainsPanelProps> = ({ onShowToast }) => {
  const [domains, setDomains] = useState<DomainMapping[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add domain state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    // 1. Listen to Domain Mappings
    const unsubDomains = onSnapshot(collection(db, 'domainMappings'), (snap) => {
      const list: DomainMapping[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as DomainMapping));
      setDomains(list);
      setLoading(false);
    });

    // 2. Fetch Tenants
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      const list: Tenant[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Tenant));
      setTenants(list);
    });

    return () => {
      unsubDomains();
      unsubTenants();
    };
  }, []);

  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !domainInput.trim()) {
      onShowToast('Selecione uma empresa e digite o domínio.');
      return;
    }

    try {
      setSaving(true);
      const norm = normalizeHostname(domainInput);
      await registerCustomDomain(selectedTenantId, norm, true);
      onShowToast(`Domínio "${norm}" vinculado à empresa com sucesso!`);
      setIsAddModalOpen(false);
      setDomainInput('');
      setSelectedTenantId('');
    } catch (err: any) {
      console.error('Erro ao cadastrar domínio:', err);
      onShowToast(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (mapping: DomainMapping) => {
    if (!window.confirm(`Deseja remover o domínio "${mapping.normalizedDomain}"?`)) return;
    try {
      await removeCustomDomain(mapping.normalizedDomain, mapping.tenantId);
      onShowToast(`Domínio "${mapping.normalizedDomain}" removido.`);
    } catch (err: any) {
      console.error('Erro ao remover domínio:', err);
      onShowToast(`Erro: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copiado para a área de transferência!');
  };

  const filteredDomains = domains.filter((d) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      d.domain.toLowerCase().includes(term) ||
      d.normalizedDomain.toLowerCase().includes(term) ||
      (d.tenantName && d.tenantName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with DNS Guidelines */}
      <div className="p-5 rounded-xl bg-[#16161a] border border-gold/30 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Instruções de Apontamento DNS (Multi-Tenant SaaS)
                <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">
                  Zero-Config Routing
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Para que o domínio personalizado do cliente funcione, instrua o cliente a criar o seguinte apontamento na Zona de DNS do registrador (ex: Registro.br, Cloudflare, GoDaddy):
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-black font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-gold/10 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Vincular Domínio</span>
            </button>
          </div>
        </div>

        {/* DNS Table Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-[#121214] p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-gold uppercase tracking-wider block">Entrada CNAME (Recomendado)</span>
              <span className="text-xs text-gray-300 font-mono">CNAME www ➔ cname.barbearia-saas.com</span>
            </div>
            <button
              onClick={() => copyToClipboard('cname.barbearia-saas.com')}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
              title="Copiar CNAME"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#121214] p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-gold uppercase tracking-wider block">Entrada A (Raiz @)</span>
              <span className="text-xs text-gray-300 font-mono">A @ ➔ 199.36.158.100</span>
            </div>
            <button
              onClick={() => copyToClipboard('199.36.158.100')}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
              title="Copiar IP"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por domínio ou nome da empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#16161a] border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-[#16161a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#121214] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="px-4 py-3.5">Domínio Personalizado</th>
              <th className="px-4 py-3.5">Empresa Vinculada</th>
              <th className="px-4 py-3.5">Status do Apontamento</th>
              <th className="px-4 py-3.5">Tipo</th>
              <th className="px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mb-2" />
                  <span>Carregando domínios...</span>
                </td>
              </tr>
            ) : filteredDomains.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="font-semibold text-white">Nenhum domínio personalizado cadastrado</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Clique em "Vincular Domínio" para apontar um domínio comercial a uma empresa.
                  </p>
                </td>
              </tr>
            ) : (
              filteredDomains.map((dom) => {
                const linkedTenant = tenants.find((t) => t.id === dom.tenantId);

                return (
                  <tr key={dom.normalizedDomain} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{dom.normalizedDomain}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            Destino: {dom.dnsTarget || 'cname.barbearia-saas.com'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gold" />
                        <span>{dom.tenantName || linkedTenant?.name || dom.tenantId}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Slug: /{linkedTenant?.slug || '—'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Verificado & Roteado
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-[11px] text-gray-400">
                        {dom.primary ? 'Domínio Principal' : 'Secundário / Alias'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleRemove(dom)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remover domínio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Domain */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-6 text-white">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gold" />
              Vincular Domínio Personalizado
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Selecione a empresa e digite o domínio que responderá por este tenant.
            </p>

            <form onSubmit={handleRegisterDomain} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Selecione a Empresa *
                </label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                >
                  <option value="">Selecione uma empresa...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Domínio Personalizado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: barbeariaimperial.com.br"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-gold hover:bg-gold/90 text-black font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Salvar & Ativar Roteamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
