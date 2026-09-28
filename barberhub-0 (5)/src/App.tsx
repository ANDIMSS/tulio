import { TenantProvider, useTenant } from "./contexts/TenantContext";
import { useTenantData } from "./hooks/useTenantData";
import { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Scissors, Beer, Wind, Car, Star, Calendar, Clock,
  User, Phone, CheckCircle, ChevronRight, ChevronLeft,
  MapPin, MessageCircle, Menu, X, Award,
  Sparkles, Crown, Zap, ArrowRight, ArrowLeft, Quote,
  Lock, Settings, LogOut, LayoutDashboard, ListTodo,
  Upload, Palette, Image as ImageIcon, Save, RotateCcw, ExternalLink,
  Users, Plus, Droplets, ShoppingBag, Check, Pencil, Trash2, ShieldAlert, LogIn, Eye, AlertTriangle,
  Coffee, Wifi, Music, Shield, Heart, Tv, Gamepad2, Flame, Type, TrendingUp, Loader2,
  Video, Play, Pause, Volume2, VolumeX, Film, CreditCard
} from 'lucide-react';
import { SplitHeroTitle } from './components/SplitHeroTitle';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminPanel } from './components/AdminPanel';
import { BrandLogo } from './components/BrandLogo';
import { safeStorage, compressImage, compressLogoImage, uploadServiceImage, uploadLogoImage, uploadExperienceImage, uploadExperienceVideo, resolveVideoPlaybackUrl } from './lib/storage';
import { QuickTickerModal } from './components/QuickTickerModal';
import { useCrmData } from './hooks/useCrmData';
import { CrmModule } from './components/crm/CrmModule';
import { NotificationBell } from './components/notifications/NotificationBell';
import { FinancialGrowthChart } from './components/dashboard/FinancialGrowthChart';
import { CrmSummarySection } from './components/dashboard/CrmSummarySection';
import { resolveUserDestination, DEFAULT_SAAS_PLANS } from './lib/authUtils';
import { LandingOnlyScreen } from './components/LandingOnlyScreen';
import { PendingUserScreen, BlockedUserScreen } from './components/AccessStatusScreens';
import { LoginScreen } from './components/LoginScreen';

import heroBarberImg from './assets/images/hero_barber_1789316161757.jpg';
import barberPortraitImg from './assets/images/barber_portrait_1789316176571.jpg';
import serviceHaircutImg from './assets/images/service_haircut_1789316192410.jpg';
import serviceBeardImg from './assets/images/service_beard_1789316203652.jpg';
import serviceHairwashImg from './assets/images/service_hairwash_1789479847693.jpg';
import serviceProductsImg from './assets/images/service_products_1789479861203.jpg';

export interface ThemeDefinition {
  name: string;
  primary: string;
  secondary: string;
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  colors: Record<string, string>;
}

export const THEMES: Record<string, ThemeDefinition> = {
  gold: { 
    name: 'Noite & Ouro', 
    primary: '#111111',
    secondary: '#C9A961',
    primaryLight: '#222222',
    primaryDark: '#0A0A0A',
    secondaryLight: '#DFC089',
    secondaryDark: '#9A7F3F',
    colors: { 
      '--color-primary': '#111111',
      '--color-primary-light': '#222222',
      '--color-primary-dark': '#0A0A0A',
      '--color-secondary': '#C9A961',
      '--color-secondary-light': '#DFC089',
      '--color-secondary-dark': '#9A7F3F',
      '--color-gold': '#C9A961', 
      '--color-gold-light': '#DFC089', 
      '--color-gold-dark': '#9A7F3F',
      '--color-ink': '#0A0A0A',
      '--color-ink-light': '#141414',
      '--color-ink-surface': '#1F1F1F',
      '--color-ink-border': '#2A2A2A',
    } 
  },
  silver: { 
    name: 'Preto Ônix & Platina', 
    primary: '#101114',
    secondary: '#C7CBD1',
    primaryLight: '#1F2128',
    primaryDark: '#090A0C',
    secondaryLight: '#E2E4E8',
    secondaryDark: '#9499A1',
    colors: { 
      '--color-primary': '#101114',
      '--color-primary-light': '#1F2128',
      '--color-primary-dark': '#090A0C',
      '--color-secondary': '#C7CBD1',
      '--color-secondary-light': '#E2E4E8',
      '--color-secondary-dark': '#9499A1',
      '--color-gold': '#C7CBD1', 
      '--color-gold-light': '#E2E4E8', 
      '--color-gold-dark': '#9499A1',
      '--color-ink': '#090A0C',
      '--color-ink-light': '#101114',
      '--color-ink-surface': '#1F2128',
      '--color-ink-border': '#2D303A',
    } 
  },
  copper: { 
    name: 'Cobre & Whisky', 
    primary: '#17110D',
    secondary: '#B87333',
    primaryLight: '#2A1F18',
    primaryDark: '#0C0806',
    secondaryLight: '#D99A6C',
    secondaryDark: '#8A5A22',
    colors: { 
      '--color-primary': '#17110D',
      '--color-primary-light': '#2A1F18',
      '--color-primary-dark': '#0C0806',
      '--color-secondary': '#B87333',
      '--color-secondary-light': '#D99A6C',
      '--color-secondary-dark': '#8A5A22',
      '--color-gold': '#B87333', 
      '--color-gold-light': '#D99A6C', 
      '--color-gold-dark': '#8A5A22',
      '--color-ink': '#0C0806',
      '--color-ink-light': '#17110D',
      '--color-ink-surface': '#2A1F18',
      '--color-ink-border': '#3D2D23',
    } 
  },
  emerald: { 
    name: 'Esmeralda Imperial', 
    primary: '#102A24',
    secondary: '#C9A961',
    primaryLight: '#1C4239',
    primaryDark: '#091A16',
    secondaryLight: '#DFC089',
    secondaryDark: '#9A7F3F',
    colors: { 
      '--color-primary': '#102A24',
      '--color-primary-light': '#1C4239',
      '--color-primary-dark': '#091A16',
      '--color-secondary': '#C9A961',
      '--color-secondary-light': '#DFC089',
      '--color-secondary-dark': '#9A7F3F',
      '--color-gold': '#C9A961', 
      '--color-gold-light': '#DFC089', 
      '--color-gold-dark': '#9A7F3F',
      '--color-ink': '#091A16',
      '--color-ink-light': '#102A24',
      '--color-ink-surface': '#1C4239',
      '--color-ink-border': '#295C50',
    } 
  },
  ruby: { 
    name: 'Rubi Vintage', 
    primary: '#2A1117',
    secondary: '#B08D57',
    primaryLight: '#441E27',
    primaryDark: '#18090D',
    secondaryLight: '#CDB38B',
    secondaryDark: '#876939',
    colors: { 
      '--color-primary': '#2A1117',
      '--color-primary-light': '#441E27',
      '--color-primary-dark': '#18090D',
      '--color-secondary': '#B08D57',
      '--color-secondary-light': '#CDB38B',
      '--color-secondary-dark': '#876939',
      '--color-gold': '#B08D57', 
      '--color-gold-light': '#CDB38B', 
      '--color-gold-dark': '#876939',
      '--color-ink': '#18090D',
      '--color-ink-light': '#2A1117',
      '--color-ink-surface': '#441E27',
      '--color-ink-border': '#5C2834',
    } 
  },
  sapphire: { 
    name: 'Azul Real', 
    primary: '#101D3A',
    secondary: '#C5CBD3',
    primaryLight: '#1C3161',
    primaryDark: '#091021',
    secondaryLight: '#E0E4E8',
    secondaryDark: '#939BA5',
    colors: { 
      '--color-primary': '#101D3A',
      '--color-primary-light': '#1C3161',
      '--color-primary-dark': '#091021',
      '--color-secondary': '#C5CBD3',
      '--color-secondary-light': '#E0E4E8',
      '--color-secondary-dark': '#939BA5',
      '--color-gold': '#C5CBD3', 
      '--color-gold-light': '#E0E4E8', 
      '--color-gold-dark': '#939BA5',
      '--color-ink': '#091021',
      '--color-ink-light': '#101D3A',
      '--color-ink-surface': '#1C3161',
      '--color-ink-border': '#29437F',
    } 
  },
};

export interface BarbershopSettings {
  name: string;
  tagline: string;
  heroTitleLine1: string;
  heroTitleLine2Prefix: string;
  heroTitleHighlight: string;
  welcomeMessage: string;
  whatsappNumber: string;
  phoneDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  address: string;
  mapsUrl: string;
  theme?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  testimonialsTagline?: string;
  testimonialsTitlePrefix?: string;
  testimonialsTitleHighlight?: string;
  experienceTagline?: string;
  experienceTitlePrefix?: string;
  experienceTitleHighlight?: string;
  experienceDescription?: string;
  tickerItems?: string[];
  tickerSeparatorIcon?: string;
  tickerTheme?: 'gold' | 'dark' | 'black' | 'vintage';
  tickerSpeed?: 'slow' | 'normal' | 'fast';
  tickerFontSize?: 'xs' | 'sm' | 'base';
  showDifferentialsBelowExperiences?: boolean;
  differentialsTitle?: string;
  differentialsSubtitle?: string;
  amenityDifferentials?: AmenityDifferentialItem[];
  plansTagline?: string;
  plansTitlePrefix?: string;
  plansTitleHighlight?: string;
  plansDescription?: string;
  plansList?: BarbershopPlan[];
  weeklyPlansTagline?: string;
  weeklyPlansTitlePrefix?: string;
  weeklyPlansTitleHighlight?: string;
  weeklyPlansDescription?: string;
  weeklyPlansList?: BarbershopWeeklyPlan[];
}

export interface BarbershopPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface BarbershopWeeklyPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
}

export const DEFAULT_WEEKLY_BARBERSHOP_PLANS: BarbershopWeeklyPlan[] = [
  {
    id: 'weekly-cabelo',
    name: 'Passe Semanal Cabelo Express',
    price: 'R$ 35,00',
    period: '/ semana',
    description: 'Manutenção rápida de corte ou pezinho perfeita para eventos ou reuniões da semana.',
    features: [
      '1 Corte de Cabelo ou Pezinho',
      'Lavagem Capilar com Massagem',
      'Agendamento prioritário na semana'
    ],
    popular: false,
    badge: 'PASSE RÁPIDO',
    buttonText: 'Garantir Passe Cabelo',
    buttonLink: ''
  },
  {
    id: 'weekly-combo',
    name: 'Combo Semanal Cabelo & Barba',
    price: 'R$ 55,00',
    period: '/ semana',
    description: 'Passe semanal completo para quem precisa alinhar cabelo e barba com economia.',
    features: [
      '1 Corte de Cabelo Completo',
      '1 Desenho e Ajuste de Barba',
      '1 Cerveja ou Café Cortesia',
      'Finalização com pomada premium'
    ],
    popular: true,
    badge: 'O MAIS PROCURADO',
    buttonText: 'Garantir Combo Semanal',
    buttonLink: ''
  },
  {
    id: 'weekly-barba',
    name: 'Semanal Barba & Toalha Quente',
    price: 'R$ 39,90',
    period: '/ semana',
    description: 'Alinhamento e hidratação profunda de barba com ritual de toalha quente.',
    features: [
      '1 Modelagem de Barba Completa',
      'Ritual de Toalha Quente e Balm',
      '10% de desconto em produtos da loja'
    ],
    popular: false,
    badge: 'CUIDADO DIÁRIO',
    buttonText: 'Garantir Passe Barba',
    buttonLink: ''
  }
];

export const DEFAULT_BARBERSHOP_PLANS: BarbershopPlan[] = [
  {
    id: 'plan-barba',
    name: 'Plano Barba Cuidada',
    price: 'R$ 89,90',
    period: '/ mês',
    description: 'Ideal para o homem moderno que mantém a barba sempre alinhada e desenhada.',
    features: [
      '2 Ajustes de Barba por mês',
      'Ritual de Toalha Quente & Óleos Essenciais',
      '10% de desconto em produtos de barba',
      'Atendimento agendado sem filas'
    ],
    popular: false,
    badge: 'ECONÔMICO',
    buttonText: 'Assinar Plano Barba',
    buttonLink: ''
  },
  {
    id: 'plan-vip',
    name: 'Clube VIP Cabelo & Barba',
    price: 'R$ 149,90',
    period: '/ mês',
    description: 'O pacote completo para quem deseja visual impecável toda semana com benefícios de elite.',
    features: [
      'Cortes de Cabelo Ilimitados no mês',
      '2 Barbaterapias com hidratação profunda',
      '1 Cerveja ou Whisky cortesia por visita',
      '15% de desconto na linha de cosméticos',
      'Prioridade na reserva em finais de semana'
    ],
    popular: true,
    badge: 'MAIS POPULAR',
    buttonText: 'Garantir Vaga VIP',
    buttonLink: ''
  },
  {
    id: 'plan-executivo',
    name: 'Plano Executivo Premium',
    price: 'R$ 199,90',
    period: '/ mês',
    description: 'Experiência máxima de luxo e cuidado pessoal. Atendimento exclusivo com barbeiro master.',
    features: [
      'Cabelo & Barba Ilimitados no mês',
      'Lavatório com Massagem Capilar & Sobrancelha',
      'Lounge exclusivo com Bebidas Premium liberadas',
      '20% de desconto em todos os produtos',
      'Reserva flexível e reagendamento sem taxa'
    ],
    popular: false,
    badge: 'EXPERIÊNCIA SUPREMA',
    buttonText: 'Assinar Executivo',
    buttonLink: ''
  }
];

export interface AmenityDifferentialItem {
  id?: string;
  iconName: string;
  title: string;
  desc: string;
}

export const DEFAULT_AMENITY_DIFFERENTIALS: AmenityDifferentialItem[] = [
  { id: 'amenity-1', iconName: 'Beer', title: 'Cerveja Gelada', desc: 'Enquanto espera ou durante o atendimento, cortesia especial da casa.' },
  { id: 'amenity-2', iconName: 'Award', title: 'Profissionais Premiados', desc: 'Equipe certificada e sempre atualizada com as últimas tendências internacionais.' },
  { id: 'amenity-3', iconName: 'Flame', title: 'Toalha Quente', desc: 'Ritual tradicional com vaporização e óleos essenciais para abrir os poros.' },
  { id: 'amenity-4', iconName: 'Sparkles', title: 'Produtos Importados', desc: 'Pomadas, óleos e tônicos das melhores marcas do mercado mundial.' }
];

export const DEFAULT_TICKER_ITEMS: string[] = [
  'Corte Premium',
  'Barba com Navalha',
  'Cerveja Gelada',
  'Ambiente Climatizado',
  'Produtos Importados',
  'Estacionamento Grátis'
];

export const DEFAULT_SETTINGS: BarbershopSettings = {
  name: 'Barbearia Elite',
  tagline: 'Estilo & Tradição',
  heroTitleLine1: 'Estilo e tradição',
  heroTitleLine2Prefix: 'para o',
  heroTitleHighlight: 'homem moderno',
  welcomeMessage: 'Mais do que uma barbearia, um ritual. Experiência premium com profissionais premiados, produtos de alta qualidade e um ambiente pensado para o seu conforto.',
  whatsappNumber: '5588988150887',
  phoneDisplay: '(88) 98815-0887',
  instagramHandle: '@barbeariaelite',
  instagramUrl: 'https://instagram.com/barbeariaelite',
  address: 'Rua das Flores, Centro\nJuazeiro do Norte / CE',
  mapsUrl: 'https://maps.google.com/?q=Juazeiro+do+Norte',
  testimonialsTagline: 'O que dizem sobre nós',
  testimonialsTitlePrefix: 'Clientes que',
  testimonialsTitleHighlight: 'confiam',
  experienceTagline: 'Por que nos escolher',
  experienceTitlePrefix: 'A experiência',
  experienceTitleHighlight: 'Elite',
  experienceDescription: 'Cada detalhe é pensado para proporcionar o melhor atendimento. Na Barbearia Elite, você não é só mais um cliente — você é parte da nossa história.',
  showDifferentialsBelowExperiences: true,
  differentialsTitle: 'Comodidades',
  differentialsSubtitle: 'Mais conforto para a sua visita',
  amenityDifferentials: DEFAULT_AMENITY_DIFFERENTIALS,
  tickerItems: DEFAULT_TICKER_ITEMS,
  tickerSeparatorIcon: 'Scissors',
  tickerTheme: 'gold',
  tickerSpeed: 'normal',
  tickerFontSize: 'sm',
  plansTagline: 'Assinaturas & Clubes',
  plansTitlePrefix: 'Nossos',
  plansTitleHighlight: 'Planos',
  plansDescription: 'Garanta seu visual impecável o mês inteiro com nossos clubes de assinatura exclusivos.',
  plansList: DEFAULT_BARBERSHOP_PLANS,
};

interface Appointment {
  id: string;
  client: string;
  phone: string;
  service: string;
  serviceId?: string;
  professional: string;
  professionalId?: string;
  date: string;
  time: string;
  duration?: string;
  price?: string;
  servicePrice?: string;
  totalPrice?: string;
  paymentMethod: 'Pix' | 'Cartão' | 'Dinheiro' | 'Não definido';
  paymentStatus: 'Pago' | 'Pendente';
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
  slotId?: string;
  notes?: string;
  createdAt?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface DifferentialItem {
  id?: string;
  iconName?: string;
  title: string;
  desc: string;
  image?: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  tag?: string;
  price?: string;
  duration?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  iconName: string;
  image: string;
  duration: string;
  featured?: boolean;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  years: number | null;
}

interface AppState {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  theme: string;
  setTheme: (theme: string) => void;
  settings: BarbershopSettings;
  updateSettings: (newSettings: Partial<BarbershopSettings>) => Promise<void>;
  appointments: Appointment[];
  addAppointment: (app: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointmentPayment: (id: string, method: Appointment['paymentMethod'], status: Appointment['paymentStatus']) => void;
  updateAppointmentProfessional: (id: string, professional: string) => void;
  deleteAppointment: (id: string) => void;
  services: Service[];
  setServices: (s: Service[]) => void;
  professionals: Professional[];
  setProfessionals: (p: Professional[]) => void;
  timeSlots: string[];
  setTimeSlots: (t: string[]) => void;
  testimonials: Testimonial[];
  setTestimonials: (t: Testimonial[]) => void;
  differentials: DifferentialItem[];
  setDifferentials: (d: DifferentialItem[]) => void;
}

const AppContext = createContext<AppState>({} as AppState);

const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const ICON_MAP: Record<string, any> = {
  Scissors, Beer, Wind, Car, Star, Calendar, Clock,
  User, Phone, CheckCircle, ChevronRight, ChevronLeft,
  MapPin, MessageCircle, Menu, X, Award,
  Sparkles, Crown, Zap, ArrowRight, Quote,
  Lock, Settings, LogOut, LayoutDashboard, ListTodo,
  Upload, Palette, ImageIcon, Save, RotateCcw, ExternalLink,
  Droplets, ShoppingBag, Check, Pencil, Trash2,
  Coffee, Wifi, Music, Shield, Heart, Tv, Gamepad2, Flame
};

export const DIFFERENTIAL_ICONS = [
  { name: 'Beer', label: 'Cerveja / Bar' },
  { name: 'Award', label: 'Premiação' },
  { name: 'Wind', label: 'Climatizado' },
  { name: 'Car', label: 'Estacionamento' },
  { name: 'Coffee', label: 'Café Expresso' },
  { name: 'Scissors', label: 'Tesoura / Estilo' },
  { name: 'Sparkles', label: 'Premium / Brilho' },
  { name: 'Crown', label: 'VIP / Nobre' },
  { name: 'Zap', label: 'Agilidade / Rápido' },
  { name: 'Shield', label: 'Segurança' },
  { name: 'Clock', label: 'Pontualidade' },
  { name: 'Wifi', label: 'Wi-Fi Grátis' },
  { name: 'Music', label: 'Música Ambiente' },
  { name: 'Tv', label: 'TV / Telão' },
  { name: 'Gamepad2', label: 'Games / Lounge' },
  { name: 'Flame', label: 'Toalha Quente' },
  { name: 'Star', label: '5 Estrelas' },
  { name: 'Heart', label: 'Fidelidade' },
  { name: 'Droplets', label: 'Hidratação' },
  { name: 'ShoppingBag', label: 'Cosméticos' },
  { name: 'CheckCircle', label: 'Garantia' }
];

export const TICKER_SEPARATOR_ICONS = [
  { name: 'Scissors', label: 'Tesoura' },
  { name: 'Sparkles', label: 'Faísca / Brilho' },
  { name: 'Star', label: 'Estrela' },
  { name: 'Crown', label: 'Coroa VIP' },
  { name: 'Flame', label: 'Toalha Quente / Fogo' },
  { name: 'Award', label: 'Troféu' },
  { name: 'Beer', label: 'Cerveja' },
  { name: 'Coffee', label: 'Café Expresso' },
  { name: 'Zap', label: 'Raio' },
  { name: 'None', label: 'Sem Ícone (Apenas Espaço)' }
];

export const QUICK_TICKER_SUGGESTIONS = [
  'Toalha Quente',
  'Café Gourmet Grátis',
  'Wi-Fi 5G',
  'Atendimento VIP',
  'Chopp Artesanal',
  'Lounge com Games',
  'Barba Terapêutica',
  'Produtos Importados',
  'Manobrista Gratuito',
  'Música Selecionada'
];

export interface ServiceTypeOption {
  iconName: string;
  label: string;
  description: string;
}

export const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
  { iconName: 'Scissors', label: 'Corte de Cabelo', description: 'Cortes clássicos, modernos e degradê' },
  { iconName: 'Zap', label: 'Barba Tradicional', description: 'Navalha, toalha quente e alinhamento' },
  { iconName: 'Droplets', label: 'Lavagem de Cabelo & Hidratação', description: 'Lavatório, massagem capilar e shampoo especial' },
  { iconName: 'ShoppingBag', label: 'Venda de Produtos & Cosméticos', description: 'Pomadas modeladoras, óleos e ceras' },
  { iconName: 'Crown', label: 'Combo & Completo', description: 'Cabelo + Barba e experiências VIP' },
  { iconName: 'Sparkles', label: 'Sobrancelha & Acabamento', description: 'Design com navalha e detalhes faciais' },
  { iconName: 'Wind', label: 'Secagem & Finalização', description: 'Secador, escova e modelagem capilar' },
  { iconName: 'Clock', label: 'Serviço Express / Manutenção', description: 'Pezinho, contorno e retoque rápido' },
  { iconName: 'Beer', label: 'Bar & Confraria', description: 'Chopp, cervejas artesanais e cortesia' },
  { iconName: 'Star', label: 'Serviço Especial / VIP', description: 'Atendimento exclusivo da casa' },
  { iconName: 'Award', label: 'Tratamento & Cuidados', description: 'Platinado, pigmentação e químicas' },
];

export const PRESET_SERVICE_IMAGES = [
  {
    id: 'hairwash',
    title: 'Lavagem de Cabelo',
    subtitle: 'Lavatório & Massagem',
    url: serviceHairwashImg,
    category: 'Lavatório'
  },
  {
    id: 'products',
    title: 'Venda de Produtos',
    subtitle: 'Pomadas & Cosméticos',
    url: serviceProductsImg,
    category: 'Produtos'
  },
  {
    id: 'haircut',
    title: 'Corte de Cabelo',
    subtitle: 'Moderno & Fade',
    url: serviceHaircutImg,
    category: 'Cortes'
  },
  {
    id: 'beard',
    title: 'Barba Tradicional',
    subtitle: 'Navalha & Toalha',
    url: serviceBeardImg,
    category: 'Barba'
  },
  {
    id: 'combo',
    title: 'Combo Barbearia',
    subtitle: 'Cabelo + Barba',
    url: heroBarberImg,
    category: 'Combos'
  },
  {
    id: 'barber',
    title: 'Atendimento',
    subtitle: 'Profissional & Ritual',
    url: barberPortraitImg,
    category: 'Geral'
  }
];

/* ============== DATA ============== */
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'cabelo',
    name: 'Corte de Cabelo',
    description: 'Corte moderno ou clássico, com acabamento perfeito',
    price: 'R$ 60',
    iconName: 'Scissors',
    image: serviceHaircutImg,
    duration: '45 min'
  },
  {
    id: 'barba',
    name: 'Barba Tradicional',
    description: 'Toalha quente, navalha e produtos premium',
    price: 'R$ 50',
    iconName: 'Zap',
    image: serviceBeardImg,
    duration: '35 min'
  },
  {
    id: 'lavagem',
    name: 'Lavagem de Cabelo & Hidratação',
    description: 'Lavatório relaxante com massagem capilar, shampoo especial e hidratação profunda',
    price: 'R$ 35',
    iconName: 'Droplets',
    image: serviceHairwashImg,
    duration: '25 min'
  },
  {
    id: 'produtos',
    name: 'Venda de Produtos & Pomadas',
    description: 'Pomadas modeladoras efeito matte, óleos para barba, tônicos e ceras de alta fixação',
    price: 'A partir de R$ 45',
    iconName: 'ShoppingBag',
    image: serviceProductsImg,
    duration: '10 min'
  },
  {
    id: 'combo',
    name: 'Combo Cavalheiro',
    description: 'Cabelo + Barba, a experiência completa',
    price: 'R$ 95',
    iconName: 'Crown',
    image: heroBarberImg,
    duration: '1h 20min',
    featured: true
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha Masculina',
    description: 'Design e acabamento com navalha',
    price: 'R$ 25',
    iconName: 'Sparkles',
    image: serviceHaircutImg,
    duration: '15 min'
  }
];

export const DEFAULT_PROFESSIONALS: Professional[] = [
  { id: 'a', name: 'Rafael "Rafa" Monteiro', specialty: 'Cortes modernos & Degradês', years: 12 },
  { id: 'b', name: 'Thiago "Thi" Silva', specialty: 'Barba clássica & Navalha', years: 8 },
  { id: 'c', name: 'Lucas Almeida', specialty: 'Cortes clássicos & Vintage', years: 15 },
  { id: 'any', name: 'Qualquer Profissional', specialty: 'O primeiro disponível no horário', years: null }
];

export const DEFAULT_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

export const DEFAULT_DIFFERENTIALS: DifferentialItem[] = [
  {
    id: 'exp-corte-premium',
    title: 'Corte Premium',
    desc: 'Degradê de alta precisão com acabamento na navalha, lavagem relaxante, toalha quente e finalização com pomadas importadas.',
    image: serviceHaircutImg,
    tag: 'Mais Procurado',
    iconName: 'Scissors',
    duration: '45 min',
    price: 'R$ 50'
  },
  {
    id: 'exp-dia-do-noivo',
    title: 'Dia do Noivo',
    desc: 'Experiência VIP completa para noivos e padrinhos. Corte personalizado, barba terapia, hidratação profunda, massagem capilar e lounge exclusivo com bebidas.',
    image: heroBarberImg,
    tag: 'Experiência VIP',
    iconName: 'Crown',
    duration: '2h 30min',
    price: 'R$ 280'
  },
  {
    id: 'exp-corte-kids',
    title: 'Corte Kids',
    desc: 'Atendimento paciente, descontraído e especializado para crianças e jovens em ambiente descontraído, com todo carinho, cuidado e estilo para os pequenos.',
    image: barberPortraitImg,
    tag: 'Especial Infantil',
    iconName: 'Sparkles',
    duration: '35 min',
    price: 'R$ 40'
  }
];

export const PRESET_VIDEOS = [
  {
    label: 'Corte & Degradê na Tesoura',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-the-hair-of-a-man-with-scissors-42777-large.mp4',
    poster: serviceHaircutImg
  },
  {
    label: 'Acabamento com Máquina & Barba',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-barber-cutting-hair-with-a-machine-42784-large.mp4',
    poster: heroBarberImg
  },
  {
    label: 'Barba Terapia com Toalha & Navalha',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-client-with-a-razor-42780-large.mp4',
    poster: serviceBeardImg
  },
  {
    label: 'Lavagem & Massagem Capilar',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-barber-washing-a-clients-hair-42782-large.mp4',
    poster: serviceHairwashImg
  }
];

export function parseVideoSource(rawUrl?: string): {
  type: 'youtube' | 'vimeo' | 'direct' | null;
  embedUrl: string;
  rawUrl: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: null, embedUrl: '', rawUrl: '' };
  }
  let url = rawUrl.trim();
  if (!url) return { type: null, embedUrl: '', rawUrl: '' };

  // If user pasted an iframe embed code
  const iframeMatch = url.match(/src=["'](.*?)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  // YouTube match (watch, shorts, embed, short link)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&controls=1`,
      rawUrl: url
    };
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1`,
      rawUrl: url
    };
  }

  // Direct video file, blob, or data url
  return {
    type: 'direct',
    embedUrl: url,
    rawUrl: url
  };
}

export function ExperienceCardMedia({
  item,
  fallbackImage,
  icon: IconComponent
}: {
  item: DifferentialItem;
  fallbackImage: string;
  icon: any;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string>(() => {
    if (item.videoUrl?.startsWith('local_media:')) return '';
    return item.videoUrl || '';
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let active = true;
    if (!item.videoUrl) {
      setPlaybackUrl('');
      return;
    }
    if (item.videoUrl.startsWith('local_media:')) {
      resolveVideoPlaybackUrl(item.videoUrl).then((resolved) => {
        if (active) setPlaybackUrl(resolved);
      });
    } else {
      setPlaybackUrl(item.videoUrl);
    }
    return () => {
      active = false;
    };
  }, [item.videoUrl]);

  const hasVideoUrl = Boolean(playbackUrl && playbackUrl.trim().length > 0);
  const isVideo = (item.mediaType === 'video' || (item.mediaType !== 'image' && hasVideoUrl)) && !hasVideoError && hasVideoUrl;
  const cardImg = (item.image && typeof item.image === 'string' && item.image.trim().length > 0)
    ? item.image.trim()
    : fallbackImage;

  const parsedVideo = isVideo ? parseVideoSource(playbackUrl) : null;

  // Reset error state if video URL or media type changes
  useEffect(() => {
    setHasVideoError(false);
    setIsPlaying(true);
  }, [playbackUrl, item.mediaType]);

  // Handle direct video playback & muted autoplay
  useEffect(() => {
    if (isVideo && parsedVideo?.type === 'direct' && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // Autoplay may need user gesture if browser blocks
      });
    }
  }, [isVideo, parsedVideo?.embedUrl, isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="relative w-full h-52 sm:h-56 md:h-60 overflow-hidden bg-ink-light flex-shrink-0">
      {isVideo && parsedVideo && parsedVideo.type ? (
        parsedVideo.type === 'direct' ? (
          <div 
            className="relative w-full h-full cursor-pointer group/video"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={parsedVideo.embedUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setHasVideoError(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Ícone de pausa no centro se o vídeo estiver pausado */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-gold/90 text-ink flex items-center justify-center shadow-lg transform transition-transform group-hover/video:scale-110">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
              </div>
            )}

            {/* Controles rápidos sobre o vídeo */}
            <div 
              className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-black/70 hover:bg-gold hover:text-ink text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md active:scale-95"
                title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="w-7 h-7 rounded-full bg-black/70 hover:bg-gold hover:text-ink text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md active:scale-95"
                title={isMuted ? 'Ativar som' : 'Silenciar'}
                aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={parsedVideo.embedUrl}
            title={item.title}
            className="w-full h-full object-cover border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={cardImg}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      )}

      {/* Gradiente de sobreposição */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-surface via-transparent to-black/35 pointer-events-none"></div>

      {/* Badges superiores */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
        {isVideo && (
          <div className="bg-black/80 backdrop-blur-sm text-gold border border-gold/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <Film className="w-3 h-3 text-gold" />
            <span>Vídeo</span>
          </div>
        )}
        {item.tag && (
          <div className="bg-gold text-ink text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
            {item.tag}
          </div>
        )}
      </div>

      {/* Ícone no topo esquerdo */}
      <div className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-black/60 border border-gold/40 flex items-center justify-center text-gold shadow-md backdrop-blur-sm z-10 group-hover:bg-gold group-hover:text-ink transition-colors">
        <IconComponent className="w-4 h-4" strokeWidth={2} />
      </div>
    </div>
  );
}

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Carlos Henrique',
    role: 'Cliente há 3 anos',
    text: 'Simplesmente a melhor barbearia da região. O Rafa faz um degradê impecável e o ambiente é incomparável. Saio de lá me sentindo um novo homem toda vez.',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'André Martins',
    role: 'Cliente há 1 ano',
    text: 'Atendimento premium do início ao fim. Cerveja gelada, café de qualidade, e o Thi domina a navalha como ninguém. Preço justo pela experiência.',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'Marcelo Souza',
    role: 'Cliente há 5 anos',
    text: 'Fui cliente em diversas barbearias e nada se compara. O combo cavalheiro é ritual sagrado todo sábado. Recomendo de olhos fechados.',
    rating: 5
  }
];

/* Helper: format date to DD/MM/YYYY */
function formatDateKey(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/* Helper: normalize date string to DD/MM/YYYY */
function normalizeDateStr(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${d}/${m}/${y}`;
  }
  return dateStr.trim();
}

/* Helper: generate dates for next 60 days (including today) */
function generateDates() {
  const dates: { date: Date; day: number; weekday: string; month: string; disabled: boolean }[] = [];
  const today = new Date();
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  for (let i = 0; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    dates.push({
      date: d,
      day: d.getDate(),
      weekday: i === 0 ? 'Hoje' : weekdays[dow],
      month: months[d.getMonth()],
      disabled: dow === 0 // closed on Sundays
    });
  }
  return dates;
}

/* Helper: convert HH:MM to minutes */
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/* Helper: parse duration string (e.g. "1h 20min", "45 min") to minutes */
function parseDuration(durationStr: string): number {
  if (!durationStr) return 45;
  let total = 0;
  const lower = durationStr.toLowerCase();
  const hoursMatch = lower.match(/(\d+)\s*h/);
  if (hoursMatch) {
    total += parseInt(hoursMatch[1], 10) * 60;
  }
  const minsMatch = lower.match(/(\d+)\s*m/);
  if (minsMatch) {
    total += parseInt(minsMatch[1], 10);
  }
  return total > 0 ? total : 45;
}

/* Helper: check if appointment belongs to professional */
function matchesProfessional(appProf: string, targetProfName: string, targetProfId?: string): boolean {
  if (!appProf || !targetProfName) return false;
  const a = appProf.toLowerCase().trim().replace(/["']/g, '');
  const b = targetProfName.toLowerCase().trim().replace(/["']/g, '');
  const id = targetProfId ? targetProfId.toLowerCase().trim() : '';

  // Generic / Unassigned options do not match individual barbers
  if (
    a === 'qualquer profissional' || a === 'qualquer' || a === 'any' || 
    b === 'qualquer profissional' || b === 'qualquer' || b === 'any'
  ) {
    return false;
  }

  // Exact name or ID match
  if (a === b) return true;
  if (id && a === id) return true;

  return false;
}

/* Helper: parse price string to number */
function parsePriceNumber(priceStr: string): number {
  if (!priceStr) return 0;
  const num = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(num) || 0;
}

/* Helper: format number to BRL currency */
function formatCurrency(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Helper: real-time clock hook */
function useCurrentTime() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

/* Helper: Live Clock Component shown prominently at the top of the screen */
function LiveClock({ 
  className = '', 
  compact = false, 
  showDate = true,
  customTime
}: { 
  className?: string; 
  compact?: boolean; 
  showDate?: boolean;
  customTime?: Date;
}) {
  const currentTime = useCurrentTime();
  const now = customTime || currentTime;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  const weekdayName = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const day = String(now.getDate()).padStart(2, '0');
  const monthName = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const dateString = `${weekdayName}, ${day} ${monthName}`;

  if (compact) {
    return (
      <div 
        id="top-live-clock-compact"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/90 border border-gold/40 text-gold shadow-sm font-mono text-xs select-none ${className}`}
        title={`Relógio em Tempo Real: ${timeString} - ${dateString}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        <Clock className="w-3 h-3 text-gold shrink-0" />
        <span className="font-bold tracking-wider">{timeString}</span>
      </div>
    );
  }

  return (
    <div 
      id="top-live-clock"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-light/90 border border-gold/30 hover:border-gold/60 text-gold shadow-md shadow-black/30 font-mono text-xs transition-all select-none backdrop-blur-sm ${className}`}
      title={`Relógio Atualizado: ${timeString} - ${dateString} (Horários de hoje são filtrados a partir deste horário)`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50 shrink-0"></span>
      <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-bold text-white tracking-widest text-xs sm:text-sm">{timeString}</span>
        {showDate && (
          <>
            <span className="text-gold/50 hidden sm:inline">•</span>
            <span className="text-gray-300 text-[11px] sm:text-xs capitalize hidden sm:inline font-sans">{dateString}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* Helper: get only available slots for a professional on a given date string (YYYY-MM-DD) */
function getAvailableSlotsForProfessional(
  prof: Professional,
  dateStr: string, // YYYY-MM-DD
  timeSlots: string[],
  appointments: Appointment[],
  services: Service[],
  professionals: Professional[],
  currentTime?: Date
): { availableSlots: string[]; bookedAppointments: Appointment[] } {
  if (!dateStr) return { availableSlots: timeSlots, bookedAppointments: [] };
  const parts = dateStr.split('-');
  if (parts.length !== 3) return { availableSlots: timeSlots, bookedAppointments: [] };
  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

  const now = currentTime || new Date();
  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${todayYear}-${todayMonth}-${todayDay}`;

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const isToday = dateStr === todayDateStr;
  const isPastDay = dateStr < todayDateStr;

  const activeAppsOnDate = appointments.filter(app => 
    app.status !== 'Cancelado' && normalizeDateStr(app.date) === normalizeDateStr(formattedDate)
  );

  // If date is completely in the past, no slots are available
  if (isPastDay) {
    return { availableSlots: [], bookedAppointments: activeAppsOnDate };
  }

  if (prof.id === 'any' || prof.name.toLowerCase().includes('qualquer')) {
    const specificBarbers = professionals.filter(p => p.id !== 'any' && !p.name.toLowerCase().includes('qualquer'));
    const freeSlots = timeSlots.filter(slot => {
      const slotStart = timeToMinutes(slot);
      
      // If date is today, slot must be strictly after the current time from the clock
      if (isToday && slotStart <= currentMins) {
        return false;
      }

      const slotEnd = slotStart + 30;
      return specificBarbers.some(barber => {
        const barberApps = activeAppsOnDate.filter(app => matchesProfessional(app.professional, barber.name, barber.id));
        const hasConflict = barberApps.some(app => {
          const appStart = timeToMinutes(app.time);
          const appService = services.find(s => s.name === app.service || s.id === app.service);
          const duration = appService ? parseDuration(appService.duration) : 45;
          const appEnd = appStart + duration;
          return slotStart < appEnd && slotEnd > appStart;
        });
        return !hasConflict;
      });
    });
    return { availableSlots: freeSlots, bookedAppointments: activeAppsOnDate };
  }

  // Specific professional
  const profApps = activeAppsOnDate.filter(app => matchesProfessional(app.professional, prof.name, prof.id));
  const busyIntervals = profApps.map(app => {
    const appStart = timeToMinutes(app.time);
    const appService = services.find(s => s.name === app.service || s.id === app.service);
    const duration = appService ? parseDuration(appService.duration) : 45;
    return { start: appStart, end: appStart + duration };
  });

  const availableSlots = timeSlots.filter(slot => {
    const slotStart = timeToMinutes(slot);
    
    // If date is today, slot must be strictly after the current time from the clock
    if (isToday && slotStart <= currentMins) {
      return false;
    }

    const slotEnd = slotStart + 30;
    const isBusy = busyIntervals.some(inv => slotStart < inv.end && slotEnd > inv.start);
    return !isBusy;
  });

  return { availableSlots, bookedAppointments: profApps };
}

/* Helper: verify if a time slot is available considering duration and past times */
function isSlotAvailable(
  time: string,
  date: Date,
  serviceId: string,
  professionalId: string,
  appointments: Appointment[],
  services: Service[],
  professionals: Professional[],
  currentTime?: Date
): boolean {
  if (!date) return false;

  const now = currentTime || new Date();
  
  // 1. Block past times if the date is today (or in the past)
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const slotMins = timeToMinutes(time);
    if (slotMins <= currentMins) return false;
  } else if (
    new Date(date.getFullYear(), date.getMonth(), date.getDate()) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  ) {
    return false; // Past dates are blocked
  }

  const targetDateKey = formatDateKey(date);
  
  // Filter active appointments on the target date
  const activeAppsOnDate = appointments.filter(app => 
    app.status !== 'Cancelado' && normalizeDateStr(app.date) === targetDateKey
  );

  const newService = services.find(s => s.id === serviceId || s.name === serviceId);
  if (!newService) return false;
  
  const newStart = timeToMinutes(time);
  const newEnd = newStart + parseDuration(newService.duration);
  
  // Helper to check overlap with an existing appointment
  const checkConflict = (app: Appointment) => {
    const appService = services.find(s => s.name === app.service || s.id === app.service);
    const appDuration = appService ? parseDuration(appService.duration) : 45;
    const appStart = timeToMinutes(app.time);
    const appEnd = appStart + appDuration;
    
    return newStart < appEnd && newEnd > appStart;
  };

  const specificBarbers = professionals.filter(p => p.id !== 'any' && !p.name.toLowerCase().includes('qualquer'));

  // If "Any Professional" is selected, we need AT LEAST ONE specific barber to be free
  if (professionalId === 'any' || professionalId.toLowerCase().includes('qualquer')) {
    const freeBarber = specificBarbers.find(b => {
      const barberHasConflict = activeAppsOnDate.some(app => {
        if (matchesProfessional(app.professional, b.name, b.id)) {
          return checkConflict(app);
        }
        return false;
      });
      return !barberHasConflict;
    });
    return !!freeBarber;
  }
  
  // Specific barber selected
  const selectedProf = professionals.find(p => p.id === professionalId || p.name.toLowerCase() === professionalId.toLowerCase());
  const targetProfName = selectedProf?.name || professionalId;
  const targetProfId = selectedProf?.id;
  
  const hasConflict = activeAppsOnDate.some(app => {
    if (matchesProfessional(app.professional, targetProfName, targetProfId)) {
      return checkConflict(app);
    }
    return false;
  });

  return !hasConflict;
}

/* ============== COMPONENTS ============== */

function Navbar({
  onOpenAdminDashboard,
  onOpenLogin,
  onLogout
}: {
  onOpenAdminDashboard?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logoUrl, settings } = useContext(AppContext);
  const { user, isAdmin, signOutUser } = useAuth();
  const validLogoUrl = (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) ? logoUrl.trim() : null;

  const handleSignOut = onLogout || signOutUser;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Início', href: '#hero' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Planos', href: '#planos' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Agendar', href: '#agendar' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Contato', href: '#contato' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ink/95 backdrop-blur-md border-b border-ink-border py-2.5 sm:py-3' : 'bg-ink/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none py-3 sm:py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <a href="#hero" className="flex items-center gap-2.5 group shrink-0">
          <BrandLogo
            src={validLogoUrl}
            alt={settings.name}
            name={settings.name}
            tagline={settings.tagline}
            size="lg"
          />
        </a>

        <div className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-gray-300 hover:text-gold transition-colors font-medium tracking-wide">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-gold/20 cursor-pointer"
            >
              Agendar Horário
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* User Profile & Dashboard Navigation */}
          {user ? (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-ink-border">
              {onOpenAdminDashboard && (
                <button
                  type="button"
                  id="navbar-open-dashboard-btn"
                  onClick={onOpenAdminDashboard}
                  className="inline-flex items-center gap-1.5 bg-gold/15 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  title="Abrir o Painel da Barbearia"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Painel Operacional</span>
                </button>
              )}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuário'}
                  className="w-8 h-8 rounded-full object-cover border border-gold/40"
                  referrerPolicy="no-referrer"
                  title={`${user.displayName || user.email} (${isAdmin ? 'Administrador' : 'Licença Ativa'})`}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-ink-surface border border-gold/40 flex items-center justify-center text-xs text-gold font-bold"
                  title={user.displayName || user.email || ''}
                >
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <button
                type="button"
                id="navbar-signout-btn"
                onClick={handleSignOut}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Sair da conta"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            onOpenLogin && (
              <button
                type="button"
                id="navbar-open-login-btn"
                onClick={onOpenLogin}
                className="hidden md:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-gold" />
                <span>Entrar</span>
              </button>
            )
          )}

          <button
            className="lg:hidden text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-ink-surface transition-colors cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-ink-light/95 backdrop-blur-lg border-b border-ink-border px-5 py-4 space-y-2 shadow-2xl animate-[fadeUp_0.2s_ease-out]">
          {/* User Info in Mobile Drawer */}
          {user && (
            <div className="p-3 mb-2 rounded-lg bg-white/5 border border-ink-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuário'}
                    className="w-8 h-8 rounded-full object-cover border border-gold/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ink-surface border border-gold/40 flex items-center justify-center text-xs text-gold font-bold shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                    <span>{user.displayName || 'Usuário'}</span>
                    {isAdmin && (
                      <span className="text-[9px] px-1 py-0.2 bg-gold/20 text-gold rounded font-bold">ADMIN</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-gray-400 hover:text-red-400 rounded-md transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-gray-300 hover:text-gold py-2.5 px-3 rounded-md hover:bg-white/5 font-medium transition-colors text-sm"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#agendar"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-3 rounded-full text-sm transition-all"
            >
              Agendar Horário <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* Scroll Down Indicator Component - Floats with page and disappears at the bottom */
function ScrollDownIndicator({ 
  label = "Role para baixo" 
}: { 
  label?: string;
}) {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      
      // Oculta a seta suavemente quando o usuário estiver chegando no final da página (rodapé)
      const isNearBottom = windowHeight + scrollY >= fullHeight - 260;
      setAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const currentPos = window.scrollY || window.pageYOffset;
    const sections = ['proxima-secao', 'diferenciais', 'servicos', 'agendar', 'avaliacoes', 'localizacao'];
    let targetElement: HTMLElement | null = null;

    // Encontra a próxima seção abaixo da posição atual
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + currentPos;
        if (top > currentPos + 60) {
          targetElement = el;
          break;
        }
      }
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center transition-all duration-500 ease-out pointer-events-auto ${
        atBottom 
          ? 'opacity-0 translate-y-8 pointer-events-none scale-90' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <a
        href="#proxima-secao"
        onClick={handleScrollClick}
        aria-label={label}
        className="group flex flex-col items-center gap-1 sm:gap-1.5 p-2 rounded-full transition-all duration-300 cursor-pointer text-white/80 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95"
        title="Rolar para a próxima seção"
      >
        <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-mono text-white/60 group-hover:text-gold transition-colors duration-300 select-none drop-shadow-md">
          {label}
        </span>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 group-hover:border-gold/60 flex items-center justify-center bg-ink/80 backdrop-blur-md group-hover:bg-gold/20 transition-all duration-300 scroll-bounce shadow-xl shadow-black/60">
          {/* Chevron duplo minimalista em SVG puro */}
          <div className="flex flex-col items-center -space-y-1.5">
            <svg 
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-current transition-colors duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <svg 
              className="w-3.5 h-3.5 stroke-current opacity-60 group-hover:opacity-100 transition-all duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

function Hero() {
  const { settings } = useContext(AppContext);

  return (
    <section id="hero" className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden grain-bg pt-20 pb-16 sm:py-28 md:py-32">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroBarberImg}
          alt={settings.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover sm:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/75 to-ink"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-transparent"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-60 sm:w-80 h-60 sm:h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mx-auto lg:mx-0">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[11px] sm:text-xs tracking-[0.2em] text-gold uppercase font-medium">{settings.tagline}</span>
          </div>

          <SplitHeroTitle
            line1={settings.heroTitleLine1}
            prefix={settings.heroTitleLine2Prefix}
            highlight={settings.heroTitleHighlight}
          />

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            {settings.welcomeMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 pt-2 justify-center lg:justify-start">
            <a
              href="#agendar"
              className="group relative inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-ink font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-all hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Agendar Seu Horário
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#servicos"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-gold/50 text-white font-medium px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-all hover:bg-white/5"
            >
              Ver Serviços
            </a>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold fill-gold" />)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">+2.500 clientes satisfeitos</div>
            </div>
            <div className="w-px h-10 sm:h-12 bg-ink-border"></div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-gold">15+</div>
              <div className="text-xs sm:text-sm text-gray-400">Anos de tradição</div>
            </div>
          </div>
        </div>

        <div className="block relative mt-8 sm:mt-12 lg:mt-0 max-w-xs sm:max-w-md mx-auto lg:max-w-none w-full">
          <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-sm overflow-hidden border-2 border-gold/20 shadow-2xl shadow-black/60">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={barberPortraitImg}
              alt="Barbeiro profissional"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"></div>
          </div>
          <div className="absolute -bottom-4 -left-3 sm:-bottom-6 sm:-left-6 bg-ink-light border border-ink-border p-3.5 sm:p-5 rounded-sm shadow-2xl shadow-black/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-gold tracking-wider uppercase font-medium">Certificado</div>
                <div className="text-white font-semibold text-xs sm:text-sm">Premium Quality</div>
              </div>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-18 h-18 sm:w-24 sm:h-24 border-2 border-gold/30 rounded-full flex items-center justify-center bg-ink-light shadow-lg z-10">
            <div className="text-center">
              <div className="font-serif text-lg sm:text-2xl font-bold text-gold">4.9</div>
              <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-widest">Google</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ribbon() {
  const { settings, updateSettings } = useContext(AppContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const rawItems = settings.tickerItems && settings.tickerItems.length > 0
    ? settings.tickerItems
    : DEFAULT_TICKER_ITEMS;

  // Garantir repetição suficiente para a rolagem infinita contínua em telas largas
  let repeated = [...rawItems];
  while (repeated.length < 12) {
    repeated = [...repeated, ...rawItems];
  }
  const doubled = [...repeated, ...repeated];

  const hasIcon = settings.tickerSeparatorIcon !== 'None';
  const IconComponent = hasIcon && settings.tickerSeparatorIcon && ICON_MAP[settings.tickerSeparatorIcon]
    ? ICON_MAP[settings.tickerSeparatorIcon]
    : (hasIcon ? Scissors : null);

  const theme = settings.tickerTheme || 'gold';
  const speed = settings.tickerSpeed || 'normal';
  const fontSize = settings.tickerFontSize || 'sm';

  const themeClasses = {
    gold: 'bg-gold text-ink border-gold',
    dark: 'bg-ink-light text-gold border-gold/40 shadow-inner',
    black: 'bg-black text-white border-gold/40 shadow-inner',
    vintage: 'bg-[#221611] text-[#e5c185] border-[#8a5a22]/60 shadow-inner'
  }[theme] || 'bg-gold text-ink border-gold';

  const speedClass = {
    slow: 'marquee-slow',
    normal: 'marquee-normal',
    fast: 'marquee-fast'
  }[speed] || 'marquee-normal';

  const fontSizeClass = {
    xs: 'text-[11px] sm:text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base'
  }[fontSize] || 'text-xs sm:text-sm';

  const iconColor = theme === 'gold' 
    ? 'text-ink' 
    : (theme === 'black' ? 'text-gold' : (theme === 'vintage' ? 'text-[#c9a961]' : 'text-gold'));

  return (
    <>
      <div 
        id="proxima-secao" 
        className={`py-3.5 sm:py-4 overflow-hidden relative border-y transition-colors duration-300 group marquee-container ${themeClasses}`}
      >
        {/* Botão de Edição Rápida da Barra Rolante */}
        <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-ink/90 hover:bg-ink text-gold hover:text-white border border-gold/60 hover:border-gold px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
            title="Editar conteúdo, cores e estilo da Barra Rolante"
            aria-label="Editar Barra Rolante"
          >
            <Pencil className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span className="hidden xs:inline">Editar Barra Rolante</span>
            <span className="xs:hidden">Editar</span>
          </button>
        </div>

        <div className={`flex whitespace-nowrap ${speedClass}`}>
          {doubled.map((item, i) => (
            <div key={i} className={`flex items-center gap-5 sm:gap-6 px-5 sm:px-6 font-serif font-bold uppercase tracking-widest select-none ${fontSizeClass}`}>
              <span>{item}</span>
              {IconComponent && (
                <IconComponent 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${iconColor}`} 
                  strokeWidth={2.5} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {isEditModalOpen && (
        <QuickTickerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          settings={settings}
          updateSettings={updateSettings}
        />
      )}
    </>
  );
}

function Diferenciais({ onBook }: { onBook?: (serviceId?: string) => void }) {
  const { differentials, settings } = useContext(AppContext);
  const list = (differentials && differentials.length > 0) ? differentials : DEFAULT_DIFFERENTIALS;
  if (list.length === 0) return null;

  const fallbackImages = [serviceHaircutImg, heroBarberImg, barberPortraitImg, serviceBeardImg, serviceHairwashImg, serviceProductsImg];

  return (
    <section id="diferenciais" className="relative py-16 sm:py-24 md:py-32 bg-ink grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium">
            {settings.experienceTagline || 'Por que nos escolher'}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            {settings.experienceTitlePrefix || 'A experiência'}{' '}
            <span className="italic text-gold">{settings.experienceTitleHighlight || 'Elite'}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed whitespace-pre-line">
            {settings.experienceDescription || 'Cada detalhe é pensado para proporcionar o melhor atendimento. Na Barbearia Elite, você não é só mais um cliente — você é parte da nossa história.'}
          </p>
        </div>

        {/* 3 Cards Principais de Experiência com Imagens Médias */}
        <div className={`grid grid-cols-1 ${list.length === 1 ? 'max-w-md mx-auto' : list.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6 sm:gap-8`}>
          {list.map((d, i) => {
            const IconComponent = (d.iconName && ICON_MAP[d.iconName]) ? ICON_MAP[d.iconName] : Sparkles;
            const cardImg = (d.image && typeof d.image === 'string' && d.image.trim().length > 0)
              ? d.image.trim()
              : fallbackImages[i % fallbackImages.length];

            return (
              <div
                key={d.id || i}
                className="group vintage-card rounded-sm overflow-hidden border border-ink-border hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between shadow-xl bg-ink-surface relative"
              >
                {/* Mídia do Card (Vídeo ou Imagem) com Controles e Efeitos */}
                <ExperienceCardMedia 
                  item={d} 
                  fallbackImage={cardImg} 
                  icon={IconComponent} 
                />

                {/* Conteúdo do Card */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                      {d.desc}
                    </p>
                  </div>

                  {/* Rodapé do Card com Duração / Preço ou Ação de Agendamento */}
                  <div className="pt-3 border-t border-ink-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {d.price ? (
                        <span className="font-serif font-bold text-base sm:text-lg text-gold">{d.price}</span>
                      ) : (
                        <span className="text-xs text-gold font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Experiência Premium
                        </span>
                      )}
                      {d.duration && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 pl-2 border-l border-ink-border">
                          <Clock className="w-3 h-3 text-gold/70" /> {d.duration}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onBook) onBook();
                        else document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-white transition-colors cursor-pointer group-hover:translate-x-0.5"
                    >
                      <span>Agendar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diferenciais Clássicos & Comodidades Abaixo dos Cards Principais (Opção Configurável) */}
        {(settings.showDifferentialsBelowExperiences !== false) && (
          <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-ink-border/70">
            <div className="text-center mb-8 sm:mb-12">
              <div className="text-[10px] sm:text-xs tracking-[0.25em] text-gold uppercase mb-2 font-medium">
                {settings.differentialsSubtitle || 'Mais conforto para a sua visita'}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {settings.differentialsTitle || 'Comodidades'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {((settings.amenityDifferentials && settings.amenityDifferentials.length > 0)
                ? settings.amenityDifferentials
                : DEFAULT_AMENITY_DIFFERENTIALS
              ).map((item, idx) => {
                const AmenityIcon = (item.iconName && ICON_MAP[item.iconName]) ? ICON_MAP[item.iconName] : Sparkles;
                return (
                  <div
                    key={item.id || idx}
                    className="p-5 sm:p-6 bg-ink-surface/80 rounded-sm border border-ink-border hover:border-gold/40 transition-all duration-300 group hover:-translate-y-1 shadow-md"
                  >
                    <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-3.5 group-hover:bg-gold group-hover:text-ink transition-colors">
                      <AmenityIcon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h4 className="font-serif font-bold text-white text-base sm:text-lg mb-1.5 group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PlansSection({ onBook }: { onBook?: (serviceId?: string) => void }) {
  const { settings } = useContext(AppContext);
  const plans = (settings.plansList && settings.plansList.length > 0)
    ? settings.plansList
    : DEFAULT_BARBERSHOP_PLANS;

  const weeklyPlans = (settings.weeklyPlansList && settings.weeklyPlansList.length > 0)
    ? settings.weeklyPlansList
    : DEFAULT_WEEKLY_BARBERSHOP_PLANS;

  if (plans.length === 0 && weeklyPlans.length === 0) return null;

  const handlePlanClick = (plan: BarbershopPlan | BarbershopWeeklyPlan) => {
    if (plan.buttonLink && plan.buttonLink.trim().startsWith('http')) {
      window.open(plan.buttonLink.trim(), '_blank', 'noopener,noreferrer');
    } else {
      const cleanNumber = (settings.whatsappNumber || '5588988150887').replace(/\D/g, '');
      const msg = `Olá! Gostaria de assinar o *${plan.name}* (${plan.price}${plan.period || ''}) na ${settings.name}. Podem me orientar?`;
      const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
      if (onBook && !settings.whatsappNumber) {
        onBook();
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <section id="planos" className="relative py-16 sm:py-24 md:py-32 bg-ink-surface grain-bg border-b border-ink-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {plans.length > 0 && (
          <>
            <div className="text-center mb-12 sm:mb-16">
              <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium flex items-center justify-center gap-2">
                <Crown className="w-3.5 h-3.5 text-gold" />
                <span>{settings.plansTagline || 'Assinaturas & Clubes'}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                {settings.plansTitlePrefix || 'Nossos'}{' '}
                <span className="italic text-gold">{settings.plansTitleHighlight || 'Planos'}</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed whitespace-pre-line">
                {settings.plansDescription || 'Mantenha seu estilo impecável o mês inteiro com nossos clubes de assinatura exclusivos.'}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 sm:gap-8 items-stretch`}>
              {plans.map((plan, idx) => (
                <div
                  key={plan.id || idx}
                  className={`group relative rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-ink-light via-ink to-ink border-2 border-gold shadow-2xl shadow-gold/15 scale-[1.02]'
                      : 'bg-ink border border-ink-border hover:border-gold/50 shadow-xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-ink font-bold text-[10px] sm:text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                      <Crown className="w-3 h-3 fill-current" />
                      <span>{plan.badge || 'MAIS POPULAR'}</span>
                    </div>
                  )}

                  <div>
                    {!plan.popular && plan.badge && (
                      <div className="inline-block bg-gold/10 text-gold border border-gold/30 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3">
                        {plan.badge}
                      </div>
                    )}

                    <h3 className="font-serif text-2xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                      {plan.name}
                    </h3>
                    
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-ink-border">
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-gold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-400 text-xs sm:text-sm font-medium">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        O que está incluso:
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                          <div className="w-4 h-4 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-3.5 px-6 rounded-sm font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                      plan.popular
                        ? 'bg-gold hover:bg-gold-light text-ink shadow-gold/20'
                        : 'bg-ink-light hover:bg-gold hover:text-ink text-white border border-gold/40'
                    }`}
                  >
                    <span>{plan.buttonText || 'Assinar Plano'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sub-Seção: Pequenos Planos Semanais */}
        {weeklyPlans.length > 0 && (
          <div className={`${plans.length > 0 ? 'mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-ink-border/80' : ''}`}>
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.3em] text-gold uppercase mb-2 sm:mb-3 font-medium flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gold" />
                <span>{settings.weeklyPlansTagline || 'Flexibilidade & Economia Semanal'}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
                {settings.weeklyPlansTitlePrefix || 'Pequenos'}{' '}
                <span className="italic text-gold">{settings.weeklyPlansTitleHighlight || 'Planos Semanais'}</span>
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm font-light leading-relaxed">
                {settings.weeklyPlansDescription || 'Passes de curta duração ideais para manter seu visual impecável semana a semana com menor custo.'}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${weeklyPlans.length === 1 ? 'max-w-sm mx-auto' : weeklyPlans.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-6 items-stretch`}>
              {weeklyPlans.map((wPlan, wIdx) => (
                <div
                  key={wPlan.id || wIdx}
                  className={`group relative rounded-sm p-5 sm:p-6 bg-ink-light/80 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-lg ${
                    wPlan.popular
                      ? 'border-gold shadow-gold/10 bg-gradient-to-b from-ink-light via-ink-surface to-ink'
                      : 'border-ink-border hover:border-gold/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <span className="text-[10px] bg-gold/10 border border-gold/30 text-gold font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {wPlan.badge || 'PASSE SEMANAL'}
                      </span>
                      {wPlan.popular && (
                        <span className="text-[10px] bg-gold text-ink font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5 fill-current" />
                          <span>POPULAR</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-gold transition-colors">
                      {wPlan.name}
                    </h4>

                    <p className="text-gray-400 text-xs leading-relaxed mb-4 font-light min-h-[36px]">
                      {wPlan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-ink-border">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                        {wPlan.price}
                      </span>
                      {wPlan.period && (
                        <span className="text-gray-400 text-xs font-medium">
                          {wPlan.period}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                        Recursos inclusos:
                      </span>
                      {wPlan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanClick(wPlan)}
                    className="w-full py-2.5 px-4 rounded-sm font-bold text-xs uppercase tracking-wider bg-gold/15 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <span>{wPlan.buttonText || 'Garantir Passe Semanal'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Services({ onBook }: { onBook: (serviceId: string) => void }) {
  const { services } = useContext(AppContext);
  return (
    <section id="servicos" className="relative py-16 sm:py-24 md:py-32 bg-ink-light grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium">Nossos serviços</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Serviços & <span className="italic text-gold">Preços</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Trabalhamos apenas com produtos de primeira linha e técnicas apuradas por anos de experiência.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16 bg-ink border border-ink-border rounded-sm max-w-md mx-auto">
            <Scissors className="w-8 h-8 text-gold/60 mx-auto mb-3" />
            <p className="text-gray-300 font-medium text-sm">Nenhum serviço cadastrado no momento.</p>
            <p className="text-gray-500 text-xs mt-1">Os serviços cadastrados pelo estabelecimento aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {services.map((s) => {
            const Icon = ICON_MAP[s.iconName] || ICON_MAP.Scissors;
            return (
              <div
                key={s.id}
                className={`group relative overflow-hidden rounded-sm border transition-all duration-500 hover:-translate-y-1 ${
                  s.featured
                    ? 'border-gold bg-gradient-to-br from-gold/10 via-ink-light to-ink-light'
                    : 'border-ink-border bg-ink-surface hover:border-gold/40'
                }`}
              >
                {s.featured && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gold text-ink text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full z-10 shadow-md">
                    Mais Popular
                  </div>
                )}
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="w-full sm:w-44 md:w-48 h-44 sm:h-auto relative overflow-hidden flex-shrink-0">
                    {(() => {
                      const serviceImg = (s.image && typeof s.image === 'string' && s.image.trim().length > 0)
                        ? s.image.trim()
                        : serviceHaircutImg;
                      return (
                        <motion.img
                          initial={{ scale: 1.2, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          src={serviceImg}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-ink-surface"></div>
                  </div>
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" strokeWidth={2} />
                          </div>
                          <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-white">{s.name}</h3>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 leading-relaxed">{s.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-ink-border/50">
                      <div className="font-serif text-2xl sm:text-3xl font-bold text-gold">{s.price}</div>
                      <button
                        onClick={() => onBook(s.id)}
                        className="inline-flex items-center gap-1.5 sm:gap-2 border border-gold/50 text-gold hover:bg-gold hover:text-ink font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all"
                      >
                        Agendar
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}

function BookingWidget({ preselectedService }: { preselectedService: string | null }) {
  const currentTime = useCurrentTime();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<string>('');
  const [professional, setProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dates = useRef(generateDates()).current;

  const { addAppointment, settings, appointments, services, professionals, timeSlots } = useContext(AppContext);

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
      if (step === 1) setStep(2);
    }
  }, [preselectedService]);

  const selectedServiceObj = services.find(s => s.id === service);
  const selectedProfessionalObj = professionals.find(p => p.id === professional);

  // Filter out any time slot that is already booked for the selected professional on the selected date OR in the past if date is today
  const availableTimeSlots = selectedDate && service && professional
    ? timeSlots.filter(t => isSlotAvailable(t, selectedDate, service, professional, appointments, services, professionals, currentTime))
    : [];

  // Reset selectedTime if it is no longer available (e.g., if user changed date, professional or time slot has passed)
  useEffect(() => {
    if (selectedTime && selectedDate && service && professional) {
      const available = isSlotAvailable(selectedTime, selectedDate, service, professional, appointments, services, professionals, currentTime);
      if (!available) {
        setSelectedTime('');
      }
    }
  }, [selectedDate, service, professional, appointments, selectedTime, currentTime]);

  function generateWhatsAppMessage() {
    const dateFormatted = selectedDate
      ? `${formatDateKey(selectedDate)} (${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })})`
      : '';

    return (
      `Olá! Gostaria de agendar um horário na *${settings.name}*\n\n` +
      `*Cliente:* ${name.trim()}\n` +
      `*WhatsApp do Cliente:* ${phone.trim()}\n` +
      `*Serviço:* ${selectedServiceObj?.name} (${selectedServiceObj?.price})\n` +
      `*Profissional:* ${selectedProfessionalObj?.name}\n` +
      `*Data:* ${dateFormatted}\n` +
      `*Horário:* ${selectedTime}\n\n` +
      `Por favor, confirmem meu agendamento!`
    );
  }

  function getWhatsAppUrl() {
    const message = generateWhatsAppMessage();
    const cleanNumber = (settings.whatsappNumber || '5588988150887').replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }

  function getGoogleCalendarUrl() {
    if (!selectedDate || !selectedTime) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);

    const durationMin = parseInt(selectedServiceObj?.duration?.replace(/\D/g, '') || '45', 10);
    const end = new Date(start.getTime() + durationMin * 60000);

    const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`${selectedServiceObj?.name || 'Atendimento'} - ${settings.name}`);
    const rawAddress = String(settings.address || '');
    const details = encodeURIComponent(
      `Agendamento na ${settings.name || 'Barbearia'}\n` +
      `Serviço: ${selectedServiceObj?.name || 'Serviço'} (${selectedServiceObj?.price || ''})\n` +
      `Profissional: ${selectedProfessionalObj?.name || 'Profissional'}\n` +
      `Cliente: ${name}\n` +
      `Telefone: ${phone}\n` +
      `Endereço: ${rawAddress.replace(/\n/g, ', ')}`
    );
    const location = encodeURIComponent(rawAddress.replace(/\n/g, ', '));
    const datesParam = `${formatGCal(start)}/${formatGCal(end)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
  }

  async function handleConfirm(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isSubmitting || !name || !phone || !selectedDate || !selectedTime || !service || !professional) return;

    // Final availability check before saving
    const isAvailable = isSlotAvailable(selectedTime, selectedDate, service, professional, appointments, services, professionals, currentTime);
    if (!isAvailable) {
      alert("Desculpe, este horário acabou de ser reservado ou já passou do horário atual. Por favor, escolha outro horário disponível.");
      setSelectedTime('');
      setStep(3);
      return;
    }

    try {
      setIsSubmitting(true);
      // Save appointment to context/localStorage
      const dateFormatted = formatDateKey(selectedDate);

      await addAppointment({
        client: name.trim(),
        phone: phone.trim(),
        service: selectedServiceObj?.name || service,
        serviceId: selectedServiceObj?.id,
        professional: selectedProfessionalObj?.name || professional,
        professionalId: selectedProfessionalObj?.id,
        date: dateFormatted,
        time: selectedTime,
        paymentMethod: 'Não definido',
        paymentStatus: 'Pendente',
        status: 'Pendente'
      });

      const whatsappUrl = getWhatsAppUrl();
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erro ao salvar agendamento:", err);
      alert(err?.message || "Não foi possível concluir o agendamento. Por favor, verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetBooking() {
    setStep(1); setService(''); setProfessional(''); setSelectedDate(null);
    setSelectedTime(''); setName(''); setPhone(''); setSubmitted(false);
  }

  if (submitted) {
    const whatsappUrl = getWhatsAppUrl();

    return (
      <div className="max-w-2xl mx-auto text-center py-6 sm:py-12 px-3 sm:px-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center animate-[fadeUp_0.6s_ease-out]">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gold" strokeWidth={2} />
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Solicitação de agendamento <span className="italic text-gold">preparada!</span>
        </h3>
        <p className="text-gray-300 text-base sm:text-lg mb-2 font-light">
          Obrigado, <span className="text-gold font-semibold">{name}</span>!
        </p>
        <p className="text-gray-400 mb-6 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
          Confira os dados e envie a mensagem pelo WhatsApp para finalizar a solicitação no número <span className="text-white font-medium">{settings.phoneDisplay}</span>.
        </p>

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-all shadow-lg shadow-green-600/30 hover:scale-[1.02]"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir conversa no WhatsApp
          </a>

          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ink-light hover:bg-white/10 text-gold border border-gold/40 hover:border-gold font-bold px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" />
            Adicionar ao Google Agenda
          </a>
        </div>

        <div className="vintage-card rounded-sm p-4 sm:p-6 mb-6 sm:mb-8 text-left space-y-2.5 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm border-b border-ink-border pb-2.5 sm:pb-3">
            <span className="text-gray-400">Serviço</span>
            <span className="text-white font-semibold text-right">{selectedServiceObj?.name} — {selectedServiceObj?.price}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm border-b border-ink-border pb-2.5 sm:pb-3">
            <span className="text-gray-400">Profissional</span>
            <span className="text-white font-semibold text-right">{selectedProfessionalObj?.name}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm border-b border-ink-border pb-2.5 sm:pb-3">
            <span className="text-gray-400">Data</span>
            <span className="text-white font-semibold text-right">
              {selectedDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' })}
            </span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm border-b border-ink-border pb-2.5 sm:pb-3">
            <span className="text-gray-400">Horário</span>
            <span className="text-white font-semibold">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Destino (Barbearia)</span>
            <span className="text-gold font-semibold">{settings.phoneDisplay}</span>
          </div>
        </div>
        <button
          onClick={resetBooking}
          className="inline-flex items-center gap-2 border border-gold/50 text-gold hover:bg-gold hover:text-ink font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-all"
        >
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Responsive Progress bar */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-2 sm:mb-3 w-full">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                  step >= n ? 'bg-gold text-ink' : 'bg-ink-border text-gray-500'
                }`}
              >
                {step > n ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : n}
              </div>
              {n < 4 && (
                <div className={`flex-1 h-0.5 mx-1.5 sm:mx-3 ${step > n ? 'bg-gold' : 'bg-ink-border'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 text-center text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-gray-500">
          <span className={step >= 1 ? 'text-gold font-semibold' : ''}>Serviço</span>
          <span className={step >= 2 ? 'text-gold font-semibold' : ''}>Profissional</span>
          <span className={step >= 3 ? 'text-gold font-semibold' : ''}>Data & Hora</span>
          <span className={step >= 4 ? 'text-gold font-semibold' : ''}>Seus dados</span>
        </div>
      </div>

      <div className="vintage-card rounded-sm p-4 sm:p-6 md:p-8 lg:p-10">
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">Escolha o serviço</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-xs sm:text-sm">Selecione o serviço desejado:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {services.map(s => {
                const Icon = ICON_MAP[s.iconName] || ICON_MAP.Scissors;
                const selected = service === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setService(s.id)}
                    className={`text-left p-4 sm:p-5 rounded-sm border-2 transition-all ${
                      selected
                        ? 'border-gold bg-gold/10'
                        : 'border-ink-border bg-ink-surface hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" strokeWidth={2} />
                      </div>
                      <div className="font-serif text-lg sm:text-xl font-bold text-gold">{s.price}</div>
                    </div>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-white mb-1">{s.name}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">{s.description}</p>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.duration}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">Escolha o profissional</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-xs sm:text-sm">Você pode escolher alguém específico ou o primeiro disponível:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {professionals.map(p => {
                const selected = professional === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setProfessional(p.id)}
                    className={`text-left p-4 sm:p-5 rounded-sm border-2 transition-all ${
                      selected
                        ? 'border-gold bg-gold/10'
                        : 'border-ink-border bg-ink-surface hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-2.5 sm:mb-3">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-serif text-base sm:text-xl font-bold flex-shrink-0 ${
                        p.id === 'any' ? 'bg-ink-border text-gray-400' : 'bg-gold/15 border border-gold/30 text-gold'
                      }`}>
                        {p.id === 'any' ? <User className="w-5 h-5 sm:w-6 sm:h-6" /> : p.name.split(' ')[0][0] + (p.name.split(' ')[1]?.[0] || '')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-white text-sm sm:text-base truncate">{p.name}</h4>
                        {p.years && <div className="text-[10px] sm:text-[11px] text-gold tracking-wider uppercase">{p.years} anos de experiência</div>}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{p.specialty}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">Escolha data e horário</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-xs sm:text-sm">
              Profissional: <span className="text-gold font-semibold">{selectedProfessionalObj?.name}</span>. Selecione o melhor dia e horário:
            </p>

            <div className="mb-6 sm:mb-8">
              <h4 className="text-xs sm:text-sm font-semibold text-gold uppercase tracking-wider sm:tracking-widest mb-3 sm:mb-4">Data disponível</h4>
              <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 custom-scrollbar">
                {dates.map((d, i) => {
                  const isSelected = selectedDate?.toDateString() === d.date.toDateString();
                  return (
                    <button
                      key={i}
                      disabled={d.disabled}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex-shrink-0 w-14 sm:w-16 py-2.5 sm:py-3 rounded-sm border-2 text-center transition-all ${
                        d.disabled
                          ? 'border-ink-border bg-ink/50 text-gray-600 cursor-not-allowed opacity-40'
                          : isSelected
                          ? 'border-gold bg-gold text-ink font-semibold'
                          : 'border-ink-border bg-ink-surface text-gray-300 hover:border-gold/40'
                      }`}
                    >
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">{d.weekday}</div>
                      <div className="font-serif text-xl sm:text-2xl font-bold my-0.5 sm:my-1">{d.day}</div>
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-75">{d.month}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gold uppercase tracking-wider sm:tracking-widest">
                  Horários disponíveis
                </h4>
                {selectedDate && (
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    {availableTimeSlots.length === 1 
                      ? '1 horário livre' 
                      : `${availableTimeSlots.length} horários livres`}
                  </span>
                )}
              </div>

              {/* Informação sobre sincronização com o relógio em tempo real quando o dia for hoje */}
              {selectedDate && (
                selectedDate.getDate() === currentTime.getDate() &&
                selectedDate.getMonth() === currentTime.getMonth() &&
                selectedDate.getFullYear() === currentTime.getFullYear()
              ) && (
                <div className="flex items-center gap-2 mb-3.5 px-3.5 py-2 bg-gold/10 border border-gold/30 rounded-sm text-xs text-gold animate-[fadeUp_0.2s_ease-out]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <Clock className="w-3.5 h-3.5 shrink-0 text-gold" />
                  <span className="leading-tight">
                    Horários de <strong>Hoje</strong> sincronizados com o relógio do topo. Exibindo apenas horários disponíveis após este momento.
                  </span>
                </div>
              )}

              {!selectedDate ? (
                <div className="text-center py-8 px-4 bg-ink-surface/40 border border-ink-border rounded-sm">
                  <Calendar className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Selecione uma data acima para visualizar os horários disponíveis.
                  </p>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 px-4 bg-ink-surface/40 border border-ink-border rounded-sm">
                  <Clock className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm sm:text-base mb-1">
                    Sem horários livres para {selectedProfessionalObj?.name || 'este profissional'} nesta data.
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Todos os horários já foram agendados. Por favor, escolha outra data acima ou selecione outro profissional no passo anterior.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableTimeSlots.map(t => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`time-slot py-2.5 sm:py-3 rounded-sm border-2 text-xs sm:text-sm font-medium min-h-[44px] flex items-center justify-center transition-all ${
                          isSelected
                            ? 'selected font-bold shadow-md shadow-gold/20'
                            : 'border-ink-border bg-ink-surface text-gray-300 hover:border-gold/40'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <form onSubmit={handleConfirm}>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">Quase lá!</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-xs sm:text-sm">Preencha seus dados para confirmar o agendamento:</p>

            {/* Summary */}
            <div className="bg-ink/50 border border-ink-border rounded-sm p-3.5 sm:p-4 mb-6 sm:mb-8 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Serviço:</span>
                <span className="text-white font-semibold text-right">{selectedServiceObj?.name} — {selectedServiceObj?.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profissional:</span>
                <span className="text-white font-semibold text-right">{selectedProfessionalObj?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data:</span>
                <span className="text-white font-semibold text-right">
                  {selectedDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short' })} às {selectedTime}
                </span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    className="w-full bg-ink border-2 border-ink-border focus:border-gold outline-none rounded-sm py-3 sm:py-3.5 pl-10 sm:pl-12 pr-4 text-base text-white placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">Telefone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(88) 98888-8888"
                    autoComplete="tel"
                    className="w-full bg-ink border-2 border-ink-border focus:border-gold outline-none rounded-sm py-3 sm:py-3.5 pl-10 sm:pl-12 pr-4 text-base text-white placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="sr-only">Confirmar</button>
          </form>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-ink-border gap-3">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gold font-medium text-xs sm:text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] py-2 px-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !service) ||
                (step === 2 && !professional) ||
                (step === 3 && (!selectedDate || !selectedTime))
              }
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/20 min-h-[44px]"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              type="button"
              disabled={isSubmitting || !name || !phone}
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/20 min-h-[44px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Booking({ preselectedService }: { preselectedService: string | null }) {
  return (
    <section id="agendar" className="relative py-16 sm:py-24 md:py-32 bg-ink grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium">Agende online</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Reserve seu <span className="italic text-gold">horário</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Sem telefonemas, sem espera. Em poucos cliques você garante seu atendimento.
          </p>
        </div>
        <BookingWidget preselectedService={preselectedService} />
      </div>
    </section>
  );
}

function Testimonials() {
  const { testimonials, settings } = useContext(AppContext);
  const [idx, setIdx] = useState(0);

  const list = testimonials || [];

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length]);

  if (list.length === 0) return null;

  const currentItem = list[idx] || list[0];

  return (
    <section id="depoimentos" className="relative py-16 sm:py-24 md:py-32 bg-ink-light grain-bg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 barber-stripe h-1 opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium">
            {settings.testimonialsTagline || 'O que dizem sobre nós'}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            {settings.testimonialsTitlePrefix || 'Clientes que'}{' '}
            <span className="italic text-gold">{settings.testimonialsTitleHighlight || 'confiam'}</span>
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {list.map((t, i) => (
            <TestimonialCard key={t.id || i} t={t} />
          ))}
        </div>

        {/* Mobile carousel */}
        {currentItem && (
          <div className="md:hidden max-w-lg mx-auto">
            <TestimonialCard t={currentItem} />
            {list.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {list.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 rounded-full transition-all min-w-[8px] ${i === idx ? 'bg-gold w-7' : 'bg-ink-border w-2'}`}
                    aria-label={`Depoimento ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.name
    ? t.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'C';
  const ratingCount = Math.max(1, Math.min(5, t.rating || 5));

  return (
    <div className="testimonial-card vintage-card rounded-sm p-6 sm:p-8 relative flex flex-col justify-between h-full">
      <div>
        <Quote className="absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 text-gold/20" strokeWidth={1.5} />
        <div className="flex gap-1 mb-3 sm:mb-4">
          {[...Array(ratingCount)].map((_, i) => (
            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-gold fill-gold" />
          ))}
        </div>
        <p className="text-gray-300 leading-relaxed mb-5 sm:mb-6 font-light italic text-sm sm:text-base">
          "{t.text}"
        </p>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-ink-border mt-auto">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center font-serif font-bold text-ink text-base sm:text-lg flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-serif font-bold text-white text-sm sm:text-base truncate">{t.name}</div>
          <div className="text-[10px] sm:text-xs text-gold uppercase tracking-wider">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function LocationFooter() {
  const { settings } = useContext(AppContext);
  const cleanNumber = (settings.whatsappNumber || '5588988150887').replace(/\D/g, '');

  return (
    <section id="contato" className="relative py-16 sm:py-24 md:py-32 bg-ink grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-gold uppercase mb-3 sm:mb-4 font-medium">Onde estamos</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Venha nos <span className="italic text-gold">visitar</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Map placeholder */}
          <div className="relative rounded-sm overflow-hidden border border-ink-border min-h-[340px] sm:min-h-[400px] group flex flex-col">
            <img
              src={heroBarberImg}
              alt="Interior da barbearia"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40"></div>
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="vintage-card rounded-sm p-6 sm:p-8 max-w-sm w-full text-center bg-ink/90 backdrop-blur-md">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-2">{settings.name}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 whitespace-pre-line">
                  {settings.address}
                </p>
                <a
                  href={settings.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm transition-all shadow-lg shadow-gold/20 hover:scale-105"
                >
                  Abrir no Google Maps
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="vintage-card rounded-sm p-5 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2.5 sm:gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gold flex-shrink-0" />
                Horário de Funcionamento
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {[
                  { d: 'Segunda a Sexta', h: '09:00 — 20:00' },
                  { d: 'Sábado', h: '08:00 — 19:00' },
                  { d: 'Domingo', h: 'Fechado', closed: true }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-ink-border last:border-0">
                    <span className="text-gray-300 font-medium">{row.d}</span>
                    <span className={row.closed ? 'text-red-400 font-semibold' : 'text-gold font-semibold'}>{row.h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vintage-card rounded-sm p-5 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Entre em contato</h3>
              <div className="space-y-3 sm:space-y-4">
                <a
                  href={`https://wa.me/${cleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 group p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-all flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">WhatsApp</div>
                    <div className="text-white font-semibold group-hover:text-gold transition-colors text-sm sm:text-base truncate">
                      {settings.phoneDisplay || settings.whatsappNumber}
                    </div>
                  </div>
                </a>
                <a
                  href={settings.instagramUrl || `https://instagram.com/${String(settings.instagramHandle || 'barbeariaelite').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 group p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-400 group-hover:border-transparent transition-all flex-shrink-0">
                    <Instagram className="w-5 h-5 text-pink-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Instagram</div>
                    <div className="text-white font-semibold group-hover:text-gold transition-colors text-sm sm:text-base truncate">
                      {settings.instagramHandle || '@barbeariaelite'}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { settings, logoUrl } = useContext(AppContext);
  const validLogoUrl = (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) ? logoUrl.trim() : null;
  const cleanNumber = (settings.whatsappNumber || '5588988150887').replace(/\D/g, '');

  return (
    <footer className="bg-ink-light border-t border-ink-border py-8 sm:py-10 pb-24 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <BrandLogo
              src={validLogoUrl}
              alt={settings.name}
              name={settings.name}
              tagline={settings.tagline}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <a 
              href={settings.instagramUrl || `https://instagram.com/${String(settings.instagramHandle || 'barbeariaelite').replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-ink-border hover:border-gold hover:bg-gold/10 flex items-center justify-center text-gray-400 hover:text-gold transition-all" 
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href={`https://wa.me/${cleanNumber}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-ink-border hover:border-gold hover:bg-gold/10 flex items-center justify-center text-gray-400 hover:text-gold transition-all" 
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a
      href="#agendar"
      className={`fixed bottom-5 right-5 z-40 lg:hidden inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-4 sm:px-5 py-3 rounded-full shadow-2xl shadow-gold/40 transition-all active:scale-95 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Agendar Horário"
    >
      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs sm:text-sm">Agendar</span>
    </a>
  );
}

/* ============== ADMIN & SAAS ============= */

function AdminLogin({ 
  onLogin, 
  loggedOutNotice,
  onBackToLanding 
}: { 
  onLogin: () => void; 
  loggedOutNotice?: boolean;
  onBackToLanding?: () => void;
}) {
  const { user, isAdmin, isSuperAdmin, signInWithGoogle, signOutUser, authError } = useAuth();
  const [error, setError] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const isVerifiedAdminEmail = Boolean(
    user?.email &&
    (user.email.toLowerCase() === 'conecdevce@gmail.com' || user.email.toLowerCase() === 'conectdevce@gmail.com')
  );

  const isAuthorized = isSuperAdmin || isAdmin || isVerifiedAdminEmail;

  useEffect(() => {
    if (user && isAuthorized) {
      onLogin();
    }
  }, [user, isAuthorized, onLogin]);

  const handleBack = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      window.location.hash = '';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmittingGoogle(true);
      setError(false);
      await signInWithGoogle();
    } catch {
      setError(true);
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col p-4 grain-bg relative">
      {/* Botão Superior para Voltar à Landing Page & Relógio */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 sm:py-4 z-20">
        <button
          type="button"
          id="admin-login-back-landing-btn"
          onClick={handleBack}
          className="inline-flex items-center gap-2 bg-gold/15 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold px-3.5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer group active:scale-95"
          title="Voltar para a Landing Page"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para Landing Page</span>
        </button>

        <LiveClock showDate={true} className="hidden sm:inline-flex" />
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        <div className="vintage-card w-full max-w-md p-8 sm:p-10 rounded-sm relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400 text-sm mb-6">
            Acesso exclusivo para administradores
          </p>
          
          {loggedOutNotice && !error && !user && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm py-2.5 px-4 rounded-sm mb-6 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Sessão encerrada com sucesso.</span>
            </div>
          )}

          {/* Connected User Notice if email is unauthorized */}
          {user && !isAuthorized && (
            <div className="mb-6 p-4 bg-amber-950/50 border border-amber-600/50 rounded-lg text-left text-xs leading-relaxed space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Painel Master Restrito</span>
              </div>
              <p className="text-gray-300">
                Você está conectado como <strong className="text-white">{user.email}</strong>. O painel Master (#admin) é reservado para gestão global da plataforma.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  id="go-to-tenant-app-btn"
                  onClick={() => {
                    window.location.hash = '';
                  }}
                  className="w-full py-2.5 px-3 rounded bg-gold hover:bg-gold-light text-ink font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Ir para o Painel da Minha Empresa</span>
                </button>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="w-full py-2 px-3 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  Alternar / Sair da Conta
                </button>
              </div>
            </div>
          )}

          {(error || authError) && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm mb-6">
              {authError || 'Credenciais não autorizadas para o painel administrativo.'}
            </div>
          )}

          {/* Google Login Primary Button */}
          <button
            type="button"
            id="google-admin-login-btn"
            onClick={handleGoogleSignIn}
            disabled={isSubmittingGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-sm bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-6"
          >
            {isSubmittingGoogle ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isSubmittingGoogle ? 'Autenticando...' : 'Entrar com o Google'}</span>
          </button>
          <button onClick={handleBack} className="mt-6 text-sm text-gray-500 hover:text-gold transition-colors cursor-pointer inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminServices() {
  const { services, setServices } = useContext(AppContext);
  const { tenant, tenantId, hasPermission } = useTenant();
  const canWriteServices = hasPermission('landing.write') || hasPermission('settings.write');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Service | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [imageTab, setImageTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (s: Service) => {
    setEditingId(s.id);
    const cleanImg = (s.image && s.image.trim().length > 0) ? s.image.trim() : serviceHaircutImg;
    setFormData({ ...s, image: cleanImg });
    setCustomImageUrl(cleanImg.startsWith('http') ? cleanImg : '');
    setSaveError(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await setServices(services.filter(s => s.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData(null);
      }
    } catch (err: any) {
      console.error('Erro ao excluir serviço:', err);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Deseja restaurar o catálogo de serviços para o padrão de fábrica? Isso incluirá Lavagem de Cabelo, Venda de Produtos, Corte e Barba.')) {
      try {
        await setServices(DEFAULT_SERVICES);
        setEditingId(null);
        setFormData(null);
      } catch (err: any) {
        console.error('Erro ao restaurar catálogo:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    if (!formData.name.trim()) {
      setSaveError('Por favor, informe o nome do serviço.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      let cleanImage = (formData.image && formData.image.trim()) ? formData.image.trim() : serviceHaircutImg;
      if (cleanImage.startsWith('data:') || cleanImage.length > 30000) {
        try {
          cleanImage = await compressImage(cleanImage, 450, 450, 0.70);
        } catch (compErr) {
          console.warn('Erro ao comprimir imagem no handleSave:', compErr);
        }
      }

      const sanitized: Service = {
        ...formData,
        name: formData.name.trim(),
        price: formData.price.trim() || 'R$ 50',
        duration: formData.duration.trim() || '30 min',
        description: formData.description.trim(),
        iconName: formData.iconName || 'Scissors',
        image: cleanImage,
        featured: !!formData.featured
      };

      if (editingId === 'NEW') {
        const newId = 'srv_' + Math.random().toString(36).substring(2, 9);
        await setServices([...services, { ...sanitized, id: newId }]);
      } else {
        await setServices(services.map(s => s.id === editingId ? sanitized : s));
      }
      setEditingId(null);
      setFormData(null);
    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      setSaveError(err.message || 'Erro ao salvar serviço no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const addNew = () => {
    setEditingId('NEW');
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 'R$ ',
      iconName: 'Scissors',
      image: serviceHaircutImg,
      duration: '30 min',
      featured: false
    });
    setCustomImageUrl('');
    setImageTab('presets');
    setSaveError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setSaveError(null);
    try {
      const targetTenantId = tenant?.id || tenantId;
      if (targetTenantId) {
        const uploadedUrl = await uploadServiceImage(targetTenantId, file, formData?.id || undefined);
        setFormData(prev => prev ? { ...prev, image: uploadedUrl } : null);
      } else {
        const compressed = await compressImage(file, 600, 600, 0.75);
        setFormData(prev => prev ? { ...prev, image: compressed } : null);
      }
    } catch (err: any) {
      console.warn('Erro ao processar imagem:', err);
      setSaveError('Erro ao enviar imagem: ' + (err.message || ''));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const applyCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData(prev => prev ? { ...prev, image: customImageUrl.trim() } : null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Scissors className="w-6 h-6 text-gold" />
            Serviços & Produtos
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Gerencie o catálogo de serviços, categorias em português (PT-BR), preços e imagens personalizadas.
          </p>
        </div>
        {canWriteServices && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-ink-border rounded-sm transition-colors cursor-pointer"
              title="Restaurar catálogo inicial com Lavagem de Cabelo e Venda de Produtos"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              Restaurar Padrões
            </button>
            <button
              type="button"
              onClick={addNew}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-4 py-2 rounded-sm text-sm transition-all shadow-md shadow-gold/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Serviço
            </button>
          </div>
        )}
      </div>

      {/* Editor Modal / Container if editing or creating */}
      {canWriteServices && formData && (
        <div className="mb-8 p-5 sm:p-6 bg-ink border-2 border-gold/60 rounded-sm shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-ink-border">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-sm uppercase tracking-wider ${
                editingId === 'NEW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold/20 text-gold border border-gold/30'
              }`}>
                {editingId === 'NEW' ? 'Novo Cadastro' : 'Editando Serviço'}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                {editingId === 'NEW' ? 'Cadastrar Novo Serviço' : (formData.name || 'Editar Serviço')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => { setEditingId(null); setFormData(null); }}
              className="text-gray-400 hover:text-white p-1 text-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                Nome do Serviço *
              </label>
              <input
                type="text"
                className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lavagem de Cabelo & Hidratação, Venda de Pomada Matte, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                  Preço *
                </label>
                <input
                  type="text"
                  className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: R$ 45"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                  Duração Estimada *
                </label>
                <input
                  type="text"
                  className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Ex: 30 min"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                Descrição do Serviço
              </label>
              <textarea
                rows={2}
                className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Lavatório com shampoo especial, massagem relaxante no couro cabeludo e hidratação com produtos premium..."
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-3 bg-ink-light/50 border border-ink-border rounded-sm">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={!!formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 accent-gold rounded cursor-pointer"
              />
              <label htmlFor="featuredCheck" className="text-xs sm:text-sm text-gray-200 cursor-pointer select-none">
                <span className="font-semibold text-gold">Destacar este serviço</span> na página inicial (com selo de "Mais Popular" e borda especial)
              </label>
            </div>
          </div>

          {/* Tipo de Serviço em PT-BR */}
          <div className="border-t border-ink-border pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold font-bold">
                  Tipo / Categoria do Serviço (PT-BR)
                </label>
                <p className="text-gray-400 text-xs">
                  Selecione a especialidade correspondente em idioma português:
                </p>
              </div>
              <div className="text-xs text-gold flex items-center gap-1 font-semibold">
                Selecionado: {SERVICE_TYPE_OPTIONS.find(o => o.iconName === formData.iconName)?.label || 'Personalizado'}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {SERVICE_TYPE_OPTIONS.map(opt => {
                const isSelected = formData.iconName === opt.iconName;
                const IconComponent = ICON_MAP[opt.iconName] || Scissors;
                return (
                  <button
                    key={opt.iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconName: opt.iconName })}
                    className={`p-3 rounded-sm border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-gold bg-gold/15 text-gold shadow-md shadow-gold/10'
                        : 'border-ink-border bg-ink-light hover:border-gold/40 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-gold text-ink' : 'bg-white/5 text-gold'
                      }`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="bg-gold text-ink rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-gold' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-2">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opções de Alteração de Imagem Ampliadas */}
          <div className="border-t border-ink-border pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold font-bold">
                  Imagem do Serviço
                </label>
                <p className="text-gray-400 text-xs">
                  Escolha fotos prontas de barbearia, envie um arquivo do seu computador/celular ou insira uma URL:
                </p>
              </div>
              <div className="flex items-center gap-1 bg-ink-light p-1 rounded-sm border border-ink-border">
                <button
                  type="button"
                  onClick={() => setImageTab('presets')}
                  className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors cursor-pointer ${
                    imageTab === 'presets' ? 'bg-gold text-ink' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Galeria Pronta
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors cursor-pointer ${
                    imageTab === 'upload' ? 'bg-gold text-ink' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Enviar Foto
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors cursor-pointer ${
                    imageTab === 'url' ? 'bg-gold text-ink' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Link Web
                </button>
              </div>
            </div>

            {/* Sub-Aba: Presets */}
            {imageTab === 'presets' && (
              <div>
                <div className="text-[11px] text-gray-400 mb-2.5">
                  Clique em uma das imagens otimizadas para associar a este serviço:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {PRESET_SERVICE_IMAGES.map(preset => {
                    const isSelected = formData.image === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`group relative rounded-sm overflow-hidden border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-gold ring-2 ring-gold/40 shadow-md shadow-gold/20'
                            : 'border-ink-border hover:border-gold/50'
                        }`}
                      >
                        <div className="h-20 sm:h-22 w-full relative overflow-hidden bg-black/50">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-gold text-ink rounded-full p-0.5 shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1.5 right-1.5">
                            <div className="text-[10px] font-bold text-white truncate leading-tight">
                              {preset.title}
                            </div>
                            <div className="text-[9px] text-gold font-medium truncate">
                              {preset.subtitle}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Aba: Upload */}
            {imageTab === 'upload' && (
              <div className="p-4 bg-ink-light border border-ink-border rounded-sm">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-white mb-1">Upload de Imagem Local</h4>
                    <p className="text-xs text-gray-400">
                      Envie uma foto do seu computador ou celular (PNG, JPG, WEBP). Ela será salva diretamente no seu navegador.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 px-4 py-2.5 rounded-sm text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Escolher Imagem do Dispositivo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Aba: URL */}
            {imageTab === 'url' && (
              <div className="p-4 bg-ink-light border border-ink-border rounded-sm space-y-3">
                <label className="block text-xs text-gray-300 font-semibold">
                  URL da Imagem na Web (HTTP / HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={e => setCustomImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto-do-servico.jpg"
                    className="flex-1 bg-ink border border-ink-border focus:border-gold outline-none px-3 py-2 text-sm text-white rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCustomUrl}
                    className="bg-gold text-ink font-bold px-4 py-2 rounded-sm text-xs hover:bg-gold-light transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}

            {/* Pré-visualização ao vivo da foto selecionada */}
            <div className="mt-4 p-3 bg-ink-surface border border-ink-border rounded-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-20 rounded-sm overflow-hidden border border-gold/40 flex-shrink-0 bg-black">
                <img
                  src={formData.image || serviceHaircutImg}
                  alt="Prévia do serviço"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="text-[10px] text-gold uppercase tracking-wider font-bold mb-0.5">
                  Prévia da Imagem Selecionada
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {formData.name || 'Nome do Serviço'}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-gold font-semibold">{formData.price || 'R$ 0'}</span>
                  <span>•</span>
                  <span>{formData.duration || '0 min'}</span>
                  <span>•</span>
                  <span>{SERVICE_TYPE_OPTIONS.find(o => o.iconName === formData.iconName)?.label || 'Geral'}</span>
                </div>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Botões de Ação do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-border">
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => { setEditingId(null); setFormData(null); }}
              className="px-4 py-2.5 rounded-sm text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-ink-border transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-5 py-2.5 rounded-sm text-xs transition-all shadow-md shadow-gold/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Salvando...' : (editingId === 'NEW' ? 'Cadastrar Serviço' : 'Salvar Alterações')}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Serviços */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>Serviços ativos ({services.length})</span>
          <span>Clique em "Editar" para alterar fotos, preços ou tipos em PT-BR</span>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 bg-ink border border-ink-border rounded-sm">
            <Scissors className="w-8 h-8 text-gold mx-auto mb-3 opacity-50" />
            <p className="text-gray-300 text-sm">Nenhum serviço cadastrado.</p>
            {canWriteServices && (
              <button
                type="button"
                onClick={addNew}
                className="mt-3 text-gold text-xs font-bold underline hover:text-gold-light cursor-pointer"
              >
                Cadastrar o primeiro serviço
              </button>
            )}
          </div>
        ) : (
          services.map(s => {
            const Icon = ICON_MAP[s.iconName] || ICON_MAP.Scissors;
            const typeOption = SERVICE_TYPE_OPTIONS.find(o => o.iconName === s.iconName);
            const isEditing = editingId === s.id;
            const serviceImg = (s.image && typeof s.image === 'string' && s.image.trim().length > 0)
              ? s.image.trim()
              : serviceHaircutImg;

            return (
              <div
                key={s.id}
                className={`bg-ink border rounded-sm p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isEditing
                    ? 'border-gold bg-gold/5'
                    : 'border-ink-border hover:border-gold/30'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden flex-shrink-0 border border-ink-border bg-black">
                    <img
                      src={serviceImg}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-ink/80 border border-gold/40 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-gold" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-serif text-base sm:text-lg font-bold text-white truncate">
                        {s.name}
                      </h4>
                      {typeOption && (
                        <span className="text-[10px] bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full font-medium">
                          {typeOption.label}
                        </span>
                      )}
                      {s.featured && (
                        <span className="text-[10px] bg-gold text-ink font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Destaque
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-xs line-clamp-1 mb-1.5">
                      {s.description || 'Sem descrição cadastrada'}
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-serif font-bold text-gold text-sm sm:text-base">{s.price}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {s.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canWriteServices && (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-ink-border">
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-ink-border rounded-sm transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gold" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function AdminProfessionals() {
  const currentTime = useCurrentTime();
  const { professionals, setProfessionals, timeSlots, appointments, services } = useContext(AppContext);
  const { tenant, hasPermission } = useTenant();
  const canWriteProfessionals = hasPermission('landing.write') || hasPermission('members.manage');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Professional | null>(null);
  const [showOccupiedFor, setShowOccupiedFor] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentPlan = DEFAULT_SAAS_PLANS.find(p => p.id === tenant?.planId) || DEFAULT_SAAS_PLANS[1];
  const isLimitReached = professionals.length >= currentPlan.maxBarbers;

  // Date for calculating available slots (defaults to today)
  const [checkDateStr, setCheckDateStr] = useState(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  });

  const formattedCheckDate = checkDateStr.split('-').reverse().join('/');

  // Helpers for quick date switching
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const tzOffset = d.getTimezoneOffset() * 60000;
    setCheckDateStr(new Date(d.getTime() - tzOffset).toISOString().split('T')[0]);
  };

  const handleEdit = (p: Professional) => {
    setEditingId(p.id);
    setFormData(p);
    setErrorMsg(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await setProfessionals(professionals.filter(p => p.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData(null);
      }
    } catch (err: any) {
      console.error('Erro ao excluir profissional:', err);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    if (!formData.name?.trim()) {
      setErrorMsg('Por favor, informe o nome do profissional.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      if (editingId === 'NEW') {
        if (isLimitReached) {
          setErrorMsg(`Limite de profissionais atingido para o plano ${currentPlan.name} (${currentPlan.maxBarbers} profissionais). Faça upgrade do plano.`);
          setIsSaving(false);
          return;
        }
        await setProfessionals([...professionals, { ...formData, id: 'barber_' + Math.random().toString(36).substring(2, 9) }]);
      } else {
        await setProfessionals(professionals.map(p => p.id === editingId ? formData : p));
      }
      setEditingId(null);
      setFormData(null);
    } catch (err: any) {
      console.error('Erro ao salvar profissional:', err);
      setErrorMsg(err.message || 'Erro ao persistir profissional no banco.');
    } finally {
      setIsSaving(false);
    }
  };

  const addNew = () => {
    if (isLimitReached) {
      setErrorMsg(`Você atingiu o limite de ${currentPlan.maxBarbers} profissional(is) do seu plano atual (${currentPlan.name}).`);
      return;
    }
    setErrorMsg(null);
    setEditingId('NEW');
    setFormData({ id: '', name: '', specialty: '', years: null });
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-[fadeUp_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">Profissionais & Horários Disponíveis</h2>
          <p className="text-gray-400 text-sm">
            Grade de horários livres de cada profissional calculada dinamicamente conforme os agendamentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLimitReached && (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-sm">
              Limite de {currentPlan.maxBarbers} profissionais atingido ({currentPlan.name})
            </span>
          )}
          {canWriteProfessionals && (
            <button 
              onClick={addNew} 
              disabled={isLimitReached}
              className="self-start md:self-auto flex items-center gap-2 bg-gold text-ink font-bold px-4 py-2.5 rounded-sm text-sm hover:bg-gold-light transition-all shadow-md shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Profissional
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Date Selector Banner for checking availability */}
      <div className="bg-ink border border-ink-border rounded-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium block">Data de Consulta</span>
            <span className="text-white font-medium text-sm">
              Disponibilidade para <strong className="text-gold font-bold">{formattedCheckDate}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-ink-light border border-ink-border p-1 rounded-sm">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors font-medium"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors font-medium"
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(2)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors font-medium"
            >
              +2 Dias
            </button>
          </div>
          <input 
            type="date" 
            value={checkDateStr} 
            onChange={e => setCheckDateStr(e.target.value)} 
            className="bg-ink-light border border-ink-border rounded-sm py-1.5 px-3 text-xs text-white focus:border-gold outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
          />
        </div>
      </div>

      {/* Form for New Professional */}
      {editingId === 'NEW' && formData && (
        <div className="bg-ink border-2 border-gold p-5 rounded-sm mb-6 animate-[fadeUp_0.2s_ease-out]">
          <h3 className="text-white font-serif text-lg font-bold mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" /> Cadastrar Novo Profissional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Nome Completo</label>
              <input className="w-full bg-ink-light border border-ink-border p-2.5 text-sm text-white rounded-sm focus:border-gold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Lucas Almeida" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Especialidade</label>
              <input className="w-full bg-ink-light border border-ink-border p-2.5 text-sm text-white rounded-sm focus:border-gold outline-none" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} placeholder="Ex: Barba & Navalha" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Anos de Experiência</label>
              <input className="w-full bg-ink-light border border-ink-border p-2.5 text-sm text-white rounded-sm focus:border-gold outline-none" type="number" value={formData.years || ''} onChange={e => setFormData({ ...formData, years: parseInt(e.target.value) || null })} placeholder="Ex: 8" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button disabled={isSaving} onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button disabled={isSaving} onClick={handleSave} className="bg-gold text-ink font-bold px-5 py-2 rounded-sm text-sm hover:bg-gold-light transition-all disabled:opacity-50 inline-flex items-center gap-2">
              {isSaving && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? 'Salvando...' : 'Salvar Profissional'}
            </button>
          </div>
        </div>
      )}

      {/* Professional Cards List with Dedicated Available Time Slots */}
      <div className="space-y-5">
        {professionals.length === 0 ? (
          <div className="bg-ink border border-dashed border-ink-border rounded-sm p-10 text-center">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium text-sm mb-1">Nenhum profissional cadastrado</p>
            <p className="text-gray-500 text-xs mb-4">Cadastre os profissionais da sua equipe para habilitar os agendamentos da empresa.</p>
            <button
              type="button"
              onClick={addNew}
              className="bg-gold text-ink text-xs font-bold px-4 py-2 rounded-sm hover:bg-gold-light cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Profissional</span>
            </button>
          </div>
        ) : (
          professionals.map(p => {
          const { availableSlots, bookedAppointments } = getAvailableSlotsForProfessional(
            p,
            checkDateStr,
            timeSlots,
            appointments,
            services,
            professionals,
            currentTime
          );
          const isExpandedOccupied = showOccupiedFor === p.id;

          return (
            <div key={p.id} className="bg-ink border border-ink-border rounded-sm p-5 transition-all hover:border-ink-border/80">
              {editingId === p.id && formData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs uppercase text-gray-400 mb-1">Nome</label>
                      <input className="w-full bg-ink-light border border-ink-border p-2 text-sm text-white rounded-sm focus:border-gold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-400 mb-1">Especialidade</label>
                      <input className="w-full bg-ink-light border border-ink-border p-2 text-sm text-white rounded-sm focus:border-gold outline-none" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} placeholder="Especialidade" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-400 mb-1">Anos Exp.</label>
                      <input className="w-full bg-ink-light border border-ink-border p-2 text-sm text-white rounded-sm focus:border-gold outline-none" type="number" value={formData.years || ''} onChange={e => setFormData({ ...formData, years: parseInt(e.target.value) || null })} placeholder="Anos de experiência" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button disabled={isSaving} onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-50">Cancelar</button>
                    <button disabled={isSaving} onClick={handleSave} className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-sm text-xs font-bold hover:bg-green-500/30 disabled:opacity-50 inline-flex items-center gap-1.5">
                      {isSaving && <RotateCcw className="w-3 h-3 animate-spin" />}
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Bar: Profile Details & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-lg">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-white">{p.name}</h3>
                          {p.id === 'any' && (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                              Regra Geral
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {p.specialty} {p.years ? `• ${p.years} anos de experiência` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        {availableSlots.length} {availableSlots.length === 1 ? 'horário livre' : 'horários livres'}
                      </span>
                      {bookedAppointments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowOccupiedFor(isExpandedOccupied ? null : p.id)}
                          className="text-xs bg-ink-light hover:bg-white/10 text-gray-300 border border-ink-border px-2.5 py-1 rounded-sm transition-colors"
                        >
                          {bookedAppointments.length} agendado(s) {isExpandedOccupied ? '▲' : '▼'}
                        </button>
                      )}
                      {canWriteProfessionals && p.id !== 'any' && (
                        <div className="flex items-center gap-1 pl-2 border-l border-ink-border">
                          <button onClick={() => handleEdit(p)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-sm text-xs text-gray-300 transition-colors cursor-pointer">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-sm text-xs text-red-400 transition-colors cursor-pointer">
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Somente os Horários Disponíveis */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        Somente Horários Disponíveis ({formattedCheckDate}):
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {availableSlots.length} de {timeSlots.length} horários configurados
                      </span>
                    </div>

                    {availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(slot => (
                          <div
                            key={slot}
                            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-ink-light border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all text-xs font-mono font-medium text-gold shadow-xs"
                            title={`Horário ${slot} livre com ${p.name}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
                            {slot}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-300 flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Nenhum horário disponível para {p.name} em {formattedCheckDate}. Todos os horários estão ocupados por agendamentos.</span>
                      </div>
                    )}

                    {/* Detalhes de Horários Ocupados (quando clicado) */}
                    {isExpandedOccupied && bookedAppointments.length > 0 && (
                      <div className="mt-3 p-3 bg-ink-light border border-ink-border rounded-sm animate-[fadeUp_0.15s_ease-out]">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2">
                          Agendamentos ocupando a grade deste profissional ({formattedCheckDate}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {bookedAppointments.map(app => (
                            <div key={app.id} className="bg-ink border border-ink-border p-2 rounded-xs flex items-center justify-between text-xs">
                              <div>
                                <span className="text-gold font-mono font-bold mr-2">{app.time}</span>
                                <span className="text-white font-medium">{app.client}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{app.service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function AdminTimeSlots() {
  const { timeSlots, setTimeSlots } = useContext(AppContext);
  const { hasPermission } = useTenant();
  const canWriteSlots = hasPermission('appointments.write') || hasPermission('settings.write');
  const [newSlot, setNewSlot] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot) return;
    if (!timeSlots.includes(newSlot)) {
      const updated = [...timeSlots, newSlot].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      setTimeSlots(updated);
    }
    setNewSlot('');
  };

  const handleDelete = (slot: string) => {
    setTimeSlots(timeSlots.filter(t => t !== slot));
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-white">Horários Disponíveis</h2>
      </div>
      
      {canWriteSlots && (
        <form onSubmit={handleAdd} className="mb-6 flex gap-3">
          <input 
            type="time" 
            value={newSlot} 
            onChange={e => setNewSlot(e.target.value)} 
            className="bg-ink-light border border-ink-border p-2 text-white rounded-sm focus:border-gold outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" 
          />
          <button type="submit" className="bg-gold text-ink font-bold px-4 py-2 rounded-sm text-sm hover:bg-gold-light cursor-pointer">
            Adicionar Horário
          </button>
        </form>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {timeSlots.map(t => (
          <div key={t} className="bg-ink border border-ink-border p-3 rounded-sm flex justify-between items-center group">
            <span className="text-white font-medium">{t}</span>
            {canWriteSlots && (
              <button 
                onClick={() => handleDelete(t)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTestimonials() {
  const { testimonials, setTestimonials, settings, updateSettings } = useContext(AppContext);
  const { hasPermission } = useTenant();
  const canWriteLanding = hasPermission('landing.write');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Testimonial | null>(null);
  const [tagline, setTagline] = useState(settings.testimonialsTagline || 'O que dizem sobre nós');
  const [titlePrefix, setTitlePrefix] = useState(settings.testimonialsTitlePrefix || 'Clientes que');
  const [titleHighlight, setTitleHighlight] = useState(settings.testimonialsTitleHighlight || 'confiam');
  const [savedTitleMsg, setSavedTitleMsg] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const list = testimonials || [];

  const handleEdit = (t: Testimonial) => {
    setEditingId(t.id || 'temp');
    setFormData({ ...t });
  };

  const handleAddNew = () => {
    setEditingId('NEW');
    setFormData({
      id: 'test_' + Math.random().toString(36).substring(2, 9),
      name: '',
      role: 'Cliente frequente',
      text: '',
      rating: 5
    });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setDeletingId(id);
    const updated = list.filter(t => t.id !== id);
    try {
      await setTestimonials(updated);
      setFeedbackNotice('Depoimento removido com sucesso.');
      setTimeout(() => setFeedbackNotice(null), 3000);
    } catch (err) {
      console.error("Erro ao excluir depoimento:", err);
    } finally {
      setDeletingId(null);
      if (editingId === id) {
        setEditingId(null);
        setFormData(null);
      }
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!formData.name.trim() || !formData.text.trim()) {
      setFeedbackNotice('Por favor, preencha o nome do cliente e o texto do depoimento.');
      setTimeout(() => setFeedbackNotice(null), 4000);
      return;
    }

    if (editingId === 'NEW') {
      const newItem: Testimonial = {
        ...formData,
        id: formData.id || ('test_' + Math.random().toString(36).substring(2, 9)),
        rating: Number(formData.rating) || 5
      };
      await setTestimonials([...list, newItem]);
      setFeedbackNotice('Novo depoimento adicionado com sucesso!');
    } else {
      const updated = list.map(t => (t.id === editingId ? { ...formData, rating: Number(formData.rating) || 5 } : t));
      await setTestimonials(updated);
      setFeedbackNotice('Depoimento atualizado com sucesso!');
    }
    setTimeout(() => setFeedbackNotice(null), 3000);
    setEditingId(null);
    setFormData(null);
  };

  const handleSaveHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      testimonialsTagline: tagline,
      testimonialsTitlePrefix: titlePrefix,
      testimonialsTitleHighlight: titleHighlight
    });
    setSavedTitleMsg(true);
    setTimeout(() => setSavedTitleMsg(false), 3000);
  };

  const handleResetDefaults = async () => {
    await setTestimonials(DEFAULT_TESTIMONIALS);
    await updateSettings({
      testimonialsTagline: 'O que dizem sobre nós',
      testimonialsTitlePrefix: 'Clientes que',
      testimonialsTitleHighlight: 'confiam'
    });
    setTagline('O que dizem sobre nós');
    setTitlePrefix('Clientes que');
    setTitleHighlight('confiam');
    setEditingId(null);
    setFormData(null);
    setSavedTitleMsg(true);
    setFeedbackNotice('Depoimentos padrão restaurados com sucesso.');
    setTimeout(() => {
      setSavedTitleMsg(false);
      setFeedbackNotice(null);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8 animate-[fadeUp_0.3s_ease-out]">
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-border pb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Quote className="w-6 h-6 text-gold" />
            Gerenciar Depoimentos & Avaliações
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Edite, adicione ou remova os depoimentos que aparecem na seção de comentários da Landing Page.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-ink border border-ink-border hover:border-gray-600 px-3 py-2 rounded-sm transition-colors cursor-pointer"
            title="Restaurar os 3 depoimentos originais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light px-4 py-2 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Depoimento</span>
          </button>
        </div>
      </div>

      {/* Notificação de Feedback */}
      {feedbackNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-xs text-emerald-300 flex items-center gap-2 animate-[fadeUp_0.15s_ease-out]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Títulos da Seção na Landing Page */}
      <div className="bg-ink border border-ink-border rounded-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base sm:text-lg text-white font-medium flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold" /> Títulos da Seção de Depoimentos
          </h3>
          {savedTitleMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Títulos atualizados com sucesso!
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Personalize o texto introdutório que os clientes leem no topo da área de comentários.
        </p>

        <form onSubmit={handleSaveHeaders} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
              Subtítulo Superior
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="O que dizem sobre nós"
              className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
              Prefixo do Título
            </label>
            <input
              type="text"
              value={titlePrefix}
              onChange={e => setTitlePrefix(e.target.value)}
              placeholder="Clientes que"
              className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
              Destaque Dourado
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={titleHighlight}
                onChange={e => setTitleHighlight(e.target.value)}
                placeholder="confiam"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
              />
              <button
                type="submit"
                className="bg-gold text-ink font-bold px-3.5 py-2 rounded-sm text-xs hover:bg-gold-light transition-colors whitespace-nowrap cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Formulário de Adicionar / Editar Depoimento */}
      {editingId && formData && (
        <div className="bg-ink-light border border-gold/40 rounded-sm p-5 sm:p-6 shadow-xl relative">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-ink-border">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-gold" />
              {editingId === 'NEW' ? 'Cadastrar Novo Depoimento' : 'Editar Depoimento'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData(null);
              }}
              className="text-gray-400 hover:text-white p-1 rounded-sm cursor-pointer"
              title="Cancelar edição"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Carlos Henrique"
                  className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3.5 text-sm text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Avaliação (Estrelas)
                </label>
                <div className="flex items-center gap-1.5 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="cursor-pointer focus:outline-none transition-transform hover:scale-110"
                      title={`${star} estrela${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (formData.rating || 5)
                            ? 'text-gold fill-gold'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-gold ml-2 font-bold">
                    {formData.rating || 5}/5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Rótulo / Descrição do Cliente
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Cliente há 3 anos, Cliente VIP, Atendimento quinzenal"
                className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3.5 text-sm text-white focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Comentário / Depoimento *
              </label>
              <textarea
                required
                rows={3}
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                placeholder="Escreva a experiência ou relato do cliente..."
                className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3.5 text-sm text-white focus:border-gold outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-transparent hover:bg-white/5 border border-ink-border rounded-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-ink bg-gold hover:bg-gold-light rounded-sm transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Depoimento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Depoimentos Atuais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-white font-medium">
            Depoimentos Atuais ({list.length})
          </h3>
          <span className="text-xs text-gray-400">
            Exibidos na Landing Page em carrossel ou grade
          </span>
        </div>

        {list.length === 0 ? (
          <div className="bg-ink border border-dashed border-ink-border rounded-sm p-10 text-center">
            <Quote className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium text-sm mb-1">Nenhum depoimento cadastrado</p>
            <p className="text-gray-500 text-xs mb-4">Adicione um novo depoimento ou restaure os padrões da barbearia.</p>
            {canWriteLanding && (
              <button
                type="button"
                onClick={handleAddNew}
                className="bg-gold text-ink text-xs font-bold px-4 py-2 rounded-sm hover:bg-gold-light cursor-pointer"
              >
                Adicionar Primeiro Depoimento
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((t, idx) => {
              const initials = t.name
                ? t.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
                : 'C';
              const ratingCount = Math.max(1, Math.min(5, t.rating || 5));
              const isCurrentlyEditing = editingId === t.id;

              return (
                <div
                  key={t.id || idx}
                  className={`bg-ink border rounded-sm p-5 flex flex-col justify-between relative transition-all ${
                    isCurrentlyEditing
                      ? 'border-gold shadow-md'
                      : 'border-ink-border hover:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">
                        {[...Array(ratingCount)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                        ))}
                      </div>
                      {canWriteLanding && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-gray-400 hover:text-gold hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                            title="Editar este depoimento"
                            aria-label={`Editar depoimento de ${t.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === (t.id || `test-${idx + 1}`)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(t.id || `test-${idx + 1}`);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                            title="Excluir este depoimento"
                            aria-label={`Excluir depoimento de ${t.name}`}
                          >
                            {deletingId === (t.id || `test-${idx + 1}`) ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 italic font-light">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-ink-border mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center font-serif font-bold text-ink text-xs flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-white text-xs sm:text-sm truncate">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-gold uppercase tracking-wider truncate">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminTickerSettings() {
  const { settings, updateSettings } = useContext(AppContext);
  const [items, setItems] = useState<string[]>(() =>
    (settings.tickerItems && settings.tickerItems.length > 0) ? settings.tickerItems : DEFAULT_TICKER_ITEMS
  );
  const [separatorIcon, setSeparatorIcon] = useState<string>(settings.tickerSeparatorIcon || 'Scissors');
  const [theme, setTheme] = useState<'gold' | 'dark' | 'black' | 'vintage'>((settings.tickerTheme as any) || 'gold');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(settings.tickerSpeed || 'normal');
  const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base'>(settings.tickerFontSize || 'sm');
  const [newItemText, setNewItemText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings.tickerItems && settings.tickerItems.length > 0) {
      setItems(settings.tickerItems);
    }
    if (settings.tickerSeparatorIcon) {
      setSeparatorIcon(settings.tickerSeparatorIcon);
    }
    if (settings.tickerTheme) {
      setTheme((settings.tickerTheme as any) || 'gold');
    }
    if (settings.tickerSpeed) {
      setSpeed(settings.tickerSpeed);
    }
    if (settings.tickerFontSize) {
      setFontSize(settings.tickerFontSize);
    }
  }, [settings.tickerItems, settings.tickerSeparatorIcon, settings.tickerTheme, settings.tickerSpeed, settings.tickerFontSize]);

  const handleAddItem = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText !== undefined ? customText : newItemText).trim();
    if (!text) return;
    if (items.some(item => item.toLowerCase() === text.toLowerCase())) {
      alert('Este destaque já está incluído na barra rolante.');
      return;
    }
    setItems(prev => [...prev, text]);
    if (customText === undefined) setNewItemText('');
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (items.length <= 1) {
      alert('A barra rolante deve ter no mínimo 1 destaque.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newItems = [...items];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateSettings({
      tickerItems: items,
      tickerSeparatorIcon: separatorIcon,
      tickerTheme: theme,
      tickerSpeed: speed,
      tickerFontSize: fontSize
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = async () => {
    setItems(DEFAULT_TICKER_ITEMS);
    setSeparatorIcon('Scissors');
    setTheme('gold');
    setSpeed('normal');
    setFontSize('sm');
    await updateSettings({
      tickerItems: DEFAULT_TICKER_ITEMS,
      tickerSeparatorIcon: 'Scissors',
      tickerTheme: 'gold',
      tickerSpeed: 'normal',
      tickerFontSize: 'sm'
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Pre-calcular itens para prévia contínua
  let previewList = [...items];
  while (previewList.length < 12) {
    previewList = [...previewList, ...items];
  }
  const previewDoubled = [...previewList, ...previewList];
  const previewHasIcon = separatorIcon !== 'None';
  const PreviewIcon = previewHasIcon && ICON_MAP[separatorIcon] ? ICON_MAP[separatorIcon] : (previewHasIcon ? Scissors : null);

  const themeClasses = {
    gold: 'bg-gold text-ink border-gold',
    dark: 'bg-ink-light text-gold border-gold/40 shadow-inner',
    black: 'bg-black text-white border-gold/40 shadow-inner',
    vintage: 'bg-[#221611] text-[#e5c185] border-[#8a5a22]/60 shadow-inner'
  }[theme] || 'bg-gold text-ink border-gold';

  const previewSpeedClass = {
    slow: 'marquee-slow',
    normal: 'marquee-normal',
    fast: 'marquee-fast'
  }[speed] || 'marquee-normal';

  const previewFontSizeClass = {
    xs: 'text-[11px] sm:text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base'
  }[fontSize] || 'text-xs sm:text-sm';

  const iconColor = theme === 'gold' 
    ? 'text-ink' 
    : (theme === 'black' ? 'text-gold' : (theme === 'vintage' ? 'text-[#c9a961]' : 'text-gold'));

  return (
    <div className="bg-ink border border-ink-border rounded-sm p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-border pb-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Barra Rolante de Destaques (Faixa Ticker)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Esta é a faixa animada contínua logo abaixo da apresentação inicial (Hero). Edite os textos que deslizam na tela, o ícone separador e as cores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-ink-light border border-ink-border hover:border-gray-600 px-3 py-2 rounded-sm transition-colors cursor-pointer"
            title="Restaurar itens padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light px-4 py-2 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Barra Rolante</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 flex items-center justify-between text-xs animate-[fadeUp_0.2s_ease-out]">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            Barra rolante atualizada com sucesso! A Landing Page foi atualizada imediatamente.
          </span>
          <button
            type="button"
            onClick={() => window.location.hash = ''}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2.5 py-1 rounded font-semibold transition-colors"
          >
            Ver no Site
          </button>
        </div>
      )}

      {/* Prévia Animada em Tempo Real */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gold" /> Pré-visualização da Barra Rolante em Tempo Real
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            {items.length} {items.length === 1 ? 'destaque ativo' : 'destaques ativos'}
          </span>
        </div>
        <div className={`overflow-hidden rounded-sm border ${themeClasses} shadow-md`}>
          <div className="py-3.5 overflow-hidden relative">
            <div className={`flex whitespace-nowrap ${previewSpeedClass}`}>
              {previewDoubled.map((item, i) => (
                <div key={i} className={`flex items-center gap-5 sm:gap-6 px-5 sm:px-6 font-serif font-bold uppercase tracking-widest select-none ${previewFontSizeClass}`}>
                  <span>{item}</span>
                  {PreviewIcon && (
                    <PreviewIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${iconColor}`} strokeWidth={2.5} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciamento dos Destaques */}
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
          Destaques Atuais na Barra Rolante:
        </label>
        
        {/* Chips dos Itens com opção de excluir e mover */}
        <div className="flex flex-wrap gap-2 p-3.5 bg-ink-light/50 border border-ink-border rounded-sm min-h-[56px] items-center">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 bg-ink border border-gold/40 text-white text-xs px-3 py-1.5 rounded-sm shadow-sm hover:border-gold transition-all group"
            >
              <span className="font-serif font-medium">{item}</span>
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'left')}
                    className="text-gray-400 hover:text-gold transition-colors cursor-pointer text-[11px] px-0.5"
                    title="Mover para esquerda"
                  >
                    ◀
                  </button>
                )}
                {idx < items.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'right')}
                    className="text-gray-400 hover:text-gold transition-colors cursor-pointer text-[11px] px-0.5"
                    title="Mover para direita"
                  >
                    ▶
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 ml-0.5"
                  title="Remover este destaque"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Adicionar Novo Destaque */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder="Escreva um novo destaque (ex: Toalha Quente, Café Expresso Gourmet, Wi-Fi 5G...)"
            className="flex-1 bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => handleAddItem()}
            disabled={!newItemText.trim()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-sm transition-colors cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Sugestões Rápidas */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-gray-400 font-medium">Sugestões rápidas para adicionar com 1 clique:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TICKER_SUGGESTIONS.map(sug => {
              const alreadyAdded = items.includes(sug);
              return (
                <button
                  key={sug}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => handleAddItem(undefined, sug)}
                  className={`text-[11px] px-2.5 py-1 rounded-sm border transition-all cursor-pointer ${
                    alreadyAdded
                      ? 'bg-ink/40 border-ink-border text-gray-500 opacity-60 cursor-not-allowed'
                      : 'bg-ink-light border-ink-border text-gray-300 hover:text-gold hover:border-gold/50 active:scale-95'
                  }`}
                >
                  {alreadyAdded ? `✓ ${sug}` : `+ ${sug}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ícone Separador e Estilo de Cores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-ink-border">
        {/* Ícone Separador */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">
            Ícone Separador entre os Destaques:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TICKER_SEPARATOR_ICONS.map(opt => {
              const IconComponent = opt.name !== 'None' ? (ICON_MAP[opt.name] || Scissors) : null;
              const isSelected = separatorIcon === opt.name;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setSeparatorIcon(opt.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-sm border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gold/20 border-gold text-white font-bold shadow-sm'
                      : 'bg-ink-light border-ink-border text-gray-400 hover:border-gold/40 hover:text-gray-200'
                  }`}
                >
                  {IconComponent ? (
                    <IconComponent className={`w-4 h-4 mb-1 ${isSelected ? 'text-gold' : 'text-gray-400'}`} />
                  ) : (
                    <span className={`text-xs mb-1 font-mono ${isSelected ? 'text-gold' : 'text-gray-400'}`}>—</span>
                  )}
                  <span className="text-[10px] leading-tight truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estilo / Tema da Faixa */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">
            Esquema de Cores da Faixa:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTheme('gold')}
              className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                theme === 'gold'
                  ? 'border-gold bg-gold/15 shadow-sm'
                  : 'border-ink-border bg-ink-light hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-gold border border-gold flex items-center justify-center text-ink text-[9px] font-bold">
                  ✓
                </div>
                <span className="text-xs font-bold text-white">Dourado Clássico</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Fundo dourado luminoso com letras pretas de alto impacto.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-gold bg-gold/15 shadow-sm'
                  : 'border-ink-border bg-ink-light hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-ink-light border border-gold flex items-center justify-center text-gold text-[9px] font-bold">
                  ✓
                </div>
                <span className="text-xs font-bold text-white">Grafite & Ouro</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Fundo cinza escuro acetinado com texto dourado requintado.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('black')}
              className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                theme === 'black'
                  ? 'border-gold bg-gold/15 shadow-sm'
                  : 'border-ink-border bg-ink-light hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-black border border-white/50 flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <span className="text-xs font-bold text-white">Preto Ônix Minimalista</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Fundo preto profundo com texto branco e ícones dourados.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('vintage')}
              className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                theme === 'vintage'
                  ? 'border-gold bg-gold/15 shadow-sm'
                  : 'border-ink-border bg-ink-light hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-[#3d271e] border border-[#b87333] flex items-center justify-center text-[#d99a6c] text-[9px] font-bold">
                  ✓
                </div>
                <span className="text-xs font-bold text-white">Cobre Vintage</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Fundo amadeirado quente estilo barbearia clássica dos anos 50.
              </p>
            </button>
          </div>
        </div>

        {/* Velocidade e Tamanho da Fonte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-ink-border">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" /> Velocidade do Deslizamento:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow', label: 'Suave' },
                { id: 'normal', label: 'Padrão' },
                { id: 'fast', label: 'Dinâmica' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpeed(s.id as any)}
                  className={`py-2.5 px-1 rounded-sm border flex items-center justify-center text-center text-[11px] sm:text-xs font-medium transition-all cursor-pointer min-h-[38px] ${
                    speed === s.id
                      ? 'bg-gold/20 border-gold text-gold font-bold shadow-sm'
                      : 'bg-ink-light border-ink-border text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-full text-center">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-gold" /> Tamanho da Tipografia:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'xs', label: 'Compacta' },
                { id: 'sm', label: 'Padrão' },
                { id: 'base', label: 'Destacada' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontSize(f.id as any)}
                  className={`py-2.5 px-1 rounded-sm border flex items-center justify-center text-center text-[11px] sm:text-xs font-medium transition-all cursor-pointer min-h-[38px] ${
                    fontSize === f.id
                      ? 'bg-gold/20 border-gold text-gold font-bold shadow-sm'
                      : 'bg-ink-light border-ink-border text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-full text-center">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminExperience() {
  const { differentials, setDifferentials, settings, updateSettings } = useContext(AppContext);
  const { tenant, tenantId, hasPermission } = useTenant();
  const { isSuperAdmin } = useAuth();
  const canWriteLanding = hasPermission('landing.write') || hasPermission('settings.write') || isSuperAdmin;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DifferentialItem | null>(null);
  const [experienceSubTab, setExperienceSubTab] = useState<'cards' | 'amenities' | 'ticker'>('cards');
  const [imageTab, setImageTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [videoTab, setVideoTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingHeaders, setIsSavingHeaders] = useState(false);
  const [isSavingAmenities, setIsSavingAmenities] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Preset images library
  const PRESET_IMAGES = [
    { label: 'Corte Premium', img: serviceHaircutImg },
    { label: 'Dia do Noivo (Ritual)', img: heroBarberImg },
    { label: 'Corte Kids / Jovem', img: barberPortraitImg },
    { label: 'Barba Clássica & Navalha', img: serviceBeardImg },
    { label: 'Lavatório & Hidratação', img: serviceHairwashImg },
    { label: 'Pomadas & Cosméticos', img: serviceProductsImg }
  ];

  // Section Headers State
  const [tagline, setTagline] = useState(settings.experienceTagline || 'Por que nos escolher');
  const [titlePrefix, setTitlePrefix] = useState(settings.experienceTitlePrefix || 'A experiência');
  const [titleHighlight, setTitleHighlight] = useState(settings.experienceTitleHighlight || 'Elite');
  const [description, setDescription] = useState(settings.experienceDescription || 'Cada detalhe é pensado para proporcionar o melhor atendimento. Na Barbearia Elite, você não é só mais um cliente — você é parte da nossa história.');
  const [savedHeaderMsg, setSavedHeaderMsg] = useState(false);

  // Amenities / Classic Differentials Sub-section State
  const [showClassic, setShowClassic] = useState(settings.showDifferentialsBelowExperiences !== false);
  const [classicTitle, setClassicTitle] = useState(settings.differentialsTitle || 'Comodidades');
  const [classicSubtitle, setClassicSubtitle] = useState(settings.differentialsSubtitle || 'Mais conforto para a sua visita');
  const [amenityList, setAmenityList] = useState<AmenityDifferentialItem[]>(
    settings.amenityDifferentials && settings.amenityDifferentials.length > 0
      ? settings.amenityDifferentials
      : DEFAULT_AMENITY_DIFFERENTIALS
  );
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
  const [amenityFormData, setAmenityFormData] = useState<AmenityDifferentialItem | null>(null);

  // Synchronize when settings update
  useEffect(() => {
    if (settings.experienceTagline !== undefined) setTagline(settings.experienceTagline);
    if (settings.experienceTitlePrefix !== undefined) setTitlePrefix(settings.experienceTitlePrefix);
    if (settings.experienceTitleHighlight !== undefined) setTitleHighlight(settings.experienceTitleHighlight);
    if (settings.experienceDescription !== undefined) setDescription(settings.experienceDescription);
    if (settings.showDifferentialsBelowExperiences !== undefined) setShowClassic(settings.showDifferentialsBelowExperiences);
    if (settings.differentialsTitle !== undefined) setClassicTitle(settings.differentialsTitle);
    if (settings.differentialsSubtitle !== undefined) setClassicSubtitle(settings.differentialsSubtitle);
    if (settings.amenityDifferentials !== undefined && settings.amenityDifferentials.length > 0) {
      setAmenityList(settings.amenityDifferentials);
    }
  }, [
    settings.experienceTagline,
    settings.experienceTitlePrefix,
    settings.experienceTitleHighlight,
    settings.experienceDescription,
    settings.showDifferentialsBelowExperiences,
    settings.differentialsTitle,
    settings.differentialsSubtitle,
    settings.amenityDifferentials
  ]);

  const list = (differentials && differentials.length > 0) ? differentials : DEFAULT_DIFFERENTIALS;

  const handleEdit = (d: DifferentialItem) => {
    if (!canWriteLanding) return;
    setEditingId(d.id || 'temp');
    const cleanImg = (d.image && d.image.trim().length > 0) ? d.image.trim() : serviceHaircutImg;
    const isVid = d.mediaType === 'video' || Boolean(d.videoUrl && d.videoUrl.trim().length > 0);
    const vidUrl = d.videoUrl ? d.videoUrl.trim() : '';

    setFormData({ 
      ...d, 
      image: cleanImg,
      mediaType: isVid ? 'video' : 'image',
      videoUrl: vidUrl
    });
    setCustomImageUrl(cleanImg.startsWith('http') ? cleanImg : '');
    setImageTab(cleanImg.startsWith('http') ? 'url' : 'presets');
    setCustomVideoUrl(vidUrl);
    setVideoTab(vidUrl.startsWith('http') ? 'url' : 'presets');
    setSaveError(null);
  };

  const handleAddNew = () => {
    if (!canWriteLanding) return;
    setEditingId('NEW');
    setFormData({
      id: 'diff_' + Math.random().toString(36).substring(2, 9),
      title: '',
      desc: '',
      image: serviceHaircutImg,
      mediaType: 'image',
      videoUrl: '',
      tag: 'Destaque',
      iconName: 'Sparkles',
      price: '',
      duration: '45 min'
    });
    setCustomImageUrl('');
    setImageTab('presets');
    setCustomVideoUrl('');
    setVideoTab('presets');
    setSaveError(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !canWriteLanding) return;
    const updated = list.filter(d => d.id !== id);
    try {
      await setDifferentials(updated);
      setFeedbackNotice('Card de experiência removido com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
      if (editingId === id) {
        setEditingId(null);
        setFormData(null);
      }
    } catch (err: any) {
      console.error('Erro ao excluir diferencial:', err);
      setSaveError(err.message || 'Erro ao excluir item.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setSaveError(null);
    try {
      const targetTenantId = tenant?.id || tenantId;
      if (targetTenantId) {
        const uploadedUrl = await uploadExperienceImage(targetTenantId, file, formData?.id || undefined);
        setFormData(prev => prev ? { ...prev, image: uploadedUrl } : null);
      } else {
        const compressed = await compressImage(file, 700, 700, 0.75);
        setFormData(prev => prev ? { ...prev, image: compressed } : null);
      }
    } catch (err: any) {
      console.warn('Erro ao processar imagem:', err);
      setSaveError('Erro ao enviar imagem: ' + (err.message || ''));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData(prev => prev ? { ...prev, image: customImageUrl.trim() } : null);
  };

  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setVideoUploadProgress(10);
    setSaveError(null);
    try {
      const targetTenantId = tenant?.id || tenantId || 'default';
      const { url: videoUrlString, isLocal } = await uploadExperienceVideo(
        targetTenantId,
        file,
        (p) => setVideoUploadProgress(p)
      );
      setFormData(prev => prev ? { ...prev, mediaType: 'video', videoUrl: videoUrlString, image: '' } : null);
      if (!videoUrlString.startsWith('local_media:')) {
        setCustomVideoUrl(videoUrlString);
      } else {
        setCustomVideoUrl('');
      }
      setCustomImageUrl('');
      if (isLocal) {
        setFeedbackNotice('Vídeo processado e salvo para exibição no aplicativo!');
      } else {
        setFeedbackNotice('Vídeo enviado para a nuvem em alta qualidade!');
      }
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      console.warn('Erro ao processar vídeo:', err);
      setSaveError(err.message || 'Erro ao enviar vídeo.');
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(null);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const applyCustomVideoUrl = () => {
    if (!customVideoUrl.trim()) return;
    setFormData(prev => prev ? { ...prev, mediaType: 'video', videoUrl: customVideoUrl.trim(), image: '' } : null);
    setCustomImageUrl('');
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !canWriteLanding) return;
    if (!formData.title.trim() || !formData.desc.trim()) {
      setSaveError('Por favor, informe o título e a descrição da experiência.');
      return;
    }

    setIsSavingItem(true);
    setSaveError(null);
    try {
      let cleanImage = (formData.image && formData.image.trim()) ? formData.image.trim() : '';
      if (formData.mediaType === 'video') {
        cleanImage = '';
      } else {
        if (!cleanImage) cleanImage = serviceHaircutImg;
        if (imageTab === 'url' && customImageUrl.trim()) {
          cleanImage = customImageUrl.trim();
        } else if (cleanImage.startsWith('data:') || cleanImage.length > 30000) {
          try {
            cleanImage = await compressImage(cleanImage, 600, 600, 0.75);
          } catch (compErr) {
            console.warn('Compressão de imagem de experiência:', compErr);
          }
        }
      }

      let cleanVideoUrl = (formData.videoUrl && typeof formData.videoUrl === 'string') ? formData.videoUrl.trim() : '';
      if (formData.mediaType === 'video' && videoTab === 'url' && customVideoUrl.trim()) {
        cleanVideoUrl = customVideoUrl.trim();
      }

      const isVid = formData.mediaType === 'video';

      const currentCardId = (editingId === 'NEW' || !formData.id) 
        ? ('diff_' + Math.random().toString(36).substring(2, 9)) 
        : formData.id;

      const sanitized: DifferentialItem = {
        id: currentCardId,
        title: formData.title.trim(),
        desc: formData.desc.trim(),
        tag: formData.tag?.trim() || '',
        price: formData.price?.trim() || '',
        duration: formData.duration?.trim() || '',
        iconName: formData.iconName || 'Sparkles',
        image: isVid ? '' : cleanImage,
        mediaType: isVid ? 'video' : 'image',
        videoUrl: isVid ? cleanVideoUrl : ''
      };

      if (editingId === 'NEW') {
        await setDifferentials([...list, sanitized]);
        setFeedbackNotice('Nova experiência adicionada e salva com sucesso!');
      } else {
        const updated = list.map(d => (d.id === editingId ? sanitized : d));
        await setDifferentials(updated);
        setFeedbackNotice('Card de experiência atualizado com sucesso!');
      }
      setTimeout(() => setFeedbackNotice(null), 4000);
      setEditingId(null);
      setFormData(null);
    } catch (err: any) {
      console.error('Erro ao salvar experiência:', err);
      setSaveError(err.message || 'Erro ao persistir alterações.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleSaveHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteLanding) return;
    setIsSavingHeaders(true);
    setSaveError(null);
    try {
      await updateSettings({
        experienceTagline: tagline.trim(),
        experienceTitlePrefix: titlePrefix.trim(),
        experienceTitleHighlight: titleHighlight.trim(),
        experienceDescription: description.trim()
      });
      setSavedHeaderMsg(true);
      setFeedbackNotice('Títulos e textos da seção de experiências salvos com sucesso!');
      setTimeout(() => {
        setSavedHeaderMsg(false);
        setFeedbackNotice(null);
      }, 3500);
    } catch (err: any) {
      console.error('Erro ao salvar cabeçalho de experiências:', err);
      setSaveError(err.message || 'Erro ao salvar títulos da experiência.');
    } finally {
      setIsSavingHeaders(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!canWriteLanding) return;
    if (window.confirm('Deseja restaurar os 3 cards principais de experiência (Corte Premium, Dia do Noivo e Corte Kids)?')) {
      try {
        await setDifferentials(DEFAULT_DIFFERENTIALS);
        await updateSettings({
          experienceTagline: 'Por que nos escolher',
          experienceTitlePrefix: 'A experiência',
          experienceTitleHighlight: 'Elite',
          experienceDescription: 'Cada detalhe é pensado para proporcionar o melhor atendimento. Na Barbearia Elite, você não é só mais um cliente — você é parte da nossa história.'
        });
        setTagline('Por que nos escolher');
        setTitlePrefix('A experiência');
        setTitleHighlight('Elite');
        setDescription('Cada detalhe é pensado para proporcionar o melhor atendimento. Na Barbearia Elite, você não é só mais um cliente — você é parte da nossa história.');
        setEditingId(null);
        setFormData(null);
        setFeedbackNotice('Os 3 cards de experiências foram restaurados para o padrão.');
        setTimeout(() => setFeedbackNotice(null), 3500);
      } catch (err: any) {
        setSaveError('Erro ao restaurar padrões: ' + (err.message || ''));
      }
    }
  };

  // Amenities handlers
  const handleSaveAmenitiesSettings = async () => {
    if (!canWriteLanding) return;
    setIsSavingAmenities(true);
    setSaveError(null);
    try {
      await updateSettings({
        showDifferentialsBelowExperiences: showClassic,
        differentialsTitle: classicTitle.trim() || 'Comodidades',
        differentialsSubtitle: classicSubtitle.trim() || 'Mais conforto para a sua visita',
        amenityDifferentials: amenityList
      });
      setFeedbackNotice('Configurações de comodidades salvas com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setSaveError('Erro ao salvar comodidades: ' + err.message);
    } finally {
      setIsSavingAmenities(false);
    }
  };

  const handleEditAmenity = (item: AmenityDifferentialItem) => {
    setEditingAmenityId(item.id || 'temp');
    setAmenityFormData({ ...item });
  };

  const handleAddNewAmenity = () => {
    setEditingAmenityId('NEW');
    setAmenityFormData({
      id: 'amenity_' + Math.random().toString(36).substring(2, 9),
      title: '',
      desc: '',
      iconName: 'Sparkles'
    });
  };

  const handleDeleteAmenity = async (id?: string) => {
    if (!id || !canWriteLanding) return;
    const updated = amenityList.filter(a => a.id !== id);
    setAmenityList(updated);
    try {
      await updateSettings({ amenityDifferentials: updated });
      setFeedbackNotice('Comodidade removida com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
      if (editingAmenityId === id) {
        setEditingAmenityId(null);
        setAmenityFormData(null);
      }
    } catch (err: any) {
      setSaveError('Erro ao remover comodidade: ' + (err.message || ''));
    }
  };

  const handleSaveAmenityItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amenityFormData || !canWriteLanding) return;
    if (!amenityFormData.title.trim() || !amenityFormData.desc.trim()) {
      setSaveError('Informe o título e a descrição da comodidade.');
      return;
    }

    try {
      const sanitizedAmenity: AmenityDifferentialItem = {
        id: amenityFormData.id || ('amenity_' + Math.random().toString(36).substring(2, 9)),
        title: amenityFormData.title.trim(),
        desc: amenityFormData.desc.trim(),
        iconName: amenityFormData.iconName || 'Sparkles'
      };

      let updatedList: AmenityDifferentialItem[];
      if (editingAmenityId === 'NEW') {
        updatedList = [...amenityList, sanitizedAmenity];
      } else {
        updatedList = amenityList.map(a => a.id === editingAmenityId ? sanitizedAmenity : a);
      }

      setAmenityList(updatedList);
      await updateSettings({
        showDifferentialsBelowExperiences: showClassic,
        differentialsTitle: classicTitle.trim() || 'Comodidades',
        differentialsSubtitle: classicSubtitle.trim() || 'Mais conforto para a sua visita',
        amenityDifferentials: updatedList
      });

      setFeedbackNotice('Comodidade salva com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
      setEditingAmenityId(null);
      setAmenityFormData(null);
    } catch (err: any) {
      console.error('Erro ao salvar comodidade:', err);
      setSaveError(err.message || 'Erro ao persistir comodidade.');
    }
  };

  const handleResetAmenityDefaults = async () => {
    if (!canWriteLanding) return;
    if (window.confirm('Restaurar as comodidades padrão (Cerveja Gelada, Profissionais Premiados, Toalha Quente, Produtos Importados)?')) {
      try {
        setAmenityList(DEFAULT_AMENITY_DIFFERENTIALS);
        setClassicTitle('Comodidades');
        setClassicSubtitle('Mais conforto para a sua visita');
        setShowClassic(true);
        await updateSettings({
          showDifferentialsBelowExperiences: true,
          differentialsTitle: 'Comodidades',
          differentialsSubtitle: 'Mais conforto para a sua visita',
          amenityDifferentials: DEFAULT_AMENITY_DIFFERENTIALS
        });
        setFeedbackNotice('Comodidades restauradas para o padrão.');
        setTimeout(() => setFeedbackNotice(null), 3500);
      } catch (err: any) {
        setSaveError('Erro ao restaurar comodidades: ' + (err.message || ''));
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6 animate-[fadeUp_0.3s_ease-out]">
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-border pb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-gold" />
            Gerenciar Área de Experiências & Diferenciais
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Personalize os 3 cards de experiências ("Corte Premium", "Dia do Noivo", "Corte Kids"), as comodidades abaixo deles e a faixa rolante.
          </p>
        </div>
        {experienceSubTab === 'cards' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-ink border border-ink-border hover:border-gray-600 px-3 py-2 rounded-sm transition-colors cursor-pointer"
              title="Restaurar os 3 cards originais (Corte Premium, Dia do Noivo, Corte Kids)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light px-4 py-2 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Card de Experiência</span>
            </button>
          </div>
        )}
        {experienceSubTab === 'amenities' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetAmenityDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-ink border border-ink-border hover:border-gray-600 px-3 py-2 rounded-sm transition-colors cursor-pointer"
              title="Restaurar comodidades padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              type="button"
              onClick={handleAddNewAmenity}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light px-4 py-2 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Comodidade</span>
            </button>
          </div>
        )}
      </div>

      {feedbackNotice && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-xs text-emerald-300 flex items-center gap-2 animate-[fadeUp_0.15s_ease-out]">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-sm text-xs text-rose-300 flex items-center gap-2 animate-[fadeUp_0.15s_ease-out]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Sub-abas de Navegação: 3 Cards vs Comodidades vs Barra Rolante */}
      <div className="flex border-b border-ink-border gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setExperienceSubTab('cards')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold transition-all border-b-2 -mb-px cursor-pointer ${
            experienceSubTab === 'cards'
              ? 'border-gold text-gold bg-gold/10 rounded-t-sm'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3 Cards Principais (Imagens Médias)</span>
          <span className="text-[10px] bg-ink-light px-2 py-0.5 rounded text-gray-300 font-sans">{list.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setExperienceSubTab('amenities')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold transition-all border-b-2 -mb-px cursor-pointer ${
            experienceSubTab === 'amenities'
              ? 'border-gold text-gold bg-gold/10 rounded-t-sm'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Comodidades</span>
          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded font-sans font-semibold">
            {showClassic ? 'Ativo' : 'Oculto'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setExperienceSubTab('ticker')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold transition-all border-b-2 -mb-px cursor-pointer ${
            experienceSubTab === 'ticker'
              ? 'border-gold text-gold bg-gold/10 rounded-t-sm'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Faixa Rolante de Destaques (Ticker)</span>
          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded font-sans font-semibold">Ao Vivo</span>
        </button>
      </div>

      {experienceSubTab === 'ticker' ? (
        <AdminTickerSettings />
      ) : experienceSubTab === 'amenities' ? (
        /* Aba de Comodidades Abaixo dos 3 Cards */
        <div className="space-y-8">
          {/* Opções Gerais e Toggle */}
          <div className="bg-ink border border-ink-border rounded-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-ink-border pb-4">
              <div>
                <h3 className="font-serif text-base sm:text-lg text-white font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" /> Comodidades
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Permite exibir as comodidades (Cerveja Gelada, Profissionais Premiados, Toalha Quente, Produtos Importados, etc.) logo abaixo dos 3 cards de experiências com imagens.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClassic}
                  onChange={e => setShowClassic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-ink-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Título da Seção de Comodidades
                </label>
                <input
                  type="text"
                  value={classicTitle}
                  onChange={e => setClassicTitle(e.target.value)}
                  placeholder="Comodidades"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Subtítulo Superior
                </label>
                <input
                  type="text"
                  value={classicSubtitle}
                  onChange={e => setClassicSubtitle(e.target.value)}
                  placeholder="Mais conforto para a sua visita"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingAmenities}
                onClick={handleSaveAmenitiesSettings}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light disabled:opacity-50 px-4 py-2.5 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                {isSavingAmenities ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavingAmenities ? 'Salvando...' : 'Salvar Comodidades'}</span>
              </button>
            </div>
          </div>

          {/* Formulário de Adicionar / Editar Comodidade */}
          {editingAmenityId && amenityFormData && (
            <div className="bg-ink border-2 border-gold/60 rounded-sm p-5 sm:p-6 animate-[fadeUp_0.2s_ease-out] shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-ink-border pb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-sm uppercase tracking-wider ${
                    editingAmenityId === 'NEW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold/20 text-gold border border-gold/30'
                  }`}>
                    {editingAmenityId === 'NEW' ? 'Nova Comodidade' : 'Editando Comodidade'}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    {editingAmenityId === 'NEW' ? 'Cadastrar Comodidade' : (amenityFormData.title || 'Editar Comodidade')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingAmenityId(null); setAmenityFormData(null); }}
                  className="text-gray-400 hover:text-white p-1 text-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAmenityItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Título da Comodidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={amenityFormData.title}
                      onChange={e => setAmenityFormData({ ...amenityFormData, title: e.target.value })}
                      placeholder="Ex: Cerveja Gelada, Toalha Quente..."
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Ícone da Comodidade
                    </label>
                    <select
                      value={amenityFormData.iconName || 'Sparkles'}
                      onChange={e => setAmenityFormData({ ...amenityFormData, iconName: e.target.value })}
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors cursor-pointer"
                    >
                      {DIFFERENTIAL_ICONS.map(i => (
                        <option key={i.name} value={i.name} className="bg-ink text-white">
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                    Descrição da Comodidade *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={amenityFormData.desc}
                    onChange={e => setAmenityFormData({ ...amenityFormData, desc: e.target.value })}
                    placeholder="Enquanto espera ou durante o atendimento, cortesia especial da casa..."
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingAmenityId(null); setAmenityFormData(null); }}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white border border-ink-border rounded-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAmenities}
                    className="inline-flex items-center gap-2 text-xs font-bold text-ink bg-gold hover:bg-gold-light disabled:opacity-50 px-6 py-2 rounded-sm transition-colors cursor-pointer shadow-lg shadow-gold/20 active:scale-95"
                  >
                    {isSavingAmenities ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingAmenityId === 'NEW' ? 'Adicionar Comodidade' : 'Salvar Alterações'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid de Comodidades */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Lista de Comodidades</span>
                <span className="text-xs font-normal text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
                  {amenityList.length} itens
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {amenityList.map((item, idx) => {
                const AmenityIcon = (item.iconName && ICON_MAP[item.iconName]) ? ICON_MAP[item.iconName] : Sparkles;
                return (
                  <div
                    key={item.id || idx}
                    className="p-4 sm:p-5 bg-ink border border-ink-border hover:border-gold/40 rounded-sm flex flex-col justify-between group transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink transition-colors">
                          <AmenityIcon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        {canWriteLanding && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEditAmenity(item)}
                              className="p-1 text-gray-400 hover:text-gold cursor-pointer"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAmenity(item.id)}
                              className="p-1 text-gray-400 hover:text-rose-400 cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-white text-sm mb-1 group-hover:text-gold transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Títulos e Textos da Seção na Landing Page */}
          <div className="bg-ink border border-ink-border rounded-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base sm:text-lg text-white font-medium flex items-center gap-2">
                <Settings className="w-4 h-4 text-gold" /> Títulos & Texto da Seção na Landing Page
              </h3>
              {savedHeaderMsg && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Textos da seção salvos com sucesso!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Defina o subtítulo superior, o título principal com destaque dourado e o parágrafo descritivo exibido acima dos 3 cards.
            </p>

            <form onSubmit={handleSaveHeaders} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                    Subtítulo Superior
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="Por que nos escolher"
                    className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                    Prefixo do Título
                  </label>
                  <input
                    type="text"
                    value={titlePrefix}
                    onChange={e => setTitlePrefix(e.target.value)}
                    placeholder="A experiência"
                    className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                    Destaque Dourado
                  </label>
                  <input
                    type="text"
                    value={titleHighlight}
                    onChange={e => setTitleHighlight(e.target.value)}
                    placeholder="Elite"
                    className="w-full bg-ink-light border border-ink-border rounded-sm py-2 px-3 text-sm text-gold focus:border-gold outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Texto Descritivo da Experiência
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Cada detalhe é pensado para proporcionar o melhor atendimento..."
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingHeaders}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-gold hover:bg-gold-light disabled:opacity-50 px-4 py-2.5 rounded-sm transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  {isSavingHeaders ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSavingHeaders ? 'Salvando...' : 'Salvar Textos da Seção'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Formulário de Adicionar / Editar Card de Experiência */}
          {editingId && formData && (
            <div className="bg-ink border-2 border-gold/60 rounded-sm p-5 sm:p-6 animate-[fadeUp_0.2s_ease-out] shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-ink-border pb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-sm uppercase tracking-wider ${
                    editingId === 'NEW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold/20 text-gold border border-gold/30'
                  }`}>
                    {editingId === 'NEW' ? 'Novo Card' : 'Editando Card'}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    {editingId === 'NEW' ? 'Cadastrar Card de Experiência' : (formData.title || 'Editar Experiência')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData(null); }}
                  className="text-gray-400 hover:text-white p-1 text-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6">
                {/* 1. Título e Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Título da Experiência *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Corte Premium, Dia do Noivo, Corte Kids..."
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-gray-500">Sugestões rápidas:</span>
                      {['Corte Premium', 'Dia do Noivo', 'Corte Kids'].map(sug => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setFormData({ ...formData, title: sug })}
                          className="text-[10px] bg-white/5 hover:bg-gold/20 text-gray-300 hover:text-gold px-2 py-0.5 rounded border border-ink-border transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Tag / Badge em Destaque
                    </label>
                    <input
                      type="text"
                      value={formData.tag || ''}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="Ex: Mais Procurado, Experiência VIP, Especial Infantil..."
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-gray-500">Tags rápidas:</span>
                      {['Mais Procurado', 'Experiência VIP', 'Especial Infantil', 'Exclusivo'].map(tagSug => (
                        <button
                          key={tagSug}
                          type="button"
                          onClick={() => setFormData({ ...formData, tag: tagSug })}
                          className="text-[10px] bg-gold/10 hover:bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/20 transition-colors cursor-pointer"
                        >
                          {tagSug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Seleção de Mídia: Imagem ou Vídeo */}
                <div className="p-4 sm:p-5 bg-ink-light/70 border border-gold/30 rounded-sm space-y-4">
                  {/* Seletor do Tipo de Mídia */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-border">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-2">
                        {formData.mediaType === 'video' ? <Film className="w-4 h-4 text-gold" /> : <ImageIcon className="w-4 h-4 text-gold" />}
                        Mídia do Card de Experiência (Imagem ou Vídeo)
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Defina se este card exibirá uma foto ou um vídeo em reprodução contínua.
                      </p>
                    </div>

                    <div className="flex items-center bg-ink border border-ink-border rounded-sm p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            if (!prev) return null;
                            const restoredImg = (prev.image && prev.image.trim().length > 0) ? prev.image : serviceHaircutImg;
                            return {
                              ...prev,
                              mediaType: 'image',
                              image: restoredImg
                            };
                          });
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          formData.mediaType !== 'video'
                            ? 'bg-gold text-ink font-bold shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Imagem (Foto)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            if (!prev) return null;
                            const vidUrl = (prev.videoUrl && prev.videoUrl.trim().length > 0) ? prev.videoUrl : PRESET_VIDEOS[0].url;
                            setCustomVideoUrl(vidUrl);
                            return {
                              ...prev,
                              mediaType: 'video',
                              videoUrl: vidUrl,
                              image: '' // remove a seleção de qualquer imagem para carregar exclusivamente o vídeo
                            };
                          });
                          setCustomImageUrl('');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          formData.mediaType === 'video'
                            ? 'bg-gold text-ink font-bold shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Vídeo</span>
                      </button>
                    </div>
                  </div>

                  {/* CONFIGURAÇÃO SE FOR VÍDEO */}
                  {formData.mediaType === 'video' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 font-medium">Fonte do Vídeo:</span>
                        <div className="flex items-center bg-ink border border-ink-border rounded-sm p-1">
                          <button
                            type="button"
                            onClick={() => setVideoTab('presets')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              videoTab === 'presets' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Vídeos Prontos
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoTab('upload')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              videoTab === 'upload' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Upload Vídeo
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoTab('url')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              videoTab === 'url' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Link / URL
                          </button>
                        </div>
                      </div>

                      {/* Sub-tab 1: Vídeos Prontos de Barbearia */}
                      {videoTab === 'presets' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                          {PRESET_VIDEOS.map((preset, idx) => {
                            const isSelected = formData.videoUrl === preset.url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => prev ? {
                                    ...prev,
                                    mediaType: 'video',
                                    videoUrl: preset.url,
                                    image: '' // remove seleção de imagem para carregar somente o vídeo
                                  } : null);
                                  setCustomVideoUrl(preset.url);
                                }}
                                className={`group relative rounded overflow-hidden border-2 text-left transition-all cursor-pointer p-2 bg-ink ${
                                  isSelected ? 'border-gold shadow-lg shadow-gold/20 scale-[1.02]' : 'border-ink-border hover:border-gray-500 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div className="aspect-video w-full bg-ink-light rounded overflow-hidden relative mb-2">
                                  <img src={preset.poster} alt={preset.label} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-7 h-7 rounded-full bg-black/70 text-gold flex items-center justify-center border border-gold/40">
                                      <Play className="w-3.5 h-3.5 ml-0.5" />
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold text-ink flex items-center justify-center font-bold text-xs shadow-md">
                                      ✓
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] font-medium text-white block truncate">{preset.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Sub-tab 2: Upload de Vídeo */}
                      {videoTab === 'upload' && (
                        <div className="pt-2">
                          <input
                            type="file"
                            ref={videoFileInputRef}
                            onChange={handleVideoUpload}
                            accept="video/mp4,video/webm,video/quicktime,video/ogg"
                            className="hidden"
                          />
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                              type="button"
                              onClick={() => videoFileInputRef.current?.click()}
                              disabled={isUploadingVideo}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-bold px-5 py-3 rounded-sm text-xs uppercase tracking-wider cursor-pointer shadow-md"
                            >
                              {isUploadingVideo ? (
                                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{isUploadingVideo ? (videoUploadProgress !== null ? `Enviando Vídeo (${videoUploadProgress}%)...` : 'Enviando Vídeo...') : 'Escolher Vídeo do Computador / Celular'}</span>
                            </button>
                            <span className="text-xs text-gray-400">
                              Formatos aceitos: MP4, WebM, MOV. O vídeo é processado e otimizado automaticamente.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 3: Link / URL do Vídeo (YouTube, Vimeo, MP4) */}
                      {videoTab === 'url' && (
                        <div className="space-y-2 pt-2">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={customVideoUrl}
                              onChange={e => setCustomVideoUrl(e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=... ou https://exemplo.com/video.mp4"
                              className="flex-1 bg-ink border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={applyCustomVideoUrl}
                              className="bg-gold text-ink font-bold px-4 py-2 rounded-sm text-xs hover:bg-gold-light cursor-pointer whitespace-nowrap"
                            >
                              Aplicar Vídeo
                            </button>
                          </div>
                          <span className="text-[11px] text-gray-400 block">
                            Suporta YouTube (vídeos regulares, shorts e links de incorporação), Vimeo e arquivos MP4/WebM externos.
                          </span>
                        </div>
                      )}

                      {/* Vídeo Selecionado & Status */}
                      {formData.videoUrl ? (
                        <div className="p-3 bg-ink border border-gold/40 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs text-gray-300">
                            <Film className="w-4 h-4 text-gold shrink-0" />
                            <div>
                              <span className="text-gold font-semibold block">Vídeo Ativo</span>
                              <span className="text-[11px] text-gray-400 font-mono truncate max-w-md block">
                                {formData.videoUrl.startsWith('data:') ? 'Arquivo de vídeo local carregado' : formData.videoUrl}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => prev ? { ...prev, videoUrl: '' } : null);
                              setCustomVideoUrl('');
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            Remover Vídeo
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Selecione um vídeo pronto acima, envie um arquivo ou informe um link para ativar o vídeo neste card.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CONFIGURAÇÃO SE FOR IMAGEM */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 font-medium">Origem da Foto:</span>
                        <div className="flex items-center bg-ink border border-ink-border rounded-sm p-1">
                          <button
                            type="button"
                            onClick={() => setImageTab('presets')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              imageTab === 'presets' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Prontas
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('upload')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              imageTab === 'upload' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Upload Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('url')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                              imageTab === 'url' ? 'bg-gold text-ink font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            URL Foto
                          </button>
                        </div>
                      </div>

                      {/* Sub-tab 1: Presets Visuais */}
                      {imageTab === 'presets' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
                          {PRESET_IMAGES.map((preset, idx) => {
                            const isSelected = formData.image === preset.img;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFormData({ ...formData, image: preset.img })}
                                className={`group relative rounded overflow-hidden border-2 text-left transition-all cursor-pointer ${
                                  isSelected ? 'border-gold shadow-lg shadow-gold/20 scale-[1.03]' : 'border-ink-border opacity-70 hover:opacity-100 hover:border-gray-500'
                                }`}
                              >
                                <div className="aspect-[4/3] w-full bg-ink relative overflow-hidden">
                                  <img src={preset.img} alt={preset.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                                      <div className="w-6 h-6 rounded-full bg-gold text-ink flex items-center justify-center font-bold text-xs shadow-md">
                                        ✓
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="p-1.5 bg-ink text-[10px] font-medium text-white truncate text-center">
                                  {preset.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Sub-tab 2: Upload de Foto */}
                      {imageTab === 'upload' && (
                        <div className="pt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                          />
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingImage}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-bold px-5 py-3 rounded-sm text-xs uppercase tracking-wider cursor-pointer shadow-md"
                            >
                              {isUploadingImage ? (
                                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{isUploadingImage ? 'Processando Imagem...' : 'Escolher Imagem do Dispositivo'}</span>
                            </button>
                            <span className="text-xs text-gray-400">
                              Formatos aceitos: JPG, PNG, WEBP. A imagem será otimizada automaticamente.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 3: Inserir Link direto */}
                      {imageTab === 'url' && (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="url"
                            value={customImageUrl}
                            onChange={e => setCustomImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/foto-experiencia.jpg"
                            className="flex-1 bg-ink border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={applyCustomUrl}
                            className="bg-gold text-ink font-bold px-4 py-2 rounded-sm text-xs hover:bg-gold-light cursor-pointer whitespace-nowrap"
                          >
                            Aplicar URL
                          </button>
                        </div>
                      )}

                      {/* Prévia da Imagem Selecionada */}
                      {formData.image && (
                        <div className="flex items-center gap-4 pt-3 border-t border-ink-border">
                          <div className="w-24 h-18 sm:w-28 sm:h-20 rounded border border-gold/40 overflow-hidden bg-ink shrink-0 relative shadow-md">
                            <img src={formData.image} alt="Prévia" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-xs">
                            <span className="text-gold font-semibold block">Imagem Selecionada</span>
                            <span className="text-gray-400 text-[11px] truncate block max-w-sm">
                              {formData.image.startsWith('data:') ? 'Imagem carregada localmente' : (formData.image.startsWith('http') ? formData.image : 'Imagem padrão')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Preço, Duração e Ícone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Preço (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Ex: R$ 50"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Duração Estimada
                    </label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Ex: 45 min"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Ícone do Card
                    </label>
                    <select
                      value={formData.iconName || 'Sparkles'}
                      onChange={e => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm transition-colors cursor-pointer"
                    >
                      {DIFFERENTIAL_ICONS.map(i => (
                        <option key={i.name} value={i.name} className="bg-ink text-white">
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Descrição da Experiência */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                    Descrição Detalhada da Experiência *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.desc}
                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="Descreva o que torna esta experiência única, etapas do atendimento, produtos utilizados..."
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-3 text-white rounded-sm text-sm resize-none transition-colors"
                  />
                </div>

                {/* 5. Prévia do Card em Tempo Real */}
                <div className="p-4 bg-ink-light/40 border border-gold/20 rounded-sm space-y-3">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-gold" /> Pré-visualização do Card na Landing Page
                  </span>
                  
                  <div className="max-w-sm mx-auto vintage-card rounded-sm overflow-hidden border border-gold/40 shadow-xl bg-ink-surface">
                    <ExperienceCardMedia
                      item={formData}
                      fallbackImage={formData.image || serviceHaircutImg}
                      icon={(formData.iconName && ICON_MAP[formData.iconName]) ? ICON_MAP[formData.iconName] : Sparkles}
                    />
                    <div className="p-4 space-y-2">
                      <h4 className="font-serif text-lg font-bold text-white">{formData.title || 'Título da Experiência'}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{formData.desc || 'Descrição da experiência...'}</p>
                      {(formData.price || formData.duration) && (
                        <div className="pt-2 border-t border-ink-border flex items-center justify-between text-xs">
                          {formData.price && <span className="font-serif font-bold text-gold">{formData.price}</span>}
                          {formData.duration && <span className="text-gray-400 font-mono">{formData.duration}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações do Formulário */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setFormData(null); }}
                    className="px-4 py-2.5 text-xs text-gray-400 hover:text-white border border-ink-border rounded-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingItem}
                    className="inline-flex items-center gap-2 text-xs font-bold text-ink bg-gold hover:bg-gold-light disabled:opacity-50 px-6 py-2.5 rounded-sm transition-colors cursor-pointer shadow-lg shadow-gold/20 active:scale-95"
                  >
                    {isSavingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingId === 'NEW' ? (isSavingItem ? 'Cadastrando...' : 'Cadastrar Experiência') : (isSavingItem ? 'Salvando...' : 'Salvar Alterações')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Cards de Experiência Atuais */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Cards de Experiências Ativos na Landing Page</span>
                <span className="text-xs font-normal text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
                  {list.length} {list.length === 1 ? 'card' : 'cards'}
                </span>
              </h3>
            </div>

            {list.length === 0 ? (
              <div className="bg-ink border border-ink-border rounded-sm p-12 text-center">
                <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Nenhum card de experiência cadastrado no momento.</p>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="bg-gold text-ink text-xs font-bold px-4 py-2 rounded-sm hover:bg-gold-light cursor-pointer"
                >
                  Adicionar Primeiro Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((d, idx) => {
                  const isCurrentlyEditing = editingId === d.id;
                  const cardImg = (d.image && typeof d.image === 'string' && d.image.trim().length > 0)
                    ? d.image.trim()
                    : PRESET_IMAGES[idx % PRESET_IMAGES.length].img;

                  return (
                    <div
                      key={d.id || idx}
                      className={`bg-ink border rounded-sm overflow-hidden flex flex-col justify-between relative transition-all ${
                        isCurrentlyEditing
                          ? 'border-gold shadow-xl shadow-gold/10'
                          : 'border-ink-border hover:border-gold/40'
                      }`}
                    >
                      {/* Miniatura da Mídia (Imagem ou Vídeo) */}
                      <div className="relative w-full h-48 overflow-hidden bg-ink-light flex-shrink-0">
                        <ExperienceCardMedia
                          item={d}
                          fallbackImage={cardImg}
                          icon={(d.iconName && ICON_MAP[d.iconName]) ? ICON_MAP[d.iconName] : Sparkles}
                        />

                        {canWriteLanding && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 z-30">
                            <button
                              type="button"
                              onClick={() => handleEdit(d)}
                              className="p-1.5 bg-black/80 hover:bg-gold text-white hover:text-ink rounded-sm transition-colors cursor-pointer backdrop-blur-sm shadow-md"
                              title="Editar este card"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(d.id)}
                              className="p-1.5 bg-black/80 hover:bg-rose-500 text-white rounded-sm transition-colors cursor-pointer backdrop-blur-sm shadow-md"
                              title="Excluir este card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Informações do Card */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-white text-base sm:text-lg mb-1.5">{d.title}</h4>
                          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-3">{d.desc}</p>
                        </div>

                        <div className="pt-3 border-t border-ink-border mt-2 flex items-center justify-between text-xs">
                          {d.price ? (
                            <span className="font-serif font-bold text-gold">{d.price}</span>
                          ) : (
                            <span className="text-[11px] text-gray-500 font-mono">Card #{idx + 1}</span>
                          )}
                          {d.duration && (
                            <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold/70" /> {d.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPlans() {
  const { settings, updateSettings } = useContext(AppContext);
  const { hasPermission } = useTenant();
  const { isSuperAdmin } = useAuth();
  const canWrite = hasPermission('landing.write') || hasPermission('settings.write') || isSuperAdmin;

  const [planCategory, setPlanCategory] = useState<'main' | 'weekly'>('main');

  // Main Plans State
  const [tagline, setTagline] = useState(settings.plansTagline || 'Assinaturas & Clubes');
  const [titlePrefix, setTitlePrefix] = useState(settings.plansTitlePrefix || 'Nossos');
  const [titleHighlight, setTitleHighlight] = useState(settings.plansTitleHighlight || 'Planos');
  const [description, setDescription] = useState(settings.plansDescription || 'Garanta seu visual impecável o mês inteiro com nossos clubes de assinatura exclusivos.');
  
  const [plans, setPlans] = useState<BarbershopPlan[]>(() => 
    (settings.plansList && settings.plansList.length > 0) ? settings.plansList : DEFAULT_BARBERSHOP_PLANS
  );
  const [editingPlan, setEditingPlan] = useState<BarbershopPlan | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  // Weekly Plans State
  const [weeklyTagline, setWeeklyTagline] = useState(settings.weeklyPlansTagline || 'Flexibilidade & Economia Semanal');
  const [weeklyTitlePrefix, setWeeklyTitlePrefix] = useState(settings.weeklyPlansTitlePrefix || 'Pequenos');
  const [weeklyTitleHighlight, setWeeklyTitleHighlight] = useState(settings.weeklyPlansTitleHighlight || 'Planos Semanais');
  const [weeklyDescription, setWeeklyDescription] = useState(settings.weeklyPlansDescription || 'Passes de curta duração ideais para manter seu visual impecável semana a semana com menor custo.');

  const [weeklyPlans, setWeeklyPlans] = useState<BarbershopWeeklyPlan[]>(() =>
    (settings.weeklyPlansList && settings.weeklyPlansList.length > 0) ? settings.weeklyPlansList : DEFAULT_WEEKLY_BARBERSHOP_PLANS
  );
  const [editingWeeklyPlan, setEditingWeeklyPlan] = useState<BarbershopWeeklyPlan | null>(null);
  const [isNewWeeklyPlan, setIsNewWeeklyPlan] = useState(false);
  const [weeklyFeatureInput, setWeeklyFeatureInput] = useState('');

  // Notifications
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [isSavingPlans, setIsSavingPlans] = useState(false);
  const [notice, setFeedbackNotice] = useState<string | null>(null);
  const [errorMsg, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.plansTagline !== undefined) setTagline(settings.plansTagline);
    if (settings.plansTitlePrefix !== undefined) setTitlePrefix(settings.plansTitlePrefix);
    if (settings.plansTitleHighlight !== undefined) setTitleHighlight(settings.plansTitleHighlight);
    if (settings.plansDescription !== undefined) setDescription(settings.plansDescription);
    if (settings.plansList !== undefined && settings.plansList.length > 0) {
      setPlans(settings.plansList);
    }

    if (settings.weeklyPlansTagline !== undefined) setWeeklyTagline(settings.weeklyPlansTagline);
    if (settings.weeklyPlansTitlePrefix !== undefined) setWeeklyTitlePrefix(settings.weeklyPlansTitlePrefix);
    if (settings.weeklyPlansTitleHighlight !== undefined) setWeeklyTitleHighlight(settings.weeklyPlansTitleHighlight);
    if (settings.weeklyPlansDescription !== undefined) setWeeklyDescription(settings.weeklyPlansDescription);
    if (settings.weeklyPlansList !== undefined && settings.weeklyPlansList.length > 0) {
      setWeeklyPlans(settings.weeklyPlansList);
    }
  }, [
    settings.plansTagline, settings.plansTitlePrefix, settings.plansTitleHighlight, settings.plansDescription, settings.plansList,
    settings.weeklyPlansTagline, settings.weeklyPlansTitlePrefix, settings.weeklyPlansTitleHighlight, settings.weeklyPlansDescription, settings.weeklyPlansList
  ]);

  // Main Plans Handlers
  const handleSaveHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setIsSavingHeader(true);
    setSaveError(null);
    try {
      await updateSettings({
        plansTagline: tagline.trim(),
        plansTitlePrefix: titlePrefix.trim(),
        plansTitleHighlight: titleHighlight.trim(),
        plansDescription: description.trim()
      });
      setFeedbackNotice('Cabeçalho dos Planos Principais salvo com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar cabeçalho.');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleSavePlanList = async (updatedPlans: BarbershopPlan[]) => {
    if (!canWrite) return;
    setIsSavingPlans(true);
    setSaveError(null);
    try {
      setPlans(updatedPlans);
      await updateSettings({
        plansList: updatedPlans
      });
      setFeedbackNotice('Planos Principais atualizados com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar lista de planos.');
    } finally {
      setIsSavingPlans(false);
    }
  };

  const handleAddNew = () => {
    const newP: BarbershopPlan = {
      id: 'plan_' + Date.now(),
      name: 'Novo Plano de Assinatura',
      price: 'R$ 99,90',
      period: '/ mês',
      description: 'Descrição sucinta dos benefícios oferecidos aos assinantes.',
      features: ['Atendimento prioritário', 'Desconto em produtos', 'Cortesia especial'],
      popular: false,
      badge: '',
      buttonText: 'Assinar Agora',
      buttonLink: ''
    };
    setEditingPlan(newP);
    setIsNewPlan(true);
  };

  const handleEdit = (p: BarbershopPlan) => {
    setEditingPlan({ ...p, features: [...p.features] });
    setIsNewPlan(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este plano?')) return;
    const updated = plans.filter(p => p.id !== id);
    await handleSavePlanList(updated);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    if (!editingPlan.name.trim() || !editingPlan.price.trim()) {
      setSaveError('Informe o nome e o valor do plano.');
      return;
    }

    let updated: BarbershopPlan[];
    if (isNewPlan) {
      updated = [...plans, editingPlan];
    } else {
      updated = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
    }

    await handleSavePlanList(updated);
    setEditingPlan(null);
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, featureInput.trim()]
    });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index)
    });
  };

  // Weekly Plans Handlers
  const handleSaveWeeklyHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setIsSavingHeader(true);
    setSaveError(null);
    try {
      await updateSettings({
        weeklyPlansTagline: weeklyTagline.trim(),
        weeklyPlansTitlePrefix: weeklyTitlePrefix.trim(),
        weeklyPlansTitleHighlight: weeklyTitleHighlight.trim(),
        weeklyPlansDescription: weeklyDescription.trim()
      });
      setFeedbackNotice('Cabeçalho dos Planos Semanais salvo com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar cabeçalho semanal.');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleSaveWeeklyPlanList = async (updatedWeeklyPlans: BarbershopWeeklyPlan[]) => {
    if (!canWrite) return;
    setIsSavingPlans(true);
    setSaveError(null);
    try {
      setWeeklyPlans(updatedWeeklyPlans);
      await updateSettings({
        weeklyPlansList: updatedWeeklyPlans
      });
      setFeedbackNotice('Planos Semanais atualizados com sucesso!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar lista de planos semanais.');
    } finally {
      setIsSavingPlans(false);
    }
  };

  const handleAddNewWeekly = () => {
    const newWP: BarbershopWeeklyPlan = {
      id: 'weekly_' + Date.now(),
      name: 'Novo Passe Semanal',
      price: 'R$ 35,00',
      period: '/ semana',
      description: 'Passe semanal prático para manter seu visual alinhado durante a semana.',
      features: ['1 Atendimento Semanal', 'Agendamento Flexível'],
      popular: false,
      badge: 'SEMANAL',
      buttonText: 'Garantir Passe Semanal',
      buttonLink: ''
    };
    setEditingWeeklyPlan(newWP);
    setIsNewWeeklyPlan(true);
  };

  const handleEditWeekly = (wp: BarbershopWeeklyPlan) => {
    setEditingWeeklyPlan({ ...wp, features: [...wp.features] });
    setIsNewWeeklyPlan(false);
  };

  const handleDeleteWeekly = async (id: string) => {
    if (!confirm('Deseja realmente remover este plano semanal?')) return;
    const updated = weeklyPlans.filter(p => p.id !== id);
    await handleSaveWeeklyPlanList(updated);
  };

  const handleSaveWeeklyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeeklyPlan) return;
    if (!editingWeeklyPlan.name.trim() || !editingWeeklyPlan.price.trim()) {
      setSaveError('Informe o nome e o valor do plano semanal.');
      return;
    }

    let updated: BarbershopWeeklyPlan[];
    if (isNewWeeklyPlan) {
      updated = [...weeklyPlans, editingWeeklyPlan];
    } else {
      updated = weeklyPlans.map(p => p.id === editingWeeklyPlan.id ? editingWeeklyPlan : p);
    }

    await handleSaveWeeklyPlanList(updated);
    setEditingWeeklyPlan(null);
  };

  const addWeeklyFeature = () => {
    if (!weeklyFeatureInput.trim() || !editingWeeklyPlan) return;
    setEditingWeeklyPlan({
      ...editingWeeklyPlan,
      features: [...editingWeeklyPlan.features, weeklyFeatureInput.trim()]
    });
    setWeeklyFeatureInput('');
  };

  const removeWeeklyFeature = (index: number) => {
    if (!editingWeeklyPlan) return;
    setEditingWeeklyPlan({
      ...editingWeeklyPlan,
      features: editingWeeklyPlan.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-ink-light via-ink-surface to-ink p-6 rounded-sm border border-gold/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest mb-1">
            <Crown className="w-4 h-4" />
            <span>Gerenciador de Planos & Assinaturas</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">
            Planos & Clubes da Barbearia
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Configure os planos principais e os pequenos planos semanais exibidos na Landing Page na aba de Planos.
          </p>
        </div>
        <button
          type="button"
          onClick={planCategory === 'main' ? handleAddNew : handleAddNewWeekly}
          disabled={!canWrite}
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{planCategory === 'main' ? 'Novo Plano Principal' : 'Novo Plano Semanal'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-semibold rounded flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-semibold rounded flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sub-Navegação de Categorias: Planos Principais vs Pequenos Planos Semanais */}
      <div className="flex border-b border-ink-border gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => { setPlanCategory('main'); setEditingPlan(null); setEditingWeeklyPlan(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-serif font-bold transition-all border-b-2 -mb-px cursor-pointer ${
            planCategory === 'main'
              ? 'border-gold text-gold bg-gold/10 rounded-t-sm'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Planos Principais (Mensais / Anuais)</span>
          <span className="text-[10px] bg-ink-light px-2 py-0.5 rounded text-gray-300 font-sans">{plans.length}</span>
        </button>

        <button
          type="button"
          onClick={() => { setPlanCategory('weekly'); setEditingPlan(null); setEditingWeeklyPlan(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-serif font-bold transition-all border-b-2 -mb-px cursor-pointer ${
            planCategory === 'weekly'
              ? 'border-gold text-gold bg-gold/10 rounded-t-sm'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Pequenos Planos Semanais</span>
          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded font-sans font-semibold">{weeklyPlans.length}</span>
        </button>
      </div>

      {planCategory === 'main' ? (
        /* ================= CATEGORIA 1: PLANOS PRINCIPAIS ================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Section 1: Header Configuration */}
          <div className="vintage-card p-6 rounded-sm border border-ink-border bg-ink space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-ink-border">
              <Pencil className="w-4 h-4 text-gold" />
              Configuração do Cabeçalho dos Planos Principais na Landing Page
            </h3>

            <form onSubmit={handleSaveHeaders} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Tagline (Subtítulo Superior)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Assinaturas & Clubes"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Título (Prefixo)
                  </label>
                  <input
                    type="text"
                    value={titlePrefix}
                    onChange={e => setTitlePrefix(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Nossos"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Título (Destaque em Ouro)
                  </label>
                  <input
                    type="text"
                    value={titleHighlight}
                    onChange={e => setTitleHighlight(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Planos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                  Descrição da Seção
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs resize-none"
                  placeholder="Descreva a vantagem dos clubes de assinatura..."
                />
              </div>

              <button
                type="submit"
                disabled={isSavingHeader || !canWrite}
                className="inline-flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 font-bold px-4 py-2 rounded-sm text-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingHeader ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Salvar Cabeçalho Principais</span>
              </button>
            </form>
          </div>

          {/* Form para Adicionar / Editar Plano Principal */}
          {editingPlan && (
            <div className="vintage-card p-6 rounded-sm border-2 border-gold/50 bg-ink-surface shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-ink-border">
                <div className="flex items-center gap-2 text-gold font-bold text-sm">
                  <Crown className="w-4 h-4" />
                  <span>{isNewPlan ? 'Cadastrar Novo Plano Principal' : 'Editar Plano Principal'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Nome do Plano *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPlan.name}
                      onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      placeholder="Ex: Clube VIP Cabelo & Barba"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                        Preço (R$) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPlan.price}
                        onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })}
                        placeholder="Ex: R$ 149,90"
                        className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-bold text-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                        Periodicidade
                      </label>
                      <input
                        type="text"
                        value={editingPlan.period || ''}
                        onChange={e => setEditingPlan({ ...editingPlan, period: e.target.value })}
                        placeholder="Ex: / mês"
                        className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={editingPlan.buttonText || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, buttonText: e.target.value })}
                      placeholder="Ex: Assinhar Plano ou Garantir Vaga"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Selo de Destaque / Badge
                    </label>
                    <input
                      type="text"
                      value={editingPlan.badge || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                      placeholder="Ex: MAIS POPULAR, ECONÔMICO"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="plan-popular-check"
                    checked={Boolean(editingPlan.popular)}
                    onChange={e => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <label htmlFor="plan-popular-check" className="text-xs text-white font-medium cursor-pointer">
                    Destacar como Plano Mais Popular (Borda Dourada & Brilho na Landing Page)
                  </label>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={editingPlan.description}
                    onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    placeholder="Resumo em 1 ou 2 frases sobre quem deve assinar este plano..."
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs resize-none"
                  />
                </div>

                {/* Gerenciador de Benefícios */}
                <div className="space-y-2 p-3 bg-ink/70 border border-ink-border rounded-sm">
                  <label className="block text-xs uppercase tracking-wider text-gold font-semibold">
                    Benefícios Incluídos no Plano
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                      placeholder="Ex: Cortes ilimitados no mês ou Cerveja cortesia"
                      className="flex-1 bg-ink-light border border-ink-border focus:border-gold outline-none p-2 text-white rounded-sm text-xs"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-1.5 bg-gold text-ink font-bold text-xs rounded-sm hover:bg-gold-light cursor-pointer whitespace-nowrap"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {editingPlan.features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-ink-light rounded text-xs text-gray-200 border border-ink-border">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{f}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          title="Remover benefício"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {editingPlan.features.length === 0 && (
                      <span className="text-[11px] text-gray-500 italic block">Nenhum benefício adicionado ainda.</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-border">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 bg-ink border border-ink-border text-gray-400 hover:text-white rounded-sm text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPlans || !canWrite}
                    className="px-5 py-2 bg-gold hover:bg-gold-light text-ink font-bold rounded-sm text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPlans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Salvar Plano Principal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Active Main Plans Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold" />
                <span>Planos Principais Cadastrados ({plans.length})</span>
              </h3>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-12 bg-ink border border-ink-border rounded-sm">
                <CreditCard className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                <p className="text-gray-300 text-sm font-medium">Nenhum plano principal cadastrado.</p>
                <p className="text-gray-500 text-xs mt-1">Clique em "Novo Plano Principal" para criar um clube de assinatura.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className={`vintage-card p-5 rounded-sm border flex flex-col justify-between relative bg-ink ${
                      p.popular ? 'border-gold shadow-lg shadow-gold/10' : 'border-ink-border'
                    }`}
                  >
                    {p.popular && (
                      <div className="absolute top-3 right-3 bg-gold text-ink font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                        <span>Destaque</span>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-gold font-bold uppercase tracking-wider mb-1">
                        {p.badge || 'Plano'}
                      </div>
                      <h4 className="font-serif text-xl font-bold text-white mb-1">{p.name}</h4>
                      <div className="text-2xl font-extrabold text-gold font-serif my-2">
                        {p.price} <span className="text-xs font-normal text-gray-400 font-sans">{p.period}</span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4 font-light">{p.description}</p>

                      <div className="space-y-1 text-xs text-gray-300 mb-4 border-t border-ink-border pt-3">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-1">
                          Benefícios ({p.features.length})
                        </span>
                        {p.features.slice(0, 3).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3 h-3 text-gold shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                        {p.features.length > 3 && (
                          <span className="text-[10px] text-gold font-medium">+{p.features.length - 3} mais</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-border mt-auto">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= CATEGORIA 2: PEQUENOS PLANOS SEMANAIS ================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Section 1: Header Configuration for Weekly Plans */}
          <div className="vintage-card p-6 rounded-sm border border-gold/30 bg-ink space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-ink-border">
              <Zap className="w-4 h-4 text-gold" />
              Configuração da Seção de Pequenos Planos Semanais na Landing Page
            </h3>

            <form onSubmit={handleSaveWeeklyHeaders} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Tagline (Subtítulo Superior)
                  </label>
                  <input
                    type="text"
                    value={weeklyTagline}
                    onChange={e => setWeeklyTagline(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Flexibilidade & Economia Semanal"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Título (Prefixo)
                  </label>
                  <input
                    type="text"
                    value={weeklyTitlePrefix}
                    onChange={e => setWeeklyTitlePrefix(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Pequenos"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Título (Destaque em Ouro)
                  </label>
                  <input
                    type="text"
                    value={weeklyTitleHighlight}
                    onChange={e => setWeeklyTitleHighlight(e.target.value)}
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    placeholder="Ex: Planos Semanais"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                  Descrição dos Planos Semanais
                </label>
                <textarea
                  rows={2}
                  value={weeklyDescription}
                  onChange={e => setWeeklyDescription(e.target.value)}
                  className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs resize-none"
                  placeholder="Explique as vantagens dos passes e pequenos planos semanais..."
                />
              </div>

              <button
                type="submit"
                disabled={isSavingHeader || !canWrite}
                className="inline-flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 font-bold px-4 py-2 rounded-sm text-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingHeader ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Salvar Cabeçalho Semanais</span>
              </button>
            </form>
          </div>

          {/* Form para Adicionar / Editar Pequeno Plano Semanal */}
          {editingWeeklyPlan && (
            <div className="vintage-card p-6 rounded-sm border-2 border-gold/50 bg-ink-surface shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-ink-border">
                <div className="flex items-center gap-2 text-gold font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>{isNewWeeklyPlan ? 'Cadastrar Novo Plano Semanal' : 'Editar Plano Semanal'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingWeeklyPlan(null)}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWeeklyForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Nome do Plano Semanal *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingWeeklyPlan.name}
                      onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, name: e.target.value })}
                      placeholder="Ex: Passe Semanal Cabelo Express"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                        Preço (R$) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingWeeklyPlan.price}
                        onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, price: e.target.value })}
                        placeholder="Ex: R$ 35,00"
                        className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs font-bold text-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                        Periodicidade
                      </label>
                      <input
                        type="text"
                        value={editingWeeklyPlan.period || ''}
                        onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, period: e.target.value })}
                        placeholder="Ex: / semana"
                        className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={editingWeeklyPlan.buttonText || ''}
                      onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, buttonText: e.target.value })}
                      placeholder="Ex: Garantir Passe Semanal"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                      Selo de Destaque / Badge
                    </label>
                    <input
                      type="text"
                      value={editingWeeklyPlan.badge || ''}
                      onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, badge: e.target.value })}
                      placeholder="Ex: PASSE RÁPIDO, O MAIS PROCURADO"
                      className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="weekly-plan-popular-check"
                    checked={Boolean(editingWeeklyPlan.popular)}
                    onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, popular: e.target.checked })}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <label htmlFor="weekly-plan-popular-check" className="text-xs text-white font-medium cursor-pointer">
                    Destacar como Mais Popular (Borda Dourada e Destaque)
                  </label>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold mb-1 font-semibold">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={editingWeeklyPlan.description}
                    onChange={e => setEditingWeeklyPlan({ ...editingWeeklyPlan, description: e.target.value })}
                    placeholder="Descrição sucinta da experiência ou passe semanal..."
                    className="w-full bg-ink-light border border-ink-border focus:border-gold outline-none p-2.5 text-white rounded-sm text-xs resize-none"
                  />
                </div>

                {/* Gerenciador de Benefícios */}
                <div className="space-y-2 p-3 bg-ink/70 border border-ink-border rounded-sm">
                  <label className="block text-xs uppercase tracking-wider text-gold font-semibold">
                    Recursos Inclusos no Passe Semanal
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weeklyFeatureInput}
                      onChange={e => setWeeklyFeatureInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addWeeklyFeature(); } }}
                      placeholder="Ex: 1 Corte de Cabelo ou Lavagem com Massagem"
                      className="flex-1 bg-ink-light border border-ink-border focus:border-gold outline-none p-2 text-white rounded-sm text-xs"
                    />
                    <button
                      type="button"
                      onClick={addWeeklyFeature}
                      className="px-3 py-1.5 bg-gold text-ink font-bold text-xs rounded-sm hover:bg-gold-light cursor-pointer whitespace-nowrap"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {editingWeeklyPlan.features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-ink-light rounded text-xs text-gray-200 border border-ink-border">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{f}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWeeklyFeature(i)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          title="Remover recurso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {editingWeeklyPlan.features.length === 0 && (
                      <span className="text-[11px] text-gray-500 italic block">Nenhum recurso adicionado ainda.</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-border">
                  <button
                    type="button"
                    onClick={() => setEditingWeeklyPlan(null)}
                    className="px-4 py-2 bg-ink border border-ink-border text-gray-400 hover:text-white rounded-sm text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPlans || !canWrite}
                    className="px-5 py-2 bg-gold hover:bg-gold-light text-ink font-bold rounded-sm text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPlans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Salvar Plano Semanal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Active Weekly Plans Cards (Smaller cards) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold" />
                <span>Pequenos Planos Semanais Cadastrados ({weeklyPlans.length})</span>
              </h3>
            </div>

            {weeklyPlans.length === 0 ? (
              <div className="text-center py-12 bg-ink border border-ink-border rounded-sm">
                <Zap className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                <p className="text-gray-300 text-sm font-medium">Nenhum plano semanal cadastrado.</p>
                <p className="text-gray-500 text-xs mt-1">Clique em "Novo Plano Semanal" para criar um passe rápido.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyPlans.map((wp) => (
                  <div
                    key={wp.id}
                    className={`vintage-card p-4 rounded-sm border flex flex-col justify-between relative bg-ink ${
                      wp.popular ? 'border-gold shadow-lg shadow-gold/10' : 'border-ink-border'
                    }`}
                  >
                    {wp.popular && (
                      <div className="absolute top-2.5 right-2.5 bg-gold text-ink font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                        <span>Destaque</span>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-gold font-bold uppercase tracking-wider mb-1">
                        {wp.badge || 'PASSE SEMANAL'}
                      </div>
                      <h4 className="font-serif text-lg font-bold text-white mb-1">{wp.name}</h4>
                      <div className="text-xl font-extrabold text-gold font-serif my-1.5">
                        {wp.price} <span className="text-xs font-normal text-gray-400 font-sans">{wp.period || '/ semana'}</span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-3 font-light min-h-[32px]">{wp.description}</p>

                      <div className="space-y-1 text-xs text-gray-300 mb-3 border-t border-ink-border pt-2.5">
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block mb-1">
                          Recursos ({wp.features.length})
                        </span>
                        {wp.features.slice(0, 3).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate text-[11px]">
                            <Check className="w-3 h-3 text-gold shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                        {wp.features.length > 3 && (
                          <span className="text-[9px] text-gold font-medium">+{wp.features.length - 3} mais</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-ink-border mt-auto">
                      <button
                        type="button"
                        onClick={() => handleEditWeekly(wp)}
                        className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWeekly(wp.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MasterLandingEditor() {
  const { tenant, selectTenantForAdmin } = useTenant();
  const [activeTab, setActiveTab] = useState<'config'|'planos'|'experiencia'|'depoimentos'|'servicos'|'profissionais'>('config');

  const handleExitEditor = () => {
    selectTenantForAdmin(null, 'none');
    window.location.hash = '#admin';
  };

  return (
    <div className="min-h-screen bg-ink-surface text-gray-200 font-sans flex flex-col">
      <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between z-[60] sticky top-0 shadow-md">
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>
            MASTER — EDITOR DA LANDING — {tenant?.tradeName || tenant?.name || 'EMPRESA'}
          </span>
        </div>
        <button
          onClick={handleExitEditor}
          className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded text-xs font-bold transition-colors cursor-pointer"
        >
          Encerrar Edição
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-ink/95 border-r border-ink-border flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-ink-border">
            <h2 className="text-lg font-bold text-white">Landing Editor</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'config' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" /> Configurações
            </button>
            <button
              onClick={() => setActiveTab('planos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'planos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Planos & Clubes
            </button>
            <button
              onClick={() => setActiveTab('servicos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'servicos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4" /> Serviços Públicos
            </button>
            <button
              onClick={() => setActiveTab('profissionais')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'profissionais' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Profissionais Públicos
            </button>
            <button
              onClick={() => setActiveTab('experiencia')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'experiencia' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Experiência & FAQ
            </button>
            <button
              onClick={() => setActiveTab('depoimentos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                activeTab === 'depoimentos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Quote className="w-4 h-4" /> Depoimentos
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-black relative">
          <div className="absolute inset-0 max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'config' && (
              <ConfigView 
                onSelectTab={setActiveTab as any} 
                onBackToLanding={() => selectTenantForAdmin(tenant?.id || null, 'landing_preview')} 
              />
            )}
            {activeTab === 'planos' && <AdminPlans />}
            {activeTab === 'servicos' && <AdminServices />}
            {activeTab === 'profissionais' && <AdminProfessionals />}
            {activeTab === 'experiencia' && <AdminExperience />}
            {activeTab === 'depoimentos' && <AdminTestimonials />}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ 
  onLogout, 
  onBackToLanding 
}: { 
  onLogout: () => void; 
  onBackToLanding?: () => void;
}) {
  const { isSuperAdmin } = useAuth();
  const { tenantId, tenant, adminTenantMode, selectTenantForAdmin, hasPermission } = useTenant();
  
  const isMaintenanceMode = adminTenantMode === 'system_maintenance';
  const isLandingEditor = adminTenantMode === 'landing_editor';

  // Granular module permissions (least privilege)
  const canAppointments = hasPermission('appointments.read');
  const canCrm = hasPermission('crm.read') || hasPermission('clients.read');
  const canLanding = hasPermission('landing.read');
  const canSettings = hasPermission('settings.read');
  const canFinance = hasPermission('finance.read');
  const canMembers = hasPermission('members.read') || hasPermission('members.manage');

  // Plan feature gates
  const currentPlan = DEFAULT_SAAS_PLANS.find(p => p.id === tenant?.planId) || DEFAULT_SAAS_PLANS[0];
  const hasCrm = isSuperAdmin || currentPlan?.hasCrm !== false;
  const hasFinancials = isSuperAdmin || currentPlan?.hasFinancials !== false;

  // Available tabs filtered strictly by permissions and current editing mode
  type AdminDashboardTab = 'agendamentos'|'crm'|'licencas'|'planos'|'servicos'|'profissionais'|'horarios'|'experiencia'|'depoimentos'|'config';
  const availableTabs = useMemo<AdminDashboardTab[]>(() => {
    const tabs: AdminDashboardTab[] = [];
    if (isLandingEditor) {
      if (canSettings) tabs.push('config');
      if (canLanding) {
        tabs.push('planos');
        tabs.push('servicos');
        tabs.push('profissionais');
        tabs.push('experiencia');
        tabs.push('depoimentos');
      }
      return tabs.length > 0 ? tabs : ['config'];
    }
    if (canAppointments) tabs.push('agendamentos');
    if (canCrm) tabs.push('crm');
    if (isSuperAdmin) tabs.push('licencas');
    if (canLanding || canSettings) {
      tabs.push('planos');
      tabs.push('servicos');
    }
    if (canLanding || canMembers) tabs.push('profissionais');
    if (canAppointments || canSettings) tabs.push('horarios');
    if (canLanding) {
      tabs.push('experiencia');
      tabs.push('depoimentos');
    }
    if (canSettings) tabs.push('config');
    return tabs.length > 0 ? tabs : ['agendamentos'];
  }, [isLandingEditor, canAppointments, canCrm, isSuperAdmin, canLanding, canSettings, canMembers]);

  const [activeTab, setActiveTab] = useState<AdminDashboardTab>(() => {
    if (isLandingEditor) return 'config';
    const initial = sessionStorage.getItem('adminInitialTab');
    if (initial && ['agendamentos','crm','licencas','planos','servicos','profissionais','horarios','experiencia','depoimentos','config'].includes(initial)) {
      sessionStorage.removeItem('adminInitialTab');
      return initial as AdminDashboardTab;
    }
    return canAppointments ? 'agendamentos' : (canCrm ? 'crm' : (canLanding ? 'servicos' : 'config'));
  });

  // Ensure active tab is always accessible according to user permissions
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  const { logoUrl, settings, appointments, services, professionals } = useContext(AppContext);
  const validLogoUrl = (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) ? logoUrl.trim() : null;

  // CRM Data & Real-time Integration
  const crm = useCrmData({
    tenantId,
    appointments,
    services,
    professionals,
  });

  const [crmInitialFilter, setCrmInitialFilter] = useState<string>('all');
  const [crmSelectedPhone, setCrmSelectedPhone] = useState<string | undefined>(undefined);

  const handleOpenCrm = (filter?: string, phone?: string) => {
    if (filter) setCrmInitialFilter(filter);
    if (phone) setCrmSelectedPhone(phone);
    setActiveTab('crm');
  };

  const handleBack = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      window.location.hash = '';
    }
  };

  const handleExitMaintenance = () => {
    selectTenantForAdmin(null, 'none');
    window.location.hash = '#admin';
  };

  return (
    <div className="min-h-screen bg-ink-surface text-gray-200 font-sans flex flex-col">
      {/* MAINTENANCE BANNER */}
      {(isMaintenanceMode || isLandingEditor) && tenant && (
        <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between z-[60] sticky top-0 shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>
              {isMaintenanceMode 
                ? `MASTER — SISTEMA DA EMPRESA — ${tenant.tradeName || tenant.name}` 
                : `MASTER — EDITOR DA LANDING — ${tenant.tradeName || tenant.name}`}
            </span>
          </div>
          <button
            onClick={handleExitMaintenance}
            className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded text-xs font-bold transition-colors cursor-pointer"
          >
            Encerrar {isMaintenanceMode ? 'Acesso ao Sistema' : 'Edição'}
          </button>
        </div>
      )}

      {/* Barra Superior Fixa do Admin (Parte Superior da Tela) */}
      <header className={`bg-ink/95 backdrop-blur-md border-b border-ink-border px-4 sm:px-6 py-3 flex items-center justify-between sticky ${isMaintenanceMode || isLandingEditor ? 'top-10' : 'top-0'} z-50 shadow-md`}>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Botão de voltar para a tela de Landing Page */}
          <button
            type="button"
            id="admin-top-back-to-landing-btn"
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-gold/15 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold px-3.5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer group active:scale-95"
            title="Voltar para a Landing Page (Página Inicial)"
            aria-label="Voltar para a Landing Page"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Voltar para Landing Page</span>
          </button>

          <div className="h-5 w-px bg-ink-border hidden sm:block"></div>

          {/* Nome / Logo da Barbearia & Badge do Admin */}
          <div className="hidden sm:flex items-center gap-2.5">
            <BrandLogo
              src={validLogoUrl}
              alt={settings.name}
              name={settings.name}
              tagline="Painel Administrativo"
              className="h-[42px] w-auto"
              fallbackIcon={
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-3.5 h-3.5 text-ink" strokeWidth={2.5} />
                </div>
              }
            />
          </div>
        </div>

        {/* Centro / Topo: Relógio Atualizado em Tempo Real */}
        <div className="flex items-center">
          <LiveClock showDate={true} className="hidden sm:inline-flex" />
          <LiveClock compact={true} className="sm:hidden" />
        </div>

        {/* Lado Direito da Barra Superior */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell for Inactive Clients Alerts */}
          <NotificationBell
            notifications={crm.notifications}
            unreadCount={crm.unreadNotificationCount}
            onSelectClient={(phone) => handleOpenCrm('inativos', phone)}
            onOpenCrm={() => handleOpenCrm('inativos')}
            onMarkViewed={crm.markNotificationViewed}
            onDismiss={crm.dismissNotification}
          />

          <button
            type="button"
            onClick={handleBack}
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold bg-ink-light hover:bg-white/5 border border-ink-border hover:border-gold/30 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
            title="Visualizar a Landing Page da Barbearia"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Site</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 sm:py-2 rounded-sm transition-colors cursor-pointer"
            title="Sair do Painel Administrativo"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair do Sistema</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-ink border-b md:border-b-0 md:border-r border-ink-border flex-shrink-0 flex flex-col">
          {/* Identificação Mobile */}
          <div className="p-3 sm:p-4 border-b border-ink-border sm:hidden flex items-center justify-between">
            <BrandLogo
              src={validLogoUrl}
              alt={settings.name}
              name={settings.name}
              className="h-9 w-auto"
              fallbackIcon={
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-3 h-3 text-ink" strokeWidth={2.5} />
                </div>
              }
            />
            <span className="text-[10px] text-gold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">Admin</span>
          </div>

          <nav className="flex-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex md:flex-col gap-1.5 md:gap-0 overflow-x-auto md:overflow-visible">
            {!isLandingEditor && canAppointments && (
              <button
                onClick={() => setActiveTab('agendamentos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'agendamentos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ListTodo className="w-4 h-4 flex-shrink-0" />
                Agendamentos
              </button>
            )}

            {!isLandingEditor && canCrm && (
              <button
                id="admin-sidebar-crm-tab-btn"
                onClick={() => handleOpenCrm('all')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'crm' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 flex-shrink-0 text-gold" />
                  <span>CRM & Clientes</span>
                </div>
                {!hasCrm ? (
                  <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded font-mono font-semibold">
                    PRO
                  </span>
                ) : crm.unreadNotificationCount > 0 ? (
                  <span className="bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                    {crm.unreadNotificationCount}
                  </span>
                ) : null}
              </button>
            )}

            {isSuperAdmin && !isLandingEditor && (
              <button
                onClick={() => setActiveTab('licencas')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'licencas' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 flex-shrink-0 text-gold" />
                Licenças & RBAC
              </button>
            )}

            {(canLanding || canSettings) && (
              <>
                <button
                  onClick={() => setActiveTab('planos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'planos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  Planos
                </button>
                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'servicos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Scissors className="w-4 h-4 flex-shrink-0" />
                  Serviços
                </button>
              </>
            )}

            {(canLanding || canMembers) && (
              <button
                onClick={() => setActiveTab('profissionais')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'profissionais' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                Profissionais
              </button>
            )}

            {!isLandingEditor && (canAppointments || canSettings) && (
              <button
                onClick={() => setActiveTab('horarios')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'horarios' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 flex-shrink-0" />
                Horários
              </button>
            )}

            {canLanding && (
              <>
                <button
                  onClick={() => setActiveTab('experiencia')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'experiencia' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  Experiência
                </button>
                <button
                  onClick={() => setActiveTab('depoimentos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'depoimentos' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Quote className="w-4 h-4 flex-shrink-0" />
                  Depoimentos
                </button>
              </>
            )}

            {canSettings && (
              <button
                onClick={() => setActiveTab('config')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'config' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                Configurações
              </button>
            )}
          </nav>

          <div className="p-4 border-t border-ink-border hidden md:flex flex-col gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-semibold text-gold/80 hover:text-gold hover:bg-gold/10 border border-gold/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gold" />
              Voltar ao Site Principal
            </button>
            <button 
              type="button"
              onClick={onLogout} 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'agendamentos' && canAppointments && (
            <AgendamentosView 
              crmStats={hasCrm && canCrm ? crm.crmStats : undefined}
              hasFinancials={hasFinancials && canFinance}
              canWriteAppointments={hasPermission('appointments.write')}
              canDeleteAppointments={hasPermission('appointments.delete')}
              onOpenCrm={handleOpenCrm}
            />
          )}
          {activeTab === 'crm' && canCrm && (
            !hasCrm ? (
              <div className="max-w-3xl mx-auto py-12 px-6 bg-ink border border-ink-border rounded-sm text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">CRM & Gestão de Clientes Exclusivo</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto mb-6">
                  O módulo de CRM com funil Kanban, identificação de clientes inativos e notificações automáticas está disponível a partir do <strong className="text-gold">Plano Profissional</strong>.
                </p>
                <div className="p-4 bg-ink-light border border-ink-border rounded-sm inline-block text-left text-xs text-gray-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold" />
                    <span>Funil Kanban de Leads e Oportunidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold" />
                    <span>Histórico integrado com Agendamentos e WhatsApp direto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold" />
                    <span>Alertas automáticos de clientes ausentes há mais de 30 dias</span>
                  </div>
                </div>
              </div>
            ) : (
              <CrmModule
                clientProfiles={crm.clientProfiles}
                professionals={professionals}
                services={services}
                onSaveLead={crm.saveLead}
                onUpdateStage={crm.updateLeadStage}
                onAddContactLog={crm.addContactLog}
                onDeleteLead={crm.deleteLead}
                onDeleteClient={crm.deleteClientProfile}
                initialFilter={crmInitialFilter}
                initialSelectedPhone={crmSelectedPhone}
                canWriteCrm={hasPermission('crm.write') || hasPermission('clients.write')}
                canDeleteCrm={hasPermission('crm.delete') || hasPermission('clients.delete')}
              />
            )
          )}
          {activeTab === 'licencas' && isSuperAdmin && <AdminPanel embedded={true} />}
          {activeTab === 'planos' && (canLanding || canSettings) && <AdminPlans />}
          {activeTab === 'servicos' && (canLanding || canSettings) && <AdminServices />}
          {activeTab === 'profissionais' && (canLanding || canMembers) && <AdminProfessionals />}
          {activeTab === 'horarios' && (canAppointments || canSettings) && <AdminTimeSlots />}
          {activeTab === 'experiencia' && canLanding && <AdminExperience />}
          {activeTab === 'depoimentos' && canLanding && <AdminTestimonials />}
          {activeTab === 'config' && canSettings && <ConfigView onSelectTab={setActiveTab} onBackToLanding={handleBack} />}
        </main>
      </div>
    </div>
  );
}

function AgendamentosView({
  crmStats,
  hasFinancials = true,
  canWriteAppointments = true,
  canDeleteAppointments = true,
  onOpenCrm,
}: {
  crmStats?: any;
  hasFinancials?: boolean;
  canWriteAppointments?: boolean;
  canDeleteAppointments?: boolean;
  onOpenCrm?: (filter?: string, phone?: string) => void;
}) {
  const { 
    appointments, 
    addAppointment, 
    updateAppointmentStatus, 
    updateAppointmentPayment, 
    updateAppointmentProfessional,
    deleteAppointment, 
    settings, 
    services, 
    professionals 
  } = useContext(AppContext);

  const [filterDateStr, setFilterDateStr] = useState(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'byProfessional' | 'unified'>('byProfessional');
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Form State for new appointment
  const [newClient, setNewClient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState(services[0]?.id || '');
  const [newProfessionalId, setNewProfessionalId] = useState(professionals[0]?.id || '');
  const [newTime, setNewTime] = useState('09:00');
  const [newPaymentMethod, setNewPaymentMethod] = useState<Appointment['paymentMethod']>('Não definido');
  const [newPaymentStatus, setNewPaymentStatus] = useState<Appointment['paymentStatus']>('Pendente');

  const formattedFilterStr = filterDateStr.split('-').reverse().join('/');
  const filteredAppointments = appointments.filter(app => normalizeDateStr(app.date) === normalizeDateStr(formattedFilterStr));

  // Quick Date Navigation
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const tzOffset = d.getTimezoneOffset() * 60000;
    setFilterDateStr(new Date(d.getTime() - tzOffset).toISOString().split('T')[0]);
  };

  // Open modal pre-selecting a specific professional
  const handleOpenModal = (profId?: string) => {
    if (profId) {
      setNewProfessionalId(profId);
    } else {
      setNewProfessionalId(professionals[0]?.id || '');
    }
    setIsModalOpen(true);
  };

  // Daily Metrics
  const totalAppointments = filteredAppointments.length;
  const confirmedCount = filteredAppointments.filter(a => a.status === 'Confirmado').length;
  const pendingCount = filteredAppointments.filter(a => a.status === 'Pendente').length;
  const cancelledCount = filteredAppointments.filter(a => a.status === 'Cancelado').length;
  const estimatedRevenue = filteredAppointments
    .filter(a => a.status !== 'Cancelado')
    .reduce((sum, app) => {
      const s = services.find(srv => srv.name === app.service || srv.id === app.service);
      return sum + parsePriceNumber(s?.price || '0');
    }, 0);

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingNew) return;
    
    // Parse date for checking availability
    const [day, month, year] = formattedFilterStr.split('/');
    const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const isAvailable = isSlotAvailable(newTime, targetDate, newServiceId, newProfessionalId, appointments, services, professionals);
    if (!isAvailable) {
      alert("Este horário conflita com outro agendamento ou já passou. Por favor, selecione outro horário/profissional.");
      return;
    }

    const selectedService = services.find(s => s.id === newServiceId);
    const selectedProf = professionals.find(p => p.id === newProfessionalId);

    try {
      setIsSubmittingNew(true);
      await addAppointment({
        client: newClient.trim(),
        phone: newPhone.trim(),
        service: selectedService?.name || newServiceId,
        serviceId: selectedService?.id,
        professional: selectedProf?.name || newProfessionalId,
        professionalId: selectedProf?.id,
        date: formattedFilterStr,
        time: newTime,
        paymentMethod: newPaymentMethod,
        paymentStatus: newPaymentStatus,
        status: 'Confirmado'
      });
      setIsModalOpen(false);
      setNewClient('');
      setNewPhone('');
    } catch (err: any) {
      console.error("Erro ao salvar novo agendamento:", err);
      alert(err?.message || "Não foi possível cadastrar o agendamento.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const sendWhatsAppMsg = (app: Appointment) => {
    const message = `Olá ${app.client}! Confirmando seu agendamento na *${settings.name}* 💈\n\n✂️ Serviço: ${app.service}\n📅 Data: ${app.date}\n⏰ Horário: ${app.time}\n👤 Profissional: ${app.professional}\n💳 Pagamento: ${app.paymentStatus} (${app.paymentMethod})\n\nTe esperamos!`;
    const safePhone = app.phone ? app.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Specific professionals (excluding the generic 'any' if defined)
  const specificProfessionals = professionals.filter(p => p.id !== 'any' && !p.name.toLowerCase().includes('qualquer'));

  // Appointments not assigned to a specific barber
  const unassignedAppointments = filteredAppointments
    .filter(app => !specificProfessionals.some(p => matchesProfessional(app.professional, p.name, p.id)))
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Displayed professionals based on filter
  const displayedProfessionals = selectedProfFilter === 'all' 
    ? specificProfessionals 
    : specificProfessionals.filter(p => p.id === selectedProfFilter);

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-[fadeUp_0.3s_ease-out]">
      {/* 1. Visão Geral do CRM (Leads, Sem Agendamento, Recuperação 30+ Dias, etc.) */}
      {crmStats && (
        <CrmSummarySection
          stats={crmStats}
          onOpenCrm={(filter) => onOpenCrm && onOpenCrm(filter)}
        />
      )}

      {/* 2. Gráfico de Crescimento do Negócio & Faturamento Interativo */}
      {hasFinancials ? (
        <FinancialGrowthChart
          appointments={appointments}
          services={services}
        />
      ) : (
        <div className="mb-6 bg-ink border border-ink-border rounded-sm p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Gráficos de Faturamento & Métricas Avançadas</h4>
              <p className="text-xs text-gray-400">Disponível no Plano Profissional e Enterprise</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-sm">
            Recurso Pro
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">Agendamentos do Dia</h2>
          <p className="text-gray-400 text-sm">
            Grade completa de atendimentos separada por profissional e controle financeiro diário.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1 bg-ink border border-ink-border p-1 rounded-sm">
            <button
              type="button"
              onClick={() => setQuickDate(-1)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 text-xs text-gold font-bold bg-gold/10 rounded-xs transition-colors"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
            >
              Amanhã
            </button>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={filterDateStr}
            onChange={(e) => setFilterDateStr(e.target.value)}
            className="bg-ink border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
          />

          {/* New Appointment Button */}
          {canWriteAppointments && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-4 py-2 rounded-sm text-sm transition-all shadow-md shadow-gold/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar for the Selected Day */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-ink border border-ink-border p-4 rounded-sm">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Total do Dia
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-white">{totalAppointments}</span>
            <span className="text-xs text-gray-500">agendamentos</span>
          </div>
        </div>

        <div className="bg-ink border border-ink-border p-4 rounded-sm">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Confirmados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-green-400">{confirmedCount}</span>
            <span className="text-xs text-gray-500">de {totalAppointments}</span>
          </div>
        </div>

        <div className="bg-ink border border-ink-border p-4 rounded-sm">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Pendentes / Cancelados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-yellow-400">{pendingCount}</span>
            <span className="text-xs text-gray-500">/ {cancelledCount} canc.</span>
          </div>
        </div>

        <div className="bg-ink border border-ink-border p-4 rounded-sm">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Faturamento Estimado
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-serif font-bold text-gold">
              {hasFinancials ? formatCurrency(estimatedRevenue) : '••••••'}
            </span>
            {!hasFinancials && <span className="text-[10px] text-gray-500 font-mono">(Restrito)</span>}
          </div>
        </div>
      </div>

      {/* View Switcher & Professional Filter Tabs */}
      <div className="flex flex-col gap-3 mb-6 pb-3 border-b border-ink-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Modo de Exibição:</span>
            <div className="inline-flex rounded-sm bg-ink border border-ink-border p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('byProfessional')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'byProfessional'
                    ? 'bg-gold text-ink shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Separado por Profissional
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'unified'
                    ? 'bg-gold text-ink shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                Tabela Geral Unificada
              </button>
            </div>
          </div>

          <span className="text-xs text-gray-400">
            Data selecionada: <strong className="text-gold">{formattedFilterStr}</strong>
          </span>
        </div>

        {/* Professional Quick Filters when in 'byProfessional' mode */}
        {viewMode === 'byProfessional' && specificProfessionals.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Filtrar Barbeiro:</span>
            <button
              type="button"
              onClick={() => setSelectedProfFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedProfFilter === 'all'
                  ? 'bg-gold/20 text-gold border border-gold/40 shadow-sm'
                  : 'bg-ink border border-ink-border text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              Todos ({specificProfessionals.length})
            </button>

            {specificProfessionals.map(p => {
              const count = filteredAppointments.filter(app => matchesProfessional(app.professional, p.name, p.id)).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProfFilter(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedProfFilter === p.id
                      ? 'bg-gold/20 text-gold border border-gold/40 shadow-sm'
                      : 'bg-ink border border-ink-border text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <span>{p.name.split(' ')[0]}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    count > 0 ? 'bg-gold text-ink font-bold' : 'bg-ink-border text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {unassignedAppointments.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedProfFilter('unassigned')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedProfFilter === 'unassigned'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                    : 'bg-ink border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                }`}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>A Definir</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-yellow-400 text-ink font-bold">
                  {unassignedAppointments.length}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: TABELAS SEPARADAS POR PROFISSIONAL */}
      {viewMode === 'byProfessional' && (
        <div className="space-y-8">
          {selectedProfFilter !== 'unassigned' && displayedProfessionals.map(p => {
            const profApps = filteredAppointments
              .filter(app => matchesProfessional(app.professional, p.name, p.id))
              .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

            const profRevenue = profApps
              .filter(a => a.status !== 'Cancelado')
              .reduce((sum, app) => {
                const s = services.find(srv => srv.name === app.service || srv.id === app.service);
                return sum + parsePriceNumber(s?.price || '0');
              }, 0);

            const profConfirmed = profApps.filter(a => a.status === 'Confirmado').length;

            return (
              <div key={p.id} className="bg-ink border border-ink-border rounded-sm overflow-hidden shadow-lg shadow-black/20">
                {/* Professional Header Bar */}
                <div className="bg-ink-light px-5 py-4 border-b border-ink-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold text-lg shadow-inner">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-white">{p.name}</h3>
                        <span className="text-xs text-gray-400">({p.specialty})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="text-gold font-mono font-bold">
                          {profApps.length} {profApps.length === 1 ? 'agendamento' : 'agendamentos'}
                        </span>
                        <span>•</span>
                        <span className="text-green-400 font-medium">
                          {profConfirmed} confirmados
                        </span>
                        <span>•</span>
                        <span className="text-white font-medium">
                          Estimado: <strong className="text-gold">{formatCurrency(profRevenue)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenModal(p.id)}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold hover:text-ink text-gold border border-gold/30 rounded-sm text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agendar para {p.name.split(' ')[0]}
                  </button>
                </div>

                {/* Table for this Professional */}
                {profApps.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-ink border-b border-ink-border text-[11px] uppercase tracking-wider text-gray-400">
                          <th className="px-5 py-3 font-semibold w-24">Horário</th>
                          <th className="px-5 py-3 font-semibold">Cliente & Contato</th>
                          <th className="px-5 py-3 font-semibold">Serviço</th>
                          <th className="px-5 py-3 font-semibold">Valor</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Pagamento</th>
                          <th className="px-5 py-3 font-semibold">Profissional</th>
                          <th className="px-5 py-3 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-border/60">
                        {profApps.map(app => {
                          const matchedService = services.find(s => s.name === app.service || s.id === app.service);
                          return (
                            <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Horário */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className="text-sm font-mono font-bold text-gold bg-gold/10 border border-gold/25 px-2.5 py-1 rounded-sm">
                                  {app.time}
                                </span>
                              </td>

                              {/* Cliente */}
                              <td className="px-5 py-3.5">
                                <div className="text-sm font-medium text-white">{app.client}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-gold/70" />
                                  {app.phone}
                                </div>
                              </td>

                              {/* Serviço */}
                              <td className="px-5 py-3.5">
                                <div className="text-sm text-white font-medium">{app.service}</div>
                                {matchedService?.duration && (
                                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {matchedService.duration}
                                  </div>
                                )}
                              </td>

                              {/* Valor */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className="text-xs font-semibold text-gray-300">
                                  {matchedService?.price || 'R$ 0,00'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                {canWriteAppointments ? (
                                  <select
                                    value={app.status}
                                    onChange={(e) => updateAppointmentStatus(app.id, e.target.value as any)}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full outline-none cursor-pointer ${
                                      app.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 
                                      app.status === 'Cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                    }`}
                                  >
                                    <option value="Pendente" className="bg-ink text-yellow-400">Pendente</option>
                                    <option value="Confirmado" className="bg-ink text-green-400">Confirmado</option>
                                    <option value="Cancelado" className="bg-ink text-red-400">Cancelado</option>
                                  </select>
                                ) : (
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block ${
                                    app.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 
                                    app.status === 'Cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                  }`}>
                                    {app.status}
                                  </span>
                                )}
                              </td>

                              {/* Pagamento */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                {canWriteAppointments ? (
                                  <div className="flex items-center gap-2">
                                    <select 
                                      value={app.paymentMethod}
                                      onChange={(e) => updateAppointmentPayment(app.id, e.target.value as any, app.paymentStatus)}
                                      className="bg-ink-light border border-ink-border rounded-sm text-xs text-white px-2 py-1 outline-none focus:border-gold"
                                    >
                                      <option value="Não definido">Não definido</option>
                                      <option value="Pix">Pix</option>
                                      <option value="Cartão">Cartão</option>
                                      <option value="Dinheiro">Dinheiro</option>
                                    </select>
                                    <select 
                                      value={app.paymentStatus}
                                      onChange={(e) => updateAppointmentPayment(app.id, app.paymentMethod, e.target.value as any)}
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm outline-none cursor-pointer border ${
                                        app.paymentStatus === 'Pago' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                                      }`}
                                    >
                                      <option value="Pendente" className="bg-ink text-red-400">Pendente</option>
                                      <option value="Pago" className="bg-ink text-green-400">Pago</option>
                                    </select>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300">
                                    {app.paymentMethod || 'Não definido'} • <span className={app.paymentStatus === 'Pago' ? 'text-green-400 font-semibold' : 'text-yellow-400'}>{app.paymentStatus || 'Pendente'}</span>
                                  </span>
                                )}
                              </td>

                              {/* Transferir / Trocar Profissional */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                {canWriteAppointments ? (
                                  <select
                                    value={p.name}
                                    onChange={(e) => updateAppointmentProfessional(app.id, e.target.value)}
                                    className="bg-ink-light border border-ink-border rounded-sm text-xs text-gold px-2 py-1 outline-none focus:border-gold cursor-pointer"
                                    title="Reatribuir a outro profissional"
                                  >
                                    {specificProfessionals.map(prof => (
                                      <option key={prof.id} value={prof.name} className="bg-ink text-white">
                                        {prof.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-xs text-gold font-medium">{p.name}</span>
                                )}
                              </td>

                              {/* Ações */}
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => sendWhatsAppMsg(app)} 
                                    title="Enviar mensagem WhatsApp" 
                                    className="text-xs text-green-400/90 hover:text-green-300 transition-colors bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1.5 rounded-sm flex items-center gap-1 border border-green-500/20 cursor-pointer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" /> Msg
                                  </button>
                                  {canDeleteAppointments && (
                                    <button 
                                      onClick={() => deleteAppointment(app.id)} 
                                      title="Excluir Agendamento" 
                                      className="text-xs text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded-sm border border-red-500/20 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-ink/50 flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-6 h-6 text-ink-border" />
                    <p className="text-xs text-gray-500">
                      Nenhum agendamento para <strong>{p.name}</strong> na data de {formattedFilterStr}.
                    </p>
                    {canWriteAppointments && (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(p.id)}
                        className="text-xs text-gold hover:underline font-medium mt-1 cursor-pointer"
                      >
                        + Adicionar agendamento neste dia
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Agendamentos a Definir / Qualquer Barbeiro */}
          {unassignedAppointments.length > 0 && (selectedProfFilter === 'all' || selectedProfFilter === 'unassigned') && (
            <div className="bg-ink border-2 border-yellow-500/30 rounded-sm overflow-hidden shadow-lg">
              <div className="bg-yellow-500/10 px-5 py-4 border-b border-yellow-500/20 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-yellow-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Agendamentos a Definir / Qualquer Profissional ({unassignedAppointments.length})
                  </h3>
                  <p className="text-xs text-gray-400">
                    Estes clientes agendaram com opção "Qualquer Profissional". Atribua diretamente a um barbeiro abaixo:
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-ink border-b border-ink-border text-[11px] uppercase tracking-wider text-gray-400">
                      <th className="px-5 py-3 font-semibold">Horário</th>
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Serviço</th>
                      <th className="px-5 py-3 font-semibold">Atribuir Barbeiro</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-border">
                    {unassignedAppointments.map(app => (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-bold text-gold">{app.time}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-white">{app.client}</div>
                          <div className="text-xs text-gray-400">{app.phone}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-white">{app.service}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {canWriteAppointments ? (
                            <select
                              value={app.professional}
                              onChange={(e) => updateAppointmentProfessional(app.id, e.target.value)}
                              className="bg-ink-light border border-gold/40 text-xs text-gold font-medium rounded-sm px-2.5 py-1.5 outline-none focus:border-gold cursor-pointer"
                            >
                              <option value="Qualquer Profissional">-- Selecionar Barbeiro --</option>
                              {specificProfessionals.map(p => (
                                <option key={p.id} value={p.name} className="bg-ink text-white">
                                  {p.name} ({p.specialty})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gold font-medium">{app.professional}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {canWriteAppointments ? (
                            <select
                              value={app.status}
                              onChange={(e) => updateAppointmentStatus(app.id, e.target.value as any)}
                              className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 cursor-pointer"
                            >
                              <option value="Pendente" className="bg-ink text-yellow-400">Pendente</option>
                              <option value="Confirmado" className="bg-ink text-green-400">Confirmado</option>
                              <option value="Cancelado" className="bg-ink text-red-400">Cancelado</option>
                            </select>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 inline-block">
                              {app.status}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => sendWhatsAppMsg(app)} className="text-xs bg-green-500/10 text-green-400 p-1.5 rounded-sm cursor-pointer">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            {canDeleteAppointments && (
                              <button onClick={() => deleteAppointment(app.id)} className="text-xs bg-red-500/10 text-red-400 p-1.5 rounded-sm cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TABELA GERAL UNIFICADA */}
      {viewMode === 'unified' && (
        <div className="bg-ink border border-ink-border rounded-sm overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-ink-light border-b border-ink-border text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Serviço / Profissional</th>
                  <th className="px-6 py-4 font-semibold">Data / Hora</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Pagamento</th>
                  <th className="px-6 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium text-sm">{app.client}</div>
                      <div className="text-xs text-gray-500">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium">{app.service}</div>
                      <div className="text-xs text-gold font-medium">{app.professional}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{app.date}</div>
                      <div className="text-xs text-gold font-bold font-mono">{app.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      {canWriteAppointments ? (
                        <select
                          value={app.status}
                          onChange={(e) => updateAppointmentStatus(app.id, e.target.value as any)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full outline-none appearance-none cursor-pointer ${
                            app.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            app.status === 'Cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}
                        >
                          <option value="Pendente" className="bg-ink text-yellow-400">Pendente</option>
                          <option value="Confirmado" className="bg-ink text-green-400">Confirmado</option>
                          <option value="Cancelado" className="bg-ink text-red-400">Cancelado</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full inline-block ${
                          app.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          app.status === 'Cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {canWriteAppointments ? (
                        <div className="flex flex-col gap-1.5">
                          <select 
                            value={app.paymentMethod}
                            onChange={(e) => updateAppointmentPayment(app.id, e.target.value as any, app.paymentStatus)}
                            className="bg-ink-light border border-ink-border rounded-sm text-xs text-white px-2 py-1 outline-none focus:border-gold"
                          >
                            <option value="Não definido">Não definido</option>
                            <option value="Pix">Pix</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Dinheiro">Dinheiro</option>
                          </select>
                          <select 
                            value={app.paymentStatus}
                            onChange={(e) => updateAppointmentPayment(app.id, app.paymentMethod, e.target.value as any)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm outline-none appearance-none cursor-pointer border ${
                              app.paymentStatus === 'Pago' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            <option value="Pendente" className="bg-ink text-red-400">Pendente</option>
                            <option value="Pago" className="bg-ink text-green-400">Pago</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">
                          {app.paymentMethod || 'Não definido'} • <span className={app.paymentStatus === 'Pago' ? 'text-green-400 font-semibold' : 'text-yellow-400'}>{app.paymentStatus || 'Pendente'}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => sendWhatsAppMsg(app)} title="Enviar Confirmação" className="text-xs text-green-400/80 hover:text-green-400 transition-colors bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer">
                          <MessageCircle className="w-3 h-3" /> Msg
                        </button>
                        {canDeleteAppointments && (
                          <button onClick={() => deleteAppointment(app.id)} title="Excluir" className="text-xs text-red-400/80 hover:text-red-400 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-sm cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Calendar className="w-8 h-8 text-ink-border mx-auto mb-3" />
                      <div className="text-gray-500 text-sm">
                        Nenhum agendamento para o dia {formattedFilterStr}.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for New Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-ink border border-ink-border p-6 rounded-sm w-full max-w-md animate-[fadeUp_0.2s_ease-out]">
            <h3 className="font-serif text-2xl font-bold text-white mb-1">Novo Agendamento</h3>
            <p className="text-gray-400 text-xs mb-5">Adicionando para a data: <strong className="text-gold">{formattedFilterStr}</strong></p>
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Cliente</label>
                <input required type="text" value={newClient} onChange={e => setNewClient(e.target.value)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none" placeholder="Nome do cliente" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Telefone (WhatsApp)</label>
                <input required type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none" placeholder="(88) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Serviço</label>
                  <select required value={newServiceId} onChange={e => setNewServiceId(e.target.value)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none">
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Profissional</label>
                  <select required value={newProfessionalId} onChange={e => setNewProfessionalId(e.target.value)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none">
                    {specificProfessionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Horário</label>
                  <input required type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Forma Pagamento</label>
                  <select value={newPaymentMethod} onChange={e => setNewPaymentMethod(e.target.value as any)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none">
                    <option value="Não definido">Não definido</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Status de Pagamento</label>
                <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value as any)} className="w-full bg-ink-light border border-ink-border py-2 px-3 text-white text-sm rounded-sm focus:border-gold outline-none">
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isSubmittingNew} className="bg-gold hover:bg-gold-light text-ink font-bold px-5 py-2 rounded-sm text-sm transition-all shadow-md cursor-pointer disabled:opacity-50">
                  {isSubmittingNew ? 'Salvando...' : 'Salvar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigView({ onSelectTab, onBackToLanding }: { onSelectTab?: (tab: any) => void; onBackToLanding?: () => void } = {}) {
  const { logoUrl, setLogoUrl, theme, setTheme, settings, updateSettings } = useContext(AppContext);
  const { tenant, tenantId, selectTenantForAdmin, adminTenantMode, hasPermission } = useTenant();
  const canWriteSettings = hasPermission('settings.write');

  const handleViewLanding = () => {
    if (adminTenantMode === 'landing_editor') {
       selectTenantForAdmin(tenant?.id || null, 'landing_preview');
       return;
    }
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      window.location.hash = '';
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BarbershopSettings>(settings || {});
  const [draftLogoUrl, setDraftLogoUrl] = useState<string | null>((logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) ? logoUrl.trim() : null);
  const [logoLinkInput, setLogoLinkInput] = useState<string>(() => {
    if (logoUrl && typeof logoUrl === 'string' && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))) {
      return logoUrl.trim();
    }
    return '';
  });
  const [logoImageError, setLogoImageError] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (!isDirty && settings) {
      setFormData(settings);
      const cleanLogo = (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) ? logoUrl.trim() : null;
      setDraftLogoUrl(cleanLogo);
      if (cleanLogo && (cleanLogo.startsWith('http://') || cleanLogo.startsWith('https://'))) {
        setLogoLinkInput(cleanLogo);
      } else {
        setLogoLinkInput('');
      }
      setLogoImageError(false);
    }
  }, [settings, logoUrl, tenantId, isDirty]);

  const handleChange = (field: keyof BarbershopSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLinkChange = (val: string) => {
    setLogoLinkInput(val);
    setLogoImageError(false);
    const trimmed = val.trim();
    if (trimmed.length > 0) {
      setDraftLogoUrl(trimmed);
      setIsDirty(true);
    } else {
      setDraftLogoUrl(null);
      setIsDirty(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      setSaveError(null);
      setLogoImageError(false);
      try {
        // 1. Processa e exibe a imagem local imediatamente com preservação de transparência
        const localDataUrl = await compressLogoImage(file, 800, 800);
        setDraftLogoUrl(localDataUrl);
        setLogoLinkInput('');
        setIsDirty(true);

        // 2. Tenta upload em segundo plano para o Storage se configurado
        const targetTenantId = tenant?.id || tenantId;
        if (targetTenantId) {
          try {
            const uploadedUrl = await uploadLogoImage(targetTenantId, file);
            if (uploadedUrl) {
              setDraftLogoUrl(uploadedUrl);
              if (uploadedUrl.startsWith('http')) {
                setLogoLinkInput(uploadedUrl);
              }
            }
          } catch (uploadNotice) {
            console.warn('[handleFileUpload] Storage notice (mantendo imagem local otimizada):', uploadNotice);
          }
        }
      } catch (err: any) {
        console.warn('Erro ao processar imagem da logo:', err);
        setSaveError('Erro ao processar imagem: ' + (err.message || ''));
      } finally {
        setIsUploadingLogo(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      // 1. Commit draft logo to Firestore/State only on explicit Save
      await setLogoUrl(draftLogoUrl);

      // 2. Persist settings with current theme and logo
      const selectedThemeObj = THEMES[theme as keyof typeof THEMES];
      await updateSettings({
        ...formData,
        logoUrl: draftLogoUrl,
        theme: theme || formData.theme || 'gold',
        primaryColor: selectedThemeObj?.primary || '#111111',
        secondaryColor: selectedThemeObj?.secondary || '#C9A961',
      });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Erro ao salvar as configurações no Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Deseja restaurar as configurações padrão da barbearia?")) {
      setFormData(DEFAULT_SETTINGS);
      setDraftLogoUrl(null);
      setIsDirty(false);
      setIsSaving(true);
      setSaveError(null);
      try {
        await setLogoUrl(null);
        await updateSettings(DEFAULT_SETTINGS);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } catch (err: any) {
        setSaveError(err.message || 'Erro ao restaurar configurações.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-[fadeUp_0.3s_ease-out] pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">Configurações da Barbearia</h2>
          <p className="text-gray-400 text-sm">Personalize informações da Landing Page, WhatsApp de agendamento, Instagram e Mapa.</p>
        </div>
        <div className="flex items-center gap-3">
          {canWriteSettings && (
            <button 
              type="button"
              onClick={handleSave} 
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-bold px-5 py-2 rounded-sm text-sm transition-all shadow-lg shadow-gold/20 cursor-pointer"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          )}
        </div>
      </div>

      {!canWriteSettings && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm text-amber-300 text-xs flex items-center gap-3 animate-[fadeUp_0.2s_ease-out]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <div>
            <div className="font-bold text-sm">Modo Somente Leitura</div>
            <div className="text-xs text-amber-200/80">Você possui permissão apenas de visualização. Para alterar configurações da barbearia, é necessária a permissão <strong>settings.write</strong>.</div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 flex items-center gap-3 animate-[fadeUp_0.2s_ease-out]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div>
            <div className="font-bold text-sm">Erro ao salvar</div>
            <div className="text-xs text-rose-300/80">{saveError}</div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 flex items-center justify-between animate-[fadeUp_0.2s_ease-out]">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-bold text-sm">Alterações salvas com sucesso!</div>
              <div className="text-xs text-green-300/80">A Landing Page foi atualizada imediatamente com os novos dados configurados.</div>
            </div>
          </div>
          <button
            onClick={handleViewLanding}
            className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
          >
            Visualizar Site
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personalização da Landing Page */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <h3 className="font-serif text-lg text-white mb-2 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-gold" /> Personalização da Landing Page & Destaque (Hero)
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Defina o nome da barbearia, slogan, título principal de abertura e descrição que aparecem na primeira dobra do site.
          </p>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">Nome da Barbearia</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                  placeholder="Ex: Barbearia Elite"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">Slogan / Tagline Superior</label>
                <input 
                  type="text" 
                  value={formData.tagline} 
                  onChange={e => handleChange('tagline', e.target.value)} 
                  placeholder="Ex: Estilo & Tradição"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
                />
              </div>
            </div>

            {/* Edição do Título Principal (Hero) */}
            <div className="p-4 bg-ink-light/50 border border-gold/20 rounded-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h4 className="text-xs uppercase tracking-wider text-gold font-bold">Título Principal da Landing Page (Hero)</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1 font-medium">
                    1ª Linha do Título
                  </label>
                  <input 
                    type="text" 
                    value={formData.heroTitleLine1} 
                    onChange={e => handleChange('heroTitleLine1', e.target.value)} 
                    placeholder="Ex: Estilo e tradição"
                    className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1 font-medium">
                    Prefixo da 2ª Linha
                  </label>
                  <input 
                    type="text" 
                    value={formData.heroTitleLine2Prefix} 
                    onChange={e => handleChange('heroTitleLine2Prefix', e.target.value)} 
                    placeholder="Ex: para o"
                    className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3 text-sm text-white focus:border-gold outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gold mb-1 font-medium">
                    Destaque Dourado (Itálico)
                  </label>
                  <input 
                    type="text" 
                    value={formData.heroTitleHighlight} 
                    onChange={e => handleChange('heroTitleHighlight', e.target.value)} 
                    placeholder="Ex: homem moderno"
                    className="w-full bg-ink border border-gold/40 rounded-sm py-2 px-3 text-sm text-gold focus:border-gold outline-none transition-colors font-medium" 
                  />
                </div>
              </div>

              {/* Prévia em tempo real */}
              <div className="mt-2 pt-3 border-t border-ink-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 font-mono uppercase">Pré-visualização do Título:</span>
                <div className="text-sm font-serif font-bold text-white bg-ink/80 px-3 py-1.5 rounded-sm border border-ink-border">
                  {formData.heroTitleLine1 || 'Estilo e tradição'}{' '}
                  {formData.heroTitleLine2Prefix ? `${formData.heroTitleLine2Prefix} ` : ''}
                  <span className="text-gold italic">{formData.heroTitleHighlight || 'homem moderno'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">Mensagem de Boas-Vindas (Descrição do Hero)</label>
              <textarea 
                rows={3} 
                value={formData.welcomeMessage} 
                onChange={e => handleChange('welcomeMessage', e.target.value)} 
                placeholder="Texto de introdução na página principal..."
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none resize-none transition-colors"
              ></textarea>
            </div>
          </div>
        </div>

        {/* WhatsApp dos Agendamentos */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <h3 className="font-serif text-lg text-white mb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gold" /> WhatsApp dos Agendamentos
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Configure o número de WhatsApp que receberá a mensagem direta com os dados do agendamento feito pelo cliente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Número do WhatsApp (Envio direto)
              </label>
              <input 
                type="text" 
                value={formData.whatsappNumber} 
                onChange={e => handleChange('whatsappNumber', e.target.value)} 
                placeholder="5588988150887"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
                required
              />
              <span className="block text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                Digite somente números com o código do país (55) e DDD. Exemplo: <strong>5588988150887</strong>.
              </span>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Telefone para Exibição no Site
              </label>
              <input 
                type="text" 
                value={formData.phoneDisplay} 
                onChange={e => handleChange('phoneDisplay', e.target.value)} 
                placeholder="(88) 98815-0887"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
              <span className="block text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                Formato legível exibido nos cartões de contato e no rodapé do site.
              </span>
            </div>
          </div>
        </div>

        {/* Instagram da Barbearia */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <h3 className="font-serif text-lg text-white mb-2 flex items-center gap-2">
            <Instagram className="w-5 h-5 text-gold" /> Instagram na Landing Page
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Atualize o usuário e o link do Instagram exibidos na seção de contato e no rodapé.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Usuário do Instagram (@)
              </label>
              <input 
                type="text" 
                value={formData.instagramHandle} 
                onChange={e => handleChange('instagramHandle', e.target.value)} 
                placeholder="@barbeariaelite"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Link do Perfil do Instagram
              </label>
              <input 
                type="text" 
                value={formData.instagramUrl} 
                onChange={e => handleChange('instagramUrl', e.target.value)} 
                placeholder="https://instagram.com/barbeariaelite"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Localização e Google Maps */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <h3 className="font-serif text-lg text-white mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" /> Localização e Google Maps
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Defina o endereço físico e o link de localização que abre ao clicar no botão "Abrir no Google Maps".
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Endereço Completo
              </label>
              <textarea 
                rows={2} 
                value={formData.address} 
                onChange={e => handleChange('address', e.target.value)} 
                placeholder="Rua das Flores, Centro&#10;Juazeiro do Norte / CE"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none resize-none transition-colors" 
              ></textarea>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Link do Google Maps
              </label>
              <input 
                type="text" 
                value={formData.mapsUrl} 
                onChange={e => handleChange('mapsUrl', e.target.value)} 
                placeholder="https://maps.google.com/?q=Juazeiro+do+Norte"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
              <span className="block text-[11px] text-gray-500 mt-1.5">
                Pode ser o link de busca do Maps ou a URL gerada ao compartilhar a localização do seu estabelecimento.
              </span>
            </div>
          </div>
        </div>

        {/* Faixa Rolante (Ticker) na Landing Page */}
        <AdminTickerSettings />

        {/* Área de Experiência & Diferenciais na Landing Page */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h3 className="font-serif text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" /> Área de Experiência & Diferenciais
            </h3>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('experiencia')}
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light bg-gold/10 hover:bg-gold/20 border border-gold/30 px-3 py-1.5 rounded-sm transition-colors cursor-pointer w-fit"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Gerenciar Diferenciais e Ícones (Aba Dedicada)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Personalize os títulos, destaque e a descrição institucional que aparecem na seção de experiência da Landing Page.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Subtítulo Superior
                </label>
                <input 
                  type="text" 
                  value={formData.experienceTagline || ''} 
                  onChange={e => handleChange('experienceTagline', e.target.value)} 
                  placeholder="Por que nos escolher"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Prefixo do Título
                </label>
                <input 
                  type="text" 
                  value={formData.experienceTitlePrefix || ''} 
                  onChange={e => handleChange('experienceTitlePrefix', e.target.value)} 
                  placeholder="A experiência"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Destaque Dourado
                </label>
                <input 
                  type="text" 
                  value={formData.experienceTitleHighlight || ''} 
                  onChange={e => handleChange('experienceTitleHighlight', e.target.value)} 
                  placeholder="Elite"
                  className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-gold focus:border-gold outline-none transition-colors font-medium" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Texto Descritivo da Experiência
              </label>
              <textarea 
                rows={3} 
                value={formData.experienceDescription || ''} 
                onChange={e => handleChange('experienceDescription', e.target.value)} 
                placeholder="Cada detalhe é pensado para proporcionar o melhor atendimento..."
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none resize-none transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Depoimentos & Avaliações na Landing Page */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h3 className="font-serif text-lg text-white flex items-center gap-2">
              <Quote className="w-5 h-5 text-gold" /> Depoimentos & Avaliações (Títulos da Área)
            </h3>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('depoimentos')}
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light bg-gold/10 hover:bg-gold/20 border border-gold/30 px-3 py-1.5 rounded-sm transition-colors cursor-pointer w-fit"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Gerenciar Depoimentos (Aba Dedicada)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Personalize os textos do cabeçalho da seção de comentários que seus clientes visualizam na Landing Page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Subtítulo Superior
              </label>
              <input 
                type="text" 
                value={formData.testimonialsTagline || ''} 
                onChange={e => handleChange('testimonialsTagline', e.target.value)} 
                placeholder="O que dizem sobre nós"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Prefixo do Título
              </label>
              <input 
                type="text" 
                value={formData.testimonialsTitlePrefix || ''} 
                onChange={e => handleChange('testimonialsTitlePrefix', e.target.value)} 
                placeholder="Clientes que"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-white focus:border-gold outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Destaque Dourado
              </label>
              <input 
                type="text" 
                value={formData.testimonialsTitleHighlight || ''} 
                onChange={e => handleChange('testimonialsTitleHighlight', e.target.value)} 
                placeholder="confiam"
                className="w-full bg-ink-light border border-ink-border rounded-sm py-2.5 px-3.5 text-sm text-gold focus:border-gold outline-none transition-colors font-medium" 
              />
            </div>
          </div>
        </div>

        {/* Identidade Visual - Logotipo da Barbearia */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="font-serif text-lg text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" /> Logotipo da Barbearia
            </h3>
            {draftLogoUrl && (
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 w-fit">
                <Check className="w-3 h-3" />
                {draftLogoUrl.startsWith('data:') ? 'Arquivo Local Carregado' : 'Link Web Ativo'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Você pode enviar uma <strong>imagem do seu computador</strong> (com suporte total a PNG transparente) ou informar um <strong>link direto da web</strong>. Ambas as opções funcionam na Landing Page e no Painel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Opção 1: Arquivo Local */}
            <div className="bg-ink-light/60 border border-ink-border hover:border-gold/30 rounded-sm p-4.5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-gold" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Opção 1: Enviar Arquivo Local</h4>
                </div>
                <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                  Envie sua logo direto do computador ou celular. Otimizado com suporte a PNG transparente, WebP ou JPG.
                </p>
              </div>

              <div>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full flex items-center justify-center gap-2 bg-gold/15 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold px-4 py-2.5 rounded-sm text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                >
                  {isUploadingLogo ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-inherit" />
                      <span>Processando e Carregando Imagem...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Escolher Arquivo do Computador</span>
                    </>
                  )}
                </button>
                <span className="block text-[10px] text-gray-500 mt-2 text-center">
                  PNG com fundo transparente recomendado
                </span>
              </div>
            </div>

            {/* Opção 2: Link Direto (URL) */}
            <div className="bg-ink-light/60 border border-ink-border hover:border-gold/30 rounded-sm p-4.5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-4 h-4 text-gold" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Opção 2: Inserir Link Direto (URL)</h4>
                </div>
                <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                  Cole o endereço público de uma imagem hospedada na internet (ex: Imgur, Cloudinary, site próprio).
                </p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type="url" 
                    value={logoLinkInput} 
                    onChange={e => handleLinkChange(e.target.value)} 
                    placeholder="https://exemplo.com/logo.png" 
                    className="w-full bg-ink border border-ink-border rounded-sm py-2 px-3 text-xs text-white focus:border-gold outline-none transition-colors" 
                  />
                  {logoLinkInput && (
                    <button
                      type="button"
                      onClick={() => handleLinkChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                      title="Limpar link"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="block text-[10px] text-gray-500 mt-2 text-center">
                  URL completa começando com https:// ou http://
                </span>
              </div>
            </div>
          </div>

          {/* Pré-visualização do Logotipo Ativo */}
          {draftLogoUrl && (
            <div className="mt-5 p-4 bg-ink-light/40 border border-ink-border rounded-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gold" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Pré-visualização do Logotipo
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono bg-ink px-2 py-0.5 rounded border border-ink-border">
                    {draftLogoUrl.startsWith('data:') ? 'Arquivo Local' : 'Link Web'}
                  </span>
                </div>
                <button 
                  type="button" 
                  disabled={isUploadingLogo}
                  onClick={() => {
                    setDraftLogoUrl(null);
                    setLogoLinkInput('');
                    setLogoImageError(false);
                    setIsDirty(true);
                  }} 
                  className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1.5 px-2.5 hover:bg-rose-500/10 rounded-sm disabled:opacity-50 cursor-pointer w-fit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Logotipo (Usar Ícone Padrão)</span>
                </button>
              </div>

              {/* Área de pré-visualização com suporte total a transparência pura */}
              <div className="p-6 bg-transparent border border-ink-border rounded-sm flex items-center justify-center min-h-[110px] relative">
                {logoImageError ? (
                  <div className="flex items-center gap-2 text-amber-400 text-xs py-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Não foi possível carregar a imagem. Verifique se o link ou arquivo é válido.</span>
                  </div>
                ) : (
                  <BrandLogo
                    src={draftLogoUrl}
                    alt="Prévia do Logotipo"
                    className="h-20 sm:h-24 max-w-[320px] sm:max-w-[420px]"
                    showTextFallback={false}
                  />
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-2 text-center sm:text-left">
                Transparência original 100% preservada. A imagem será exibida no menu superior (Navbar), no rodapé do site e no cabeçalho administrativo.
              </p>
            </div>
          )}
        </div>

        {/* Tema e Cores */}
        <div className="bg-ink border border-ink-border rounded-sm p-6">
          <div className="mb-4">
            <h3 className="font-serif text-lg text-white mb-1 flex items-center gap-2">
              <Palette className="w-5 h-5 text-gold" /> Tema e Paleta Visual da Barbearia
            </h3>
            <p className="text-xs text-gray-400">
              Selecione uma das 6 combinações exclusivas com tonalidades primária (fundo e estrutura) e secundária (destaque e acentos).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.entries(THEMES).map(([key, t]) => {
              const isSelected = (theme === key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setTheme(key);
                    setIsDirty(true);
                  }}
                  className={`relative flex flex-col p-4 rounded-sm border-2 text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                      : 'border-ink-border bg-ink-light hover:border-gray-500 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white group-hover:text-gold transition-colors">
                      {t.name}
                    </span>
                    {isSelected ? (
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-600"></span>
                    )}
                  </div>

                  {/* Dual Color preview swatches */}
                  <div className="flex items-center gap-2.5 p-2 bg-ink/80 rounded border border-ink-border">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-sm border border-white/20 shadow-sm"
                        style={{ backgroundColor: t.primary }}
                        title={`Primária: ${t.primary}`}
                      />
                      <span className="text-[10px] text-gray-400 font-mono">Primária</span>
                    </div>
                    <div className="h-4 w-px bg-ink-border" />
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-sm border border-white/20 shadow-sm"
                        style={{ backgroundColor: t.secondary }}
                        title={`Secundária: ${t.secondary}`}
                      />
                      <span className="text-[10px] text-gray-400 font-mono">Secundária</span>
                    </div>
                  </div>

                  {/* Mini Preview bar */}
                  <div 
                    className="mt-3 h-2 w-full rounded-full overflow-hidden flex border border-white/10"
                    style={{ background: `linear-gradient(90deg, ${t.primary} 0%, ${t.secondary} 100%)` }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Ações de Salvar / Restaurar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ink-border">
          {canWriteSettings ? (
            <button 
              type="button" 
              onClick={handleReset} 
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors py-2 px-3 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões
            </button>
          ) : <div />}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => window.location.hash = ''} 
              className="w-full sm:w-auto px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors border border-ink-border rounded-sm cursor-pointer"
            >
              Voltar ao Início
            </button>
            {canWriteSettings && (
              <button 
                type="submit" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-8 py-3 rounded-sm text-sm transition-all shadow-lg shadow-gold/20 hover:scale-[1.02] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============== MAIN APP ============== */
function BarbershopApp() {
  const { user, appUser, loading: authLoading, isAdmin, isSuperAdmin, isExpired, signOutUser } = useAuth();
  const { tenant, tenantId, tenantStatus, loadingTenant, adminTenantMode, selectTenantForAdmin } = useTenant();
  const [preselectedService, setPreselectedService] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tenantViewMode, setTenantViewMode] = useState<'dashboard' | 'site'>('dashboard');
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);
  const [showLicensesAdminPanel, setShowLicensesAdminPanel] = useState(false);

  // Globals
  const {
    settings: rawSettings, updateSettings,
    logoUrl, setLogoUrl,
    appointments, addAppointment, updateAppointmentStatus, updateAppointmentPayment, updateAppointmentProfessional, deleteAppointment,
    services: rawServices, setServices,
    professionals: rawProfessionals, setProfessionals,
    timeSlots: rawTimeSlots, setTimeSlots,
    testimonials: rawTestimonials, setTestimonials,
    differentials: rawDifferentials, setDifferentials
  } = useTenantData();

  const settings: BarbershopSettings = { ...DEFAULT_SETTINGS, ...(rawSettings || {}) };
  const services = rawServices || [];
  const professionals = rawProfessionals || [];
  const timeSlots = rawTimeSlots || [];
  const testimonials = rawTestimonials || [];
  const differentials = rawDifferentials || [];

  const [theme, setTheme] = useState<string>(() => {
    const key = tenantId ? `tenant_${tenantId}_theme` : 'tenant_default_theme';
    return safeStorage.getItem(key) || rawSettings?.theme || 'gold';
  });

  // Keep theme synchronized with tenant settings from Firestore when rawSettings loads or tenant changes
  useEffect(() => {
    if (rawSettings?.theme && THEMES[rawSettings.theme]) {
      setTheme(rawSettings.theme);
    } else if (tenantId) {
      const key = `tenant_${tenantId}_theme`;
      const stored = safeStorage.getItem(key);
      if (stored && THEMES[stored]) {
        setTheme(stored);
      }
    }
  }, [rawSettings?.theme, tenantId]);

  useEffect(() => {
    const key = tenantId ? `tenant_${tenantId}_theme` : 'tenant_default_theme';
    if (theme) {
      safeStorage.setItem(key, theme);
    }
  }, [theme, tenantId]);

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash;
      setCurrentHash(newHash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update CSS Variables for Theme
  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = THEMES[theme as keyof typeof THEMES];
    if (selectedTheme) {
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [theme]);

  // If a non-superadmin user logs in while on #admin hash, clear the hash so they navigate to their company dashboard
  useEffect(() => {
    if (user && appUser && !isSuperAdmin && currentHash === '#admin') {
      window.location.hash = '';
      setCurrentHash('');
    }
  }, [user, appUser, isSuperAdmin, currentHash]);

  // Determine user destination view
  const destination = resolveUserDestination({
    user,
    appUser,
    tenant,
    tenantStatus,
    loadingTenant,
    isSuperAdmin,
    isAdmin: Boolean(isAdmin),
    isExpired: Boolean(isExpired),
    currentHash,
    adminTenantMode,
  });

  async function handleLogout() {
    setLoggedOutNotice(true);
    setShowLoginModal(true);
    await signOutUser();
    window.location.hash = '';
    setCurrentHash('');
  }

  function handleBookService(serviceId?: string) {
    if (serviceId) setPreselectedService(serviceId);
    setTenantViewMode('site');
    setTimeout(() => {
      document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleBackToLanding() {
    setTenantViewMode('site');
    window.location.hash = '';
    setCurrentHash('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Verified Super Admin / Admin check
  const isVerifiedAdmin = Boolean(
    isAdmin ||
    isSuperAdmin ||
    (user?.email && (user.email.toLowerCase() === 'conecdevce@gmail.com' || user.email.toLowerCase() === 'conectdevce@gmail.com'))
  );

  // 1. Loading State Screen
  const isAwaitingTenant = Boolean(
    (user && !isVerifiedAdmin && loadingTenant) ||
    (isVerifiedAdmin && adminTenantMode !== 'none' && loadingTenant)
  );

  if (authLoading || isAwaitingTenant) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden grain-bg">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#c9a961]/40 flex items-center justify-center text-[#c9a961] shadow-2xl mb-4 animate-pulse">
          <Scissors className="w-8 h-8" />
        </div>
        <div className="font-serif text-2xl font-bold text-white mb-2">
          Barber <span className="gold-shimmer italic">Hub</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3.5 h-3.5 border-2 border-[#c9a961] border-t-transparent rounded-full animate-spin" />
          <span>Carregando dados da empresa...</span>
        </div>
      </div>
    );
  }

  // 2. Admin Panel View (if opened standalone by Master Admin)
  if (showLicensesAdminPanel && isSuperAdmin) {
    return <AdminPanel onBackToApp={() => setShowLicensesAdminPanel(false)} />;
  }

  // 3. Render content by resolved destination
  let Content: React.ReactNode;
  if (destination === 'landing_only') {
    Content = <LandingOnlyScreen onBackToLanding={handleBackToLanding} onLogout={handleLogout} />;
  } else 

  if (destination === 'pending') {
    Content = <PendingUserScreen onLogout={handleLogout} />;
  } else if (destination === 'blocked') {
    Content = <BlockedUserScreen onLogout={handleLogout} />;
  } else if (destination === 'admin') {
    if (isSuperAdmin) {
      Content = (
        <AdminDashboard 
          onLogout={handleLogout} 
          onBackToLanding={handleBackToLanding} 
        />
      );
    } else {
      Content = (
        <AdminLogin 
          onLogin={() => {}} 
          loggedOutNotice={loggedOutNotice} 
          onBackToLanding={handleBackToLanding} 
        />
      );
    }
  } else if (destination === 'tenant') {
    let effectiveViewMode = tenantViewMode;
    if (adminTenantMode === 'landing_preview') effectiveViewMode = 'site';
    if (adminTenantMode === 'landing_editor') effectiveViewMode = 'dashboard';

    if (adminTenantMode === 'landing_editor') {
      Content = <MasterLandingEditor />;
    } else if (effectiveViewMode === 'dashboard') {
      Content = (
        <AdminDashboard 
          onLogout={handleLogout} 
          onBackToLanding={() => setTenantViewMode('site')} 
        />
      );
    } else {
      Content = (
        <div className="min-h-screen bg-ink text-gray-200 antialiased relative">
          {adminTenantMode === 'landing_preview' && tenant && (
            <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between z-[60] sticky top-0 shadow-md">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Eye className="w-4 h-4" />
                <span>
                  MASTER — PREVIEW DA LANDING — {tenant.tradeName || tenant.name}
                </span>
              </div>
              <button
                onClick={() => {
                  selectTenantForAdmin(null, 'none');
                  window.location.hash = '#admin';
                }}
                className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                Encerrar Preview
              </button>
            </div>
          )}
          <Navbar 
            onOpenAdminDashboard={() => setTenantViewMode('dashboard')} 
            onLogout={handleLogout} 
          />
          <Hero />
          <Ribbon />
          <Diferenciais onBook={handleBookService} />
          <PlansSection onBook={handleBookService} />
          <Services onBook={handleBookService} />
          <Booking preselectedService={preselectedService} />
          <Testimonials />
          <LocationFooter />
          <Footer />
          <ScrollDownIndicator label="Role para baixo" />
          <FloatingCTA />
        </div>
      );
    }
  } else {
    // destination === 'unauthenticated'
    if (showLoginModal) {
      Content = (
        <LoginScreen 
          onBack={() => {
            setShowLoginModal(false);
            setLoggedOutNotice(false);
          }} 
          loggedOutNotice={loggedOutNotice} 
        />
      );
    } else {
      Content = (
        <div className="min-h-screen bg-ink text-gray-200 antialiased relative">
          {/* Discreet secret login access button at bottom left - visible only on hover */}
          <div className="fixed bottom-1 left-1 z-[60] p-2 group pointer-events-auto">
            <button
              type="button"
              id="secret-admin-access-btn"
              onClick={() => setShowLoginModal(true)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 w-5 h-5 flex items-center justify-center bg-ink/90 hover:bg-gold text-gold hover:text-ink border border-gold/40 hover:border-gold rounded-full shadow-lg backdrop-blur-sm cursor-pointer active:scale-90"
              title="Acesso / Conectar"
              aria-label="Conectar"
            >
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <Navbar />
          <Hero />
          <Ribbon />
          <Diferenciais onBook={handleBookService} />
          <PlansSection onBook={handleBookService} />
          <Services onBook={handleBookService} />
          <Booking preselectedService={preselectedService} />
          <Testimonials />
          <LocationFooter />
          <Footer />
          <ScrollDownIndicator label="Role para baixo" />
          <FloatingCTA />
        </div>
      );
    }
  }

  return (
    <AppContext.Provider value={{ 
      logoUrl, setLogoUrl, 
      theme, setTheme,
      settings, updateSettings,
      appointments, addAppointment, updateAppointmentStatus, updateAppointmentPayment, updateAppointmentProfessional, deleteAppointment,
      services, setServices,
      professionals, setProfessionals,
      timeSlots, setTimeSlots,
      testimonials, setTestimonials,
      differentials, setDifferentials
    }}>
      {Content}
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <BarbershopApp />
      </TenantProvider>
    </AuthProvider>
  );
}
