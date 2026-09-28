import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Crown,
  Phone,
  Calendar,
  MessageCircle,
  Tag,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
  Scissors
} from 'lucide-react';
import { CrmClientProfile, CrmLead, CrmStage, CRM_STAGES } from '../../types/crm';

interface CrmModuleProps {
  clientProfiles: CrmClientProfile[];
  professionals: any[];
  services: any[];
  onSaveLead: (lead: Partial<CrmLead> & { name: string; phone: string }) => Promise<void>;
  onUpdateStage: (leadId: string, stage: CrmStage, logChange?: boolean) => Promise<void>;
  onAddContactLog?: (leadId: string, type: any, description: string) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
  onDeleteClient: (phoneOrId: string) => Promise<void>;
  initialFilter?: string;
  initialSelectedPhone?: string | null;
  canWriteCrm?: boolean;
  canDeleteCrm?: boolean;
}

const COMMON_BARBERSHOP_PLANS = [
  'Clube VIP Cabelo & Barba',
  'Plano Executivo Premium',
  'Passaporte Semanal Cabelo',
  'Combo Semanal Cabelo + Barba',
  'Plano Semanal Executivo VIP',
  'Clube Bronze',
  'Clube Prata',
  'Clube Ouro'
];

export const CrmModule: React.FC<CrmModuleProps> = ({
  clientProfiles = [],
  professionals = [],
  onSaveLead,
  onUpdateStage,
  onDeleteLead,
  canWriteCrm = true,
  canDeleteCrm = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'with_plan' | 'without_plan'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CrmClientProfile | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStage, setFormStage] = useState<CrmStage>('cliente_ativo');
  const [formPlanName, setFormPlanName] = useState('');
  const [formResponsible, setFormResponsible] = useState('Geral');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openNewModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormStage('cliente_ativo');
    setFormPlanName('');
    setFormResponsible(professionals[0]?.name || 'Geral');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: CrmClientProfile) => {
    setEditingClient(client);
    setFormName(client.name || '');
    setFormPhone(client.phone || '');
    setFormEmail(client.email || '');
    setFormStage(client.stage || 'cliente_ativo');
    setFormPlanName(client.planName || '');
    setFormResponsible(client.responsible || 'Geral');
    setFormNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    try {
      setIsSaving(true);
      await onSaveLead({
        id: editingClient?.leadData?.id,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        stage: formStage,
        planName: formPlanName.trim(),
        responsible: formResponsible,
        notes: formNotes.trim()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar cliente/lead:', err);
      alert(err?.message || 'Falha ao salvar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clientProfiles.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.planName && c.planName.toLowerCase().includes(q));

      const matchStage = selectedStage === 'all' || c.stage === selectedStage;

      const matchPlan =
        planFilter === 'all' ||
        (planFilter === 'with_plan' && Boolean(c.planName && c.planName.trim())) ||
        (planFilter === 'without_plan' && (!c.planName || !c.planName.trim()));

      return matchSearch && matchStage && matchPlan;
    });
  }, [clientProfiles, searchTerm, selectedStage, planFilter]);

  const totalWithPlan = useMemo(() => {
    return clientProfiles.filter(c => c.planName && c.planName.trim()).length;
  }, [clientProfiles]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16161a] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Total de Clientes no CRM</span>
            <span className="text-2xl font-bold text-white mt-1 block">{clientProfiles.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#16161a] border border-gold/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-gold block font-medium">Clientes com Plano Cadastrado</span>
            <span className="text-2xl font-bold text-gold mt-1 block">{totalWithPlan}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#16161a] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-emerald-400 block font-medium">Atendimentos Registrados</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {clientProfiles.reduce((acc, c) => acc + (c.totalAppointments || 0), 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scissors className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, WhatsApp ou plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#16161a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-gold outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="bg-[#16161a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:border-gold outline-none cursor-pointer"
            >
              <option value="all">Todos os Planos</option>
              <option value="with_plan">⭐ Apenas Com Plano</option>
              <option value="without_plan">Sem Plano Vinculado</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-[#16161a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:border-gold outline-none cursor-pointer"
            >
              <option value="all">Todas as Etapas</option>
              {CRM_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {canWriteCrm && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-gold/20 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cliente / Plano</span>
          </button>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-[#16161a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121214] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">WhatsApp</th>
                <th className="px-4 py-3.5">Plano Cadastrado</th>
                <th className="px-4 py-3.5">Status CRM</th>
                <th className="px-4 py-3.5 text-center">Visitas</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-semibold text-white">Nenhum cliente encontrado</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Tente ajustar sua busca ou filtros.' : 'Cadastre seu primeiro cliente com plano acima.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const stageObj = CRM_STAGES.find((s) => s.id === client.stage) || CRM_STAGES[0];
                  const hasPlan = Boolean(client.planName && client.planName.trim());

                  return (
                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              hasPlan
                                ? 'bg-gold/20 text-gold border border-gold/40'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {hasPlan && (
                                <Crown className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                              )}
                            </div>
                            {client.email && (
                              <span className="text-[11px] text-gray-500 block">{client.email}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{client.phone || 'Sem telefone'}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        {hasPlan ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold font-semibold text-[11px]">
                            <Crown className="w-3 h-3" />
                            <span>{client.planName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">Nenhum plano</span>
                        )}
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${stageObj.bgColor} ${stageObj.color} ${stageObj.borderColor}`}
                        >
                          {stageObj.label}
                        </span>
                      </td>

                      {/* Total Appointments */}
                      <td className="px-4 py-3.5 text-center font-medium text-white">
                        {client.totalAppointments || 0}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {client.phone && (
                            <a
                              href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {canWriteCrm && (
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-1.5 text-gray-400 hover:text-gold transition-colors cursor-pointer"
                              title="Editar Cliente e Plano"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteCrm && client.leadData?.id && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja excluir o registro de ${client.name}?`)) {
                                  onDeleteLead(client.leadData!.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal Criar / Editar Cliente e Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#16161a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#121214]">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-white text-base">
                  {editingClient ? 'Editar Cliente & Plano Cadastrado' : 'Novo Cliente com Plano'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome do Cliente <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp / Telefone com DDD <span className="text-gold">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(88) 98888-8888"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-gold outline-none"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Usado para identificação imediata na Landing Page ao reservar horário.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Plano Cadastrado no Sistema</span>
                </label>
                <input
                  type="text"
                  list="commonPlansList"
                  placeholder="Ex: Clube VIP Cabelo & Barba"
                  value={formPlanName}
                  onChange={(e) => setFormPlanName(e.target.value)}
                  className="w-full bg-[#121214] border border-gold/40 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-gold outline-none font-medium"
                />
                <datalist id="commonPlansList">
                  {COMMON_BARBERSHOP_PLANS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Ao agendar na Landing Page, <strong>apenas este plano</strong> estará disponível para este cliente.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Etapa no CRM
                  </label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as CrmStage)}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                  >
                    {CRM_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Barbeiro Responsável
                  </label>
                  <select
                    value={formResponsible}
                    onChange={(e) => setFormResponsible(e.target.value)}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="Geral">Geral / Qualquer</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Observações / Preferências
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferência de horário, estilo de corte, etc."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formName || !formPhone}
                  className="bg-gold hover:bg-gold-light text-black font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-md shadow-gold/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
