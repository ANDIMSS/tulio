import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Globe,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { createCompanyByMaster, calculateLicenseExpiry } from '../../lib/tenantUtils';
import { LicenseDurationType } from '../../types/tenant';
import { sanitizeSlug, DEFAULT_SAAS_PLANS } from '../../lib/authUtils';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantId: string) => void;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [document, setDocument] = useState('');
  const [responsible, setResponsible] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [planId, setPlanId] = useState('professional');
  const [licenseDuration, setLicenseDuration] = useState<LicenseDurationType>('12_months');
  const [slug, setSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === sanitizeSlug(name)) {
      setSlug(sanitizeSlug(val));
    }
    if (!tradeName || tradeName === name) {
      setTradeName(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome da empresa.');
      return;
    }
    if (!ownerEmail.trim()) {
      setError('Por favor, informe o e-mail do proprietário.');
      return;
    }

    try {
      setLoading(true);
      const calculatedExpiry = calculateLicenseExpiry(licenseDuration);
      const normalizedCustomDomain = customDomain.trim() ? customDomain.trim().toLowerCase() : '';
      const normalizedSlug = slug.trim() ? sanitizeSlug(slug) : '';

      const tenantId = await createCompanyByMaster({
        name: name.trim(),
        tradeName: tradeName.trim() || name.trim(),
        legalName: legalName.trim(),
        document: document.trim(),
        responsible: responsible.trim(),
        phone: phone.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        planId,
        licenseDurationType: licenseDuration,
        licenseStartedAt: new Date().toISOString(),
        licenseExpiresAt: calculatedExpiry ?? null,
        slug: normalizedSlug,
        customDomain: normalizedCustomDomain,
      });

      onSuccess(tenantId);
      onClose();
    } catch (err: any) {
      console.error('Erro ao cadastrar empresa:', err);
      setError(err.message || 'Falha ao cadastrar a nova empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-6 text-white my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Cadastrar Nova Empresa
                <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">SaaS Multi-Tenant</span>
              </h2>
              <p className="text-xs text-gray-400">
                Provisiona um novo tenant com isolamento total, proprietário e licença ativa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <div>
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> 1. Dados da Empresa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Imperial"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Nome Fantasia (Exibição)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Imperial Barber Club"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Razão Social (Legal Name)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Barbearia Imperial LTDA"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  CNPJ ou CPF
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Identificador / Slug Único *
                </label>
                <div className="flex items-center bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 focus-within:border-gold">
                  <span className="text-xs text-gray-500 select-none mr-1">/</span>
                  <input
                    type="text"
                    required
                    placeholder="barbearia-imperial"
                    value={slug}
                    onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                    className="w-full bg-transparent text-sm text-gold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Proprietário */}
          <div>
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" /> 2. Responsável & Acesso
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  E-mail do Proprietário *
                </label>
                <input
                  type="email"
                  required
                  placeholder="joao@barbearia.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Plano e Licença */}
          <div>
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 3. Plano & Licença Comercial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Plano SaaS
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none cursor-pointer"
                >
                  {DEFAULT_SAAS_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {p.priceMonthly.toFixed(2)}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Duração da Licença Inicial
                </label>
                <select
                  value={licenseDuration}
                  onChange={(e) => setLicenseDuration(e.target.value as LicenseDurationType)}
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none cursor-pointer"
                >
                  <option value="3_months">3 Meses (Trimestral)</option>
                  <option value="6_months">6 Meses (Semestral)</option>
                  <option value="12_months">12 Meses (Anual - Recomendado)</option>
                  <option value="lifetime">Vitalício (Ilimitado)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Domínio Personalizado */}
          <div>
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> 4. Domínio Personalizado (Opcional)
            </h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Domínio Próprio da Empresa
              </label>
              <input
                type="text"
                placeholder="Ex: barbeariaimperial.com.br"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Pode ser configurado ou alterado posteriormente na aba de Domínios.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold hover:bg-gold/90 text-black font-semibold text-sm transition-all shadow-lg shadow-gold/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisionando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Empresa & Ativar Tenant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
