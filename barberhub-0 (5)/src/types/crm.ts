export type CrmStage = 
  | 'novo_lead'
  | 'primeiro_contato'
  | 'em_negociacao'
  | 'agendamento_pendente'
  | 'cliente_ativo'
  | 'cliente_recorrente'
  | 'inativo'
  | 'recuperacao';

export interface CrmStageConfig {
  id: CrmStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const CRM_STAGES: CrmStageConfig[] = [
  {
    id: 'novo_lead',
    label: 'Novo Lead',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Contato recente ou primeiro cadastro'
  },
  {
    id: 'primeiro_contato',
    label: 'Primeiro Contato',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Mensagem enviada ou contato inicial realizado'
  },
  {
    id: 'em_negociacao',
    label: 'Em Negociação',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Conversando sobre serviços, pacotes ou horários'
  },
  {
    id: 'agendamento_pendente',
    label: 'Agendamento Pendente',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Aguardando confirmação de data ou horário'
  },
  {
    id: 'cliente_ativo',
    label: 'Cliente Ativo',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Já realizou atendimento recente'
  },
  {
    id: 'cliente_recorrente',
    label: 'Cliente Recorrente',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    borderColor: 'border-gold/30',
    description: 'Cliente fiel com múltiplos agendamentos'
  },
  {
    id: 'inativo',
    label: 'Inativo',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    description: 'Há 30+ dias sem realizar novo agendamento'
  },
  {
    id: 'recuperacao',
    label: 'Recuperação',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Em campanha ativa de reativação'
  }
];

export interface CrmInteractionLog {
  id: string;
  date: string;
  type: 'whatsapp' | 'call' | 'note' | 'status_change' | 'appointment' | 'recovery_alert';
  description: string;
  author?: string;
}

export interface CrmLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  stage: CrmStage;
  origin?: 'WhatsApp' | 'Instagram' | 'Site' | 'Indicação' | 'Balcão' | 'Outro' | string;
  responsible?: string;
  potentialValue?: number;
  tags?: string[];
  notes?: string;
  planName?: string;
  firstContactDate?: string;
  lastContactDate?: string;
  nextContactDate?: string;
  createdAt?: string;
  updatedAt?: string;
  interactionHistory?: CrmInteractionLog[];
}

export interface CrmClientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  leadData?: CrmLead;
  stage: CrmStage;
  origin: string;
  responsible: string;
  tags: string[];
  notes: string;
  planName?: string;
  potentialValue: number;
  firstContactDate?: string;
  lastContactDate?: string;
  nextContactDate?: string;
  
  // Computed Appointment Metrics
  appointments: any[];
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalSpent: number;
  firstAppointmentDate: string | null;
  lastAppointmentDate: string | null;
  daysSinceLastAppointment: number | null;
  isInactive30Days: boolean;
  isNewClient: boolean;
  isRecurringClient: boolean;
  hasNoAppointments: boolean;
  interactionHistory: CrmInteractionLog[];
}

export interface CrmNotification {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  daysInactive: number;
  lastAppointmentDate: string;
  createdAt: string;
  status: 'created' | 'viewed' | 'resolved';
  resolvedAt?: string;
}
