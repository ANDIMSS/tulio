import React, { useState } from 'react';
import {
  CheckCircle2,
  Star,
  Users,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { DEFAULT_SAAS_PLANS } from '../../lib/authUtils';
import { SaaSPlan } from '../../types/tenant';

interface PlansPanelProps {
  onShowToast: (msg: string) => void;
}

export const PlansPanel: React.FC<PlansPanelProps> = () => {
  const [plans] = useState<SaaSPlan[]>(DEFAULT_SAAS_PLANS);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-8">
      {/* Header & Billing Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Planos Comerciais SaaS & Pacotes de Licenças
            <span className="text-xs bg-gold/20 text-gold px-2.5 py-0.5 rounded-full font-semibold">
              Multi-Tenant Tiering
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Matriz de precificação, cotas de profissionais, recursos de CRM e roteamento de domínios.
          </p>
        </div>

        {/* Toggle Monthly / Yearly */}
        <div className="flex items-center bg-[#16161a] border border-white/10 rounded-xl p-1 gap-1 text-xs self-start sm:self-auto">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-gold text-black font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              billingPeriod === 'yearly'
                ? 'bg-gold text-black font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Faturamento Anual</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
              Economize 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly / 12;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border transition-all flex flex-col justify-between p-6 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#1C1C22] to-[#141418] border-gold/50 shadow-2xl shadow-gold/10'
                  : 'bg-[#16161a] border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" />
                  <span>Mais Recomendado</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] bg-white/10 text-gold px-2 py-0.5 rounded-full font-semibold">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-6 min-h-[36px]">{plan.description}</p>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400">R$</span>
                    <span className="text-3xl font-extrabold text-white">
                      {price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-gray-400">/mês</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                      Cobrado anualmente: R$ {plan.priceYearly.toFixed(2)} /ano
                    </p>
                  )}
                </div>

                {/* Core Specs */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-200">
                    <Users className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>
                      {plan.maxBarbers >= 999 ? 'Barbeiros Ilimitados' : `Até ${plan.maxBarbers} Barbeiros cadastrados`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-200">
                    <Globe className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>
                      {plan.hasCustomDomain ? 'Domínio Personalizado Próprio' : 'Subdomínio / Slug Padrão'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-200">
                    <TrendingUp className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>
                      {plan.hasCrm ? 'CRM & Alerta de Inativos' : 'Agendamentos Básicos'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Recursos Inclusos:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-semibold text-gray-300">
                  Gerenciado Centralmente pelo Master
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
