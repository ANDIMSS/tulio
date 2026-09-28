import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { canMasterAccessSystem, canCustomerAccessSystem, DEFAULT_SAAS_PLANS } from '../lib/authUtils';
import { compressImage, saveVideoBlobToIndexedDB } from '../lib/storage';

function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = cleanFirestoreData(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function ensureLightweightServiceImage(img: string | undefined | null): Promise<string> {
  if (!img || typeof img !== 'string') return '';
  const trimmed = img.trim();
  if (trimmed.startsWith('data:') || trimmed.length > 30000) {
    try {
      return await compressImage(trimmed, 450, 450, 0.70);
    } catch (e) {
      console.warn('Compress image fallback in service sanitization:', e);
      return trimmed;
    }
  }
  return trimmed;
}

function deduplicateAppointmentsList(list: any[]): any[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: any[] = [];

  for (const item of list) {
    if (!item) continue;
    const id = item.id || '';
    if (id && seenIds.has(id)) continue;

    // Normalization keys
    const p = (item.professional || '').trim().toLowerCase();
    const c = (item.client || '').trim().toLowerCase();
    const d = (item.date || '').trim();
    const t = (item.time || '').trim();
    const key = `${d}_${t}_${p}_${c}`;

    if (item.status !== 'Cancelado' && seenKeys.has(key)) {
      continue; // Skip duplicate booking
    }

    if (id) seenIds.add(id);
    if (item.status !== 'Cancelado') seenKeys.add(key);
    result.push(item);
  }
  return result;
}

export interface UseTenantDataReturn {
  // Settings & Branding
  settings: any;
  updateSettings: (newSettings: any) => Promise<void>;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => Promise<void>;
  
  // Appointments
  appointments: any[];
  addAppointment: (app: any) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  updateAppointmentPayment: (id: string, method: string, status: string) => Promise<void>;
  updateAppointmentProfessional: (id: string, professional: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Services
  services: any[];
  setServices: (newServices: any[]) => Promise<void>;
  addService: (service: any) => Promise<void>;
  updateService: (id: string, service: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Professionals / Barbers
  professionals: any[];
  setProfessionals: (newProfs: any[]) => Promise<void>;
  addProfessional: (prof: any) => Promise<void>;
  updateProfessional: (id: string, prof: any) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;

  // Time Slots
  timeSlots: string[];
  setTimeSlots: (slots: string[]) => Promise<void>;

  // Testimonials
  testimonials: any[];
  setTestimonials: (newTestimonials: any[]) => Promise<void>;
  addTestimonial: (test: any) => Promise<void>;
  updateTestimonial: (id: string, test: any) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  // Differentials
  differentials: any[];
  setDifferentials: (newDiffs: any[]) => Promise<void>;
  addDifferential: (diff: any) => Promise<void>;
  updateDifferential: (id: string, diff: any) => Promise<void>;
  deleteDifferential: (id: string) => Promise<void>;

  // CRM Leads
  crmLeads?: any[];

  // Status & Meta
  loading: boolean;
  isInitialLoaded: boolean;
  error: string | null;
  seedDefaultData: (defaults: {
    services?: any[];
    professionals?: any[];
    differentials?: any[];
    testimonials?: any[];
    timeSlots?: string[];
    settings?: any;
  }) => Promise<void>;
}

export function useTenantData(): UseTenantDataReturn {
  const { tenantId, loadingTenant, tenant, adminTenantMode } = useTenant();
  const { appUser, isSuperAdmin, isExpired } = useAuth();

  const [settings, setSettingsState] = useState<any>(null);

  const [appointments, setAppointmentsState] = useState<any[]>([]);
  const [services, setServicesState] = useState<any[]>([]);
  const [professionals, setProfessionalsState] = useState<any[]>([]);
  const [timeSlots, setTimeSlotsState] = useState<string[]>([]);
  const [testimonials, setTestimonialsState] = useState<any[]>([]);
  const [differentials, setDifferentialsState] = useState<any[]>([]);
  const [crmLeads, setCrmLeadsState] = useState<any[]>([]);
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);

  // In-flight slot lock to protect against rapid double-submits at the client/hook level
  const submittingSlotsRef = useRef<Set<string>>(new Set());

  const [loadedFlags, setLoadedFlags] = useState({
    settings: false,
    landing: false,
    appointments: false,
    services: false,
    professionals: false,
    timeSlots: false,
    testimonials: false,
    differentials: false
  });

  const [error, setError] = useState<string | null>(null);

  const isInitialLoaded = 
    loadedFlags.settings && 
    loadedFlags.services && 
    loadedFlags.professionals && 
    loadedFlags.timeSlots;

  const loading = loadingTenant || !isInitialLoaded;

  useEffect(() => {
    // Isolar dados ao mudar de tenant
    setSettingsState(null);
    setAppointmentsState([]);
    setServicesState([]);
    setProfessionalsState([]);
    setTimeSlotsState([]);
    setTestimonialsState([]);
    setDifferentialsState([]);
    setLogoUrlState(null);
    setLoadedFlags({
      settings: false,
      landing: false,
      appointments: false,
      services: false,
      professionals: false,
      timeSlots: false,
      testimonials: false,
      differentials: false
    });
    setError(null);

    if (!tenantId) {
      return;
    }

    
    const isMaintenance = adminTenantMode === 'system_maintenance';
    const isEditorOrPreview = adminTenantMode === 'landing_editor' || adminTenantMode === 'landing_preview';
    
    // Private collections (appointments, crm_leads) require both internal permission AND active Firebase Auth
    const isActuallySignedIn = Boolean(auth.currentUser);
    let canLoadPrivateTenantData = false;
    if (isActuallySignedIn) {
      if (isSuperAdmin) {
        if (isMaintenance) {
          canLoadPrivateTenantData = true;
        } else if (isEditorOrPreview) {
          canLoadPrivateTenantData = false;
        } else {
          canLoadPrivateTenantData = canMasterAccessSystem(isSuperAdmin, tenant);
        }
      } else {
        canLoadPrivateTenantData = canCustomerAccessSystem(appUser, tenant, isExpired);
      }
    }

// 1. Business settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'tenants', tenantId, 'settings', 'business'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettingsState((prev: any) => ({ ...(prev || {}), ...data }));
        }
        setLoadedFlags(f => ({ ...f, settings: true }));
      },
      (err) => {
        console.error("Firestore settings listener error:", err);
        setError("Erro ao carregar configurações da empresa.");
        setLoadedFlags(f => ({ ...f, settings: true }));
      }
    );

    // 2. Landing settings listener
    const unsubLanding = onSnapshot(
      doc(db, 'tenants', tenantId, 'settings', 'landing'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoUrl !== undefined) {
            setLogoUrlState(data.logoUrl || null);
          }
          setSettingsState((prev: any) => ({ ...(prev || {}), ...data }));
        }
        setLoadedFlags(f => ({ ...f, landing: true }));
      },
      (err) => {
        console.error("Firestore landing settings listener error:", err);
        setLoadedFlags(f => ({ ...f, landing: true }));
      }
    );

    // 3. Appointments listener
    
    let unsubAppointments = () => {};
    if (canLoadPrivateTenantData) {
      unsubAppointments = onSnapshot(

      collection(db, 'tenants', tenantId, 'appointments'),
      (snap) => {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAppointmentsState(deduplicateAppointmentsList(loaded));
        setLoadedFlags(f => ({ ...f, appointments: true }));
      },
      (err) => {
        console.error("Firestore appointments listener error:", err);
        setLoadedFlags(f => ({ ...f, appointments: true }));
      }
    );

   
    } else {
      setLoadedFlags(f => ({ ...f, appointments: true }));
    }
 // 4. Services listener
    const unsubServices = onSnapshot(
      collection(db, 'tenants', tenantId, 'services'),
      (snap) => {
        setServicesState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadedFlags(f => ({ ...f, services: true }));
      },
      (err) => {
        console.error("Firestore services listener error:", err);
        setLoadedFlags(f => ({ ...f, services: true }));
      }
    );

    // 5. Professionals / Barbers listener
    const unsubProfessionals = onSnapshot(
      collection(db, 'tenants', tenantId, 'barbers'),
      (snap) => {
        setProfessionalsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadedFlags(f => ({ ...f, professionals: true }));
      },
      (err) => {
        console.error("Firestore barbers listener error:", err);
        setLoadedFlags(f => ({ ...f, professionals: true }));
      }
    );

    // 6. TimeSlots listener
    const unsubTimeSlots = onSnapshot(
      doc(db, 'tenants', tenantId, 'settings', 'timeSlots'),
      (snap) => {
        if (snap.exists()) {
          setTimeSlotsState(snap.data().slots || []);
        } else {
          setTimeSlotsState([]);
        }
        setLoadedFlags(f => ({ ...f, timeSlots: true }));
      },
      (err) => {
        console.error("Firestore timeSlots listener error:", err);
        setLoadedFlags(f => ({ ...f, timeSlots: true }));
      }
    );

    // 7. Testimonials listener
    const unsubTestimonials = onSnapshot(
      collection(db, 'tenants', tenantId, 'testimonials'),
      (snap) => {
        setTestimonialsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadedFlags(f => ({ ...f, testimonials: true }));
      },
      (err) => {
        console.error("Firestore testimonials listener error:", err);
        setLoadedFlags(f => ({ ...f, testimonials: true }));
      }
    );

    // 8. Differentials listener
    const unsubDifferentials = onSnapshot(
      collection(db, 'tenants', tenantId, 'differentials'),
      (snap) => {
        setDifferentialsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadedFlags(f => ({ ...f, differentials: true }));
      },
      (err) => {
        console.error("Firestore differentials listener error:", err);
        setLoadedFlags(f => ({ ...f, differentials: true }));
      }
    );

    // 9. CRM Leads listener
    let unsubCrmLeads = () => {};
    if (canLoadPrivateTenantData) {
      unsubCrmLeads = onSnapshot(
        collection(db, 'tenants', tenantId, 'crm_leads'),
        (snap) => {
          setCrmLeadsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => {
          console.warn("Firestore crm_leads listener notice:", err);
        }
      );
    }

    return () => {
      unsubSettings();
      unsubLanding();
      unsubAppointments();
      unsubServices();
      unsubProfessionals();
      unsubTimeSlots();
      unsubTestimonials();
      unsubDifferentials();
      unsubCrmLeads();
    };
  }, [
    tenantId, 
    adminTenantMode, 
    isSuperAdmin, 
    appUser?.tenantId, 
    appUser?.isApproved, 
    tenant?.status, 
    tenant?.accessMode, 
    tenant?.masterMaintenanceEnabled, 
    isExpired
  ]);

  // SETTINGS UPDATER (Atomic writeBatch)
  const updateSettings = useCallback(async (newSettings: any) => {
    const opTenantId = tenantId;
    const cleaned = cleanFirestoreData(newSettings);
    setSettingsState((prev: any) => ({ ...(prev || {}), ...cleaned }));

    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);
      const businessRef = doc(db, 'tenants', opTenantId, 'settings', 'business');
      batch.set(businessRef, cleaned, { merge: true });

      const landingKeys = [
        'name',
        'tagline',
        'heroTitleLine1', 
        'heroTitleLine2Prefix', 
        'heroTitleHighlight', 
        'welcomeMessage',
        'whatsappNumber',
        'phoneDisplay',
        'instagramHandle',
        'instagramUrl',
        'address',
        'mapsUrl',
        'theme',
        'primaryColor',
        'secondaryColor',
        'logoUrl', 
        'tickerItems', 
        'tickerSeparatorIcon', 
        'tickerTheme',
        'tickerSpeed',
        'tickerFontSize',
        'experienceTagline',
        'experienceTitlePrefix',
        'experienceTitleHighlight',
        'experienceDescription',
        'showDifferentialsBelowExperiences',
        'amenityDifferentials',
        'differentialsTitle',
        'differentialsSubtitle',
        'testimonialsTagline',
        'testimonialsTitlePrefix',
        'testimonialsTitleHighlight',
        'plansTagline',
        'plansTitlePrefix',
        'plansTitleHighlight',
        'plansDescription',
        'plansList'
      ];
      
      const hasLandingKey = Object.keys(cleaned).some(k => landingKeys.includes(k));
      if (hasLandingKey) {
        const landingSubset: any = {};
        landingKeys.forEach(k => {
          if (cleaned[k] !== undefined) landingSubset[k] = cleaned[k];
        });
        const landingRef = doc(db, 'tenants', opTenantId, 'settings', 'landing');
        batch.set(landingRef, landingSubset, { merge: true });
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao salvar configurações no Firestore:", err);
      setError("Falha ao salvar configurações no banco de dados.");
      throw err;
    }
  }, [tenantId]);

  // LOGO UPDATER (Atomic writeBatch)
  const setLogoUrl = useCallback(async (url: string | null) => {
    const opTenantId = tenantId;
    setLogoUrlState(url);

    if (!opTenantId) return;
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'tenants', opTenantId, 'settings', 'landing'), { logoUrl: url }, { merge: true });
      batch.set(doc(db, 'tenants', opTenantId, 'settings', 'business'), { logoUrl: url }, { merge: true });
      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao atualizar logo:", err);
      setError("Falha ao atualizar logo no Firestore.");
      throw err;
    }
  }, [tenantId]);

  // APPOINTMENTS CRUD - SEC-003 Hardened
  const addAppointment = useCallback(async (app: any) => {
    const opTenantId = tenantId;

    // 1. Validation of mandatory fields
    const rawClient = typeof app?.client === 'string' ? app.client.trim() : '';
    if (!rawClient || rawClient.length < 2 || rawClient.length > 100) {
      throw new Error("Por favor, informe o nome do cliente (entre 2 e 100 caracteres).");
    }

    const rawPhone = typeof app?.phone === 'string' ? app.phone.trim() : '';
    const numericPhoneDigits = rawPhone.replace(/\D/g, '');
    if (!rawPhone || numericPhoneDigits.length < 8 || rawPhone.length > 30) {
      throw new Error("Por favor, informe um número de telefone ou WhatsApp válido (com DDD).");
    }

    const rawDate = typeof app?.date === 'string' ? app.date.trim() : '';
    const dateRegex = /^([0-9]{2}\/[0-9]{2}\/[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})$/;
    if (!rawDate || !dateRegex.test(rawDate)) {
      throw new Error("Data inválida. O formato esperado é DD/MM/YYYY ou YYYY-MM-DD.");
    }

    const rawTime = typeof app?.time === 'string' ? app.time.trim() : '';
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!rawTime || !timeRegex.test(rawTime)) {
      throw new Error("Horário inválido. O formato esperado é HH:MM (entre 00:00 e 23:59).");
    }

    const rawService = typeof app?.service === 'string' ? app.service.trim() : '';
    if (!rawService || rawService.length < 2 || rawService.length > 100) {
      throw new Error("Por favor, selecione um serviço válido.");
    }

    const rawProfessional = typeof app?.professional === 'string' ? app.professional.trim() : '';
    if (!rawProfessional || rawProfessional.length < 2 || rawProfessional.length > 100) {
      throw new Error("Por favor, selecione um profissional válido.");
    }

    // 2. Validate against tenant catalogs & protect price derivation
    const matchedService = services.find(s => 
      (app.serviceId && s.id === app.serviceId) ||
      (s.name && s.name.trim().toLowerCase() === rawService.toLowerCase()) ||
      (s.id && s.id === rawService)
    );

    if (app.serviceId && !matchedService) {
      throw new Error("O serviço selecionado não pertence a esta barbearia ou não foi encontrado.");
    }

    const matchedProfessional = professionals.find(p =>
      (app.professionalId && p.id === app.professionalId) ||
      (p.name && p.name.trim().toLowerCase() === rawProfessional.toLowerCase()) ||
      (p.id && p.id === rawProfessional)
    );

    if (app.professionalId && !matchedProfessional) {
      throw new Error("O profissional selecionado não pertence a esta barbearia ou não foi encontrado.");
    }

    // Capture official price and duration directly from the tenant's registered service (cannot be tampered)
    const officialPrice = matchedService?.price || (typeof app.price === 'string' ? app.price.trim().slice(0, 30) : 'R$ 0');
    const finalPrice = officialPrice || 'R$ 0';
    const officialDuration = matchedService?.duration || (typeof app.duration === 'string' ? app.duration.trim().slice(0, 30) : '45 min');

    const p = (matchedProfessional?.name || rawProfessional).trim().toLowerCase();
    const d = rawDate;
    const t = rawTime;

    // 3. Check local state for duplicate active booking (same prof, same date, same time, status !== 'Cancelado')
    const duplicate = appointments.find(existing => 
      existing.status !== 'Cancelado' &&
      (existing.date || '').trim() === d &&
      (existing.time || '').trim() === t &&
      (existing.professional || '').trim().toLowerCase() === p
    );
    if (duplicate) {
      throw new Error(`O profissional já possui um agendamento ou bloqueio ativo no horário ${t} do dia ${d}.`);
    }

    // Compute deterministic slotId
    const sanitizedProf = (p || 'barber').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const cleanTime = (t || '00-00').replace(':', '-');
    const cleanDate = (d || 'date').replace(/\//g, '-');
    const slotId = `${cleanDate}_${cleanTime}_${sanitizedProf}`;

    // Memory-level double-submit lock for the exact slot
    if (submittingSlotsRef.current.has(slotId)) {
      throw new Error("Já existe uma solicitação de agendamento em andamento para este horário. Por favor, aguarde alguns instantes.");
    }
    submittingSlotsRef.current.add(slotId);

    // Initial status: 'Pendente' for public bookings, or valid status if admin/staff flow
    const allowedStatuses = ['Pendente', 'Confirmado', 'Cancelado'];
    let finalStatus = 'Pendente';
    if (app.status && allowedStatuses.includes(app.status)) {
      finalStatus = app.status;
    }

    const allowedPaymentMethods = ['Pix', 'Cartão', 'Dinheiro', 'Não definido'];
    const finalPaymentMethod = allowedPaymentMethods.includes(app.paymentMethod) ? app.paymentMethod : 'Não definido';
    const finalPaymentStatus = app.paymentStatus === 'Pago' && (appUser?.isAdmin || isSuperAdmin) ? 'Pago' : 'Pendente';

    // Strict allowlist payload - NEVER spread ...app to block arbitrary injected properties
    const appointmentDoc: Record<string, any> = {
      client: rawClient,
      phone: rawPhone,
      service: matchedService?.name || rawService,
      professional: matchedProfessional?.name || rawProfessional,
      date: rawDate,
      time: rawTime,
      duration: String(officialDuration).slice(0, 30),
      price: finalPrice,
      servicePrice: finalPrice,
      totalPrice: finalPrice,
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      status: finalStatus,
      slotId,
      createdAt: new Date().toISOString()
    };

    if (matchedService?.id) {
      appointmentDoc.serviceId = matchedService.id;
    }
    if (matchedProfessional?.id) {
      appointmentDoc.professionalId = matchedProfessional.id;
    }
    if (typeof app.notes === 'string' && app.notes.trim()) {
      appointmentDoc.notes = app.notes.trim().slice(0, 300);
    }
    if (typeof app.planName === 'string' && app.planName.trim()) {
      appointmentDoc.planName = app.planName.trim().slice(0, 100);
    }

    if (!opTenantId) {
      try {
        const tempId = 'temp_' + Date.now();
        setAppointmentsState(prev => [{ 
          id: tempId, 
          ...appointmentDoc
        }, ...prev]);
        return;
      } finally {
        submittingSlotsRef.current.delete(slotId);
      }
    }

    try {
      const slotRef = doc(db, 'tenants', opTenantId, 'occupied_slots', slotId);
      const newRef = doc(collection(db, 'tenants', opTenantId, 'appointments'));

      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        if (slotSnap.exists()) {
          const slotData = slotSnap.data();
          if (slotData && slotData.status === 'occupied') {
            throw new Error(`Este horário (${t}) acabou de ser reservado para este profissional. Por favor, selecione outro horário.`);
          }
        }

        const slotPayload: Record<string, any> = {
          slotId,
          date: d,
          time: t,
          professional: matchedProfessional?.name || p,
          status: 'occupied',
          appointmentId: newRef.id,
          createdAt: new Date().toISOString()
        };
        if (matchedProfessional?.id) {
          slotPayload.professionalId = matchedProfessional.id;
        }

        // Atomically occupy the slot
        transaction.set(slotRef, slotPayload);

        // Atomically create the sanitized appointment doc
        transaction.set(newRef, appointmentDoc);
      });
    } catch (err: any) {
      console.error("Erro ao salvar agendamento atômico:", err);
      throw err;
    } finally {
      submittingSlotsRef.current.delete(slotId);
    }
  }, [tenantId, appointments, services, professionals, appUser, isSuperAdmin]);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    const opTenantId = tenantId;
    const currentApp = appointments.find(a => a.id === id);
    setAppointmentsState(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (!opTenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', opTenantId, 'appointments', id), { status });
      
      // Update occupied slot status
      const targetSlotId = currentApp?.slotId || (
        currentApp ? `${(currentApp.date || '').trim().replace(/\//g, '-')}_${(currentApp.time || '').trim().replace(':', '-')}_${(currentApp.professional || '').trim().toLowerCase().replace(/[^a-z0-9]/gi, '_')}` : null
      );
      if (targetSlotId) {
        const slotRef = doc(db, 'tenants', opTenantId, 'occupied_slots', targetSlotId);
        if (status === 'Cancelado' || status === 'cancelled') {
          await deleteDoc(slotRef).catch(() => {});
        } else {
          await setDoc(slotRef, { 
            slotId: targetSlotId,
            date: currentApp?.date,
            time: currentApp?.time,
            professional: currentApp?.professional,
            status: 'occupied', 
            appointmentId: id,
            updatedAt: new Date().toISOString() 
          }, { merge: true }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.error("Erro ao atualizar status do agendamento:", err);
      throw err;
    }
  }, [tenantId, appointments]);

  const updateAppointmentPayment = useCallback(async (id: string, method: string, status: string) => {
    const opTenantId = tenantId;
    setAppointmentsState(prev => prev.map(a => a.id === id ? { ...a, paymentMethod: method, paymentStatus: status } : a));
    if (!opTenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', opTenantId, 'appointments', id), { paymentMethod: method, paymentStatus: status });
    } catch (err: any) {
      console.error("Erro ao atualizar pagamento do agendamento:", err);
      throw err;
    }
  }, [tenantId]);

  const updateAppointmentProfessional = useCallback(async (id: string, professional: string) => {
    const opTenantId = tenantId;
    setAppointmentsState(prev => prev.map(a => a.id === id ? { ...a, professional } : a));
    if (!opTenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', opTenantId, 'appointments', id), { professional });
    } catch (err: any) {
      console.error("Erro ao atualizar profissional do agendamento:", err);
      throw err;
    }
  }, [tenantId]);

  const deleteAppointment = useCallback(async (id: string) => {
    const opTenantId = tenantId;
    const appToDelete = appointments.find(a => a.id === id);
    setAppointmentsState(prev => prev.filter(a => a.id !== id));
    if (!opTenantId) return;
    try {
      await deleteDoc(doc(db, 'tenants', opTenantId, 'appointments', id));
      const targetSlotId = appToDelete?.slotId || (
        appToDelete ? `${(appToDelete.date || '').trim().replace(/\//g, '-')}_${(appToDelete.time || '').trim().replace(':', '-')}_${(appToDelete.professional || '').trim().toLowerCase().replace(/[^a-z0-9]/gi, '_')}` : null
      );
      if (targetSlotId) {
        await deleteDoc(doc(db, 'tenants', opTenantId, 'occupied_slots', targetSlotId)).catch(() => {});
      }
    } catch (err: any) {
      console.error("Erro ao excluir agendamento:", err);
      throw err;
    }
  }, [tenantId, appointments]);

  // SERVICES CRUD (Atomic writeBatch)
  const setServices = useCallback(async (newServices: any[]) => {
    const opTenantId = tenantId;

    // Sanitize images to ensure every document stays well below Firestore 1MB limit (~30KB max)
    const sanitizedServices = await Promise.all(
      newServices.map(async (s) => ({
        ...s,
        image: await ensureLightweightServiceImage(s.image)
      }))
    );

    setServicesState(sanitizedServices);
    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);
      const currentServicesIds = services.map(s => s.id);
      const newServicesIds = sanitizedServices.map(s => s.id);
      const toDelete = currentServicesIds.filter(id => !newServicesIds.includes(id));

      for (const s of sanitizedServices) {
        const id = s.id || ('srv_' + Math.random().toString(36).substring(2, 9));
        const ref = doc(db, 'tenants', opTenantId, 'services', id);
        batch.set(ref, { ...s, id }, { merge: true });
      }

      for (const id of toDelete) {
        const ref = doc(db, 'tenants', opTenantId, 'services', id);
        batch.delete(ref);
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao sincronizar catálogo de serviços:", err);
      setError("Falha ao salvar serviços no Firestore.");
      throw err;
    }
  }, [tenantId, services]);

  const addService = useCallback(async (service: any) => {
    const opTenantId = tenantId;
    const id = service.id || ('srv_' + Math.random().toString(36).substring(2, 9));
    const sanitizedImage = await ensureLightweightServiceImage(service.image);
    const fullService = { ...service, image: sanitizedImage, id };
    setServicesState(prev => [...prev, fullService]);
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'services', id), fullService, { merge: true });
    } catch (err: any) {
      console.error("Erro ao adicionar serviço:", err);
      throw err;
    }
  }, [tenantId]);

  const updateService = useCallback(async (id: string, service: any) => {
    const opTenantId = tenantId;
    const idToUse = id || service.id;
    const sanitizedImage = await ensureLightweightServiceImage(service.image);
    const updatedService = { ...service, image: sanitizedImage, id: idToUse };
    setServicesState(prev => prev.map(s => s.id === idToUse ? { ...s, ...updatedService } : s));
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'services', idToUse), updatedService, { merge: true });
    } catch (err: any) {
      console.error("Erro ao atualizar serviço:", err);
      throw err;
    }
  }, [tenantId]);

  const deleteService = useCallback(async (id: string) => {
    const opTenantId = tenantId;
    setServicesState(prev => prev.filter(s => s.id !== id));
    if (!opTenantId) return;
    try {
      await deleteDoc(doc(db, 'tenants', opTenantId, 'services', id));
    } catch (err: any) {
      console.error("Erro ao excluir serviço:", err);
      throw err;
    }
  }, [tenantId]);

  // PROFESSIONALS CRUD (Atomic writeBatch)
  const setProfessionals = useCallback(async (newProfs: any[]) => {
    const opTenantId = tenantId;
    const targetPlan = DEFAULT_SAAS_PLANS.find(p => p.id === tenant?.planId) || DEFAULT_SAAS_PLANS[1];
    const maxAllowed = targetPlan?.maxBarbers || 5;
    if (!isSuperAdmin && newProfs.length > maxAllowed) {
      throw new Error(`Limite de profissionais atingido para o plano ${targetPlan.name} (máximo ${maxAllowed}). Faça upgrade para adicionar mais profissionais.`);
    }

    setProfessionalsState(newProfs);
    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);
      const currentIds = professionals.map(p => p.id);
      const newIds = newProfs.map(p => p.id);
      const toDelete = currentIds.filter(id => !newIds.includes(id));

      for (const p of newProfs) {
        const id = p.id || ('barber_' + Math.random().toString(36).substring(2, 9));
        const ref = doc(db, 'tenants', opTenantId, 'barbers', id);
        batch.set(ref, { ...p, id }, { merge: true });
      }

      for (const id of toDelete) {
        const ref = doc(db, 'tenants', opTenantId, 'barbers', id);
        batch.delete(ref);
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao sincronizar profissionais:", err);
      setError("Falha ao salvar profissionais no Firestore.");
      throw err;
    }
  }, [tenantId, professionals, tenant?.planId, isSuperAdmin]);

  const addProfessional = useCallback(async (prof: any) => {
    const opTenantId = tenantId;
    const targetPlan = DEFAULT_SAAS_PLANS.find(p => p.id === tenant?.planId) || DEFAULT_SAAS_PLANS[1];
    const maxAllowed = targetPlan?.maxBarbers || 5;
    if (!isSuperAdmin && professionals.length >= maxAllowed) {
      throw new Error(`Limite de profissionais atingido para o plano ${targetPlan.name} (máximo ${maxAllowed}). Faça upgrade para adicionar mais profissionais.`);
    }

    const id = prof.id || ('barber_' + Math.random().toString(36).substring(2, 9));
    const fullProf = { ...prof, id };
    setProfessionalsState(prev => [...prev, fullProf]);
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'barbers', id), fullProf, { merge: true });
    } catch (err: any) {
      console.error("Erro ao adicionar profissional:", err);
      throw err;
    }
  }, [tenantId, professionals, tenant?.planId, isSuperAdmin]);

  const updateProfessional = useCallback(async (id: string, prof: any) => {
    const opTenantId = tenantId;
    setProfessionalsState(prev => prev.map(p => p.id === id ? { ...p, ...prof, id } : p));
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'barbers', id), { ...prof, id }, { merge: true });
    } catch (err: any) {
      console.error("Erro ao atualizar profissional:", err);
      throw err;
    }
  }, [tenantId]);

  const deleteProfessional = useCallback(async (id: string) => {
    const opTenantId = tenantId;
    setProfessionalsState(prev => prev.filter(p => p.id !== id));
    if (!opTenantId) return;
    try {
      await deleteDoc(doc(db, 'tenants', opTenantId, 'barbers', id));
    } catch (err: any) {
      console.error("Erro ao excluir profissional:", err);
      throw err;
    }
  }, [tenantId]);

  // TIME SLOTS CRUD
  const setTimeSlots = useCallback(async (slots: string[]) => {
    const opTenantId = tenantId;
    setTimeSlotsState(slots);
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'settings', 'timeSlots'), { slots }, { merge: true });
    } catch (err: any) {
      console.error("Erro ao salvar horários de atendimento:", err);
      setError("Falha ao salvar horários no Firestore.");
      throw err;
    }
  }, [tenantId]);

  // TESTIMONIALS CRUD (Atomic writeBatch)
  const setTestimonials = useCallback(async (newTestimonials: any[]) => {
    const opTenantId = tenantId;
    setTestimonialsState(newTestimonials);
    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);
      const currentIds = testimonials.map(t => t.id);
      const newIds = newTestimonials.map(t => t.id).filter(Boolean);
      const toDelete = currentIds.filter(id => !newIds.includes(id));

      for (const t of newTestimonials) {
        const id = t.id || ('test_' + Math.random().toString(36).substring(2, 9));
        const ref = doc(db, 'tenants', opTenantId, 'testimonials', id);
        batch.set(ref, { ...t, id }, { merge: true });
      }

      for (const id of toDelete) {
        const ref = doc(db, 'tenants', opTenantId, 'testimonials', id);
        batch.delete(ref);
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao salvar depoimentos:", err);
      setError("Falha ao salvar depoimentos no Firestore.");
      throw err;
    }
  }, [tenantId, testimonials]);

  const addTestimonial = useCallback(async (test: any) => {
    const opTenantId = tenantId;
    const id = test.id || ('test_' + Math.random().toString(36).substring(2, 9));
    const full = { ...test, id };
    setTestimonialsState(prev => [...prev, full]);
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'testimonials', id), full, { merge: true });
    } catch (err: any) {
      console.error("Erro ao adicionar depoimento:", err);
      throw err;
    }
  }, [tenantId]);

  const updateTestimonial = useCallback(async (id: string, test: any) => {
    const opTenantId = tenantId;
    setTestimonialsState(prev => prev.map(t => t.id === id ? { ...t, ...test, id } : t));
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'testimonials', id), { ...test, id }, { merge: true });
    } catch (err: any) {
      console.error("Erro ao atualizar depoimento:", err);
      throw err;
    }
  }, [tenantId]);

  const deleteTestimonial = useCallback(async (id: string) => {
    const opTenantId = tenantId;
    setTestimonialsState(prev => prev.filter(t => t.id !== id));
    if (!opTenantId) return;
    try {
      await deleteDoc(doc(db, 'tenants', opTenantId, 'testimonials', id));
    } catch (err: any) {
      console.error("Erro ao excluir depoimento:", err);
      throw err;
    }
  }, [tenantId]);

  // DIFFERENTIALS CRUD (Atomic writeBatch)
  const setDifferentials = useCallback(async (newDiffs: any[]) => {
    const opTenantId = tenantId;
    setDifferentialsState(newDiffs);
    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);
      const currentIds = differentials.map(d => d.id).filter(Boolean);
      const newIds = newDiffs.map(d => d.id).filter(Boolean);
      const toDelete = currentIds.filter(id => !newIds.includes(id));

      for (const d of newDiffs) {
        const id = d.id || ('diff_' + Math.random().toString(36).substring(2, 9));
        let cleanImage = d.image;
        if (typeof cleanImage === 'string' && (cleanImage.startsWith('data:') || cleanImage.length > 30000)) {
          try {
            cleanImage = await compressImage(cleanImage, 600, 600, 0.75);
          } catch {}
        }
        let cleanVideoUrl = d.videoUrl;
        if (typeof cleanVideoUrl === 'string' && cleanVideoUrl.startsWith('data:video/') && cleanVideoUrl.length > 100000) {
          try {
            const vidId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const res = await fetch(cleanVideoUrl);
            const blob = await res.blob();
            cleanVideoUrl = await saveVideoBlobToIndexedDB(vidId, blob);
          } catch {}
        }
        const sanitized = cleanFirestoreData({ 
          ...d, 
          id, 
          ...(cleanImage !== undefined ? { image: cleanImage } : {}),
          ...(cleanVideoUrl !== undefined ? { videoUrl: cleanVideoUrl } : {})
        });
        const ref = doc(db, 'tenants', opTenantId, 'differentials', id);
        batch.set(ref, sanitized, { merge: true });
      }

      for (const id of toDelete) {
        const ref = doc(db, 'tenants', opTenantId, 'differentials', id);
        batch.delete(ref);
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao salvar diferenciais:", err);
      setError("Falha ao salvar diferenciais no Firestore.");
      throw err;
    }
  }, [tenantId, differentials]);

  const addDifferential = useCallback(async (diff: any) => {
    const opTenantId = tenantId;
    const id = diff.id || ('diff_' + Math.random().toString(36).substring(2, 9));
    const full = cleanFirestoreData({ ...diff, id });
    setDifferentialsState(prev => [...prev, full]);
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'differentials', id), full, { merge: true });
    } catch (err: any) {
      console.error("Erro ao adicionar diferencial:", err);
      throw err;
    }
  }, [tenantId]);

  const updateDifferential = useCallback(async (id: string, diff: any) => {
    const opTenantId = tenantId;
    const full = cleanFirestoreData({ ...diff, id });
    setDifferentialsState(prev => prev.map(d => d.id === id ? { ...d, ...full, id } : d));
    if (!opTenantId) return;
    try {
      await setDoc(doc(db, 'tenants', opTenantId, 'differentials', id), full, { merge: true });
    } catch (err: any) {
      console.error("Erro ao atualizar diferencial:", err);
      throw err;
    }
  }, [tenantId]);

  const deleteDifferential = useCallback(async (id: string) => {
    const opTenantId = tenantId;
    setDifferentialsState(prev => prev.filter(d => d.id !== id));
    if (!opTenantId) return;
    try {
      await deleteDoc(doc(db, 'tenants', opTenantId, 'differentials', id));
    } catch (err: any) {
      console.error("Erro ao excluir diferencial:", err);
      throw err;
    }
  }, [tenantId]);

  // ONBOARDING SEEDER FOR NEW TENANTS
  const seedDefaultData = useCallback(async (defaults: {
    services?: any[];
    professionals?: any[];
    differentials?: any[];
    testimonials?: any[];
    timeSlots?: string[];
    settings?: any;
  }) => {
    const opTenantId = tenantId;
    if (!opTenantId) return;

    try {
      const batch = writeBatch(db);

      if (defaults.settings) {
        const cleanedSettings = cleanFirestoreData(defaults.settings);
        batch.set(doc(db, 'tenants', opTenantId, 'settings', 'business'), cleanedSettings, { merge: true });
        batch.set(doc(db, 'tenants', opTenantId, 'settings', 'landing'), cleanedSettings, { merge: true });
      }

      if (defaults.timeSlots && defaults.timeSlots.length > 0) {
        batch.set(doc(db, 'tenants', opTenantId, 'settings', 'timeSlots'), { slots: defaults.timeSlots }, { merge: true });
      }

      if (defaults.services) {
        defaults.services.forEach(s => {
          const id = s.id || ('srv_' + Math.random().toString(36).substring(2, 9));
          batch.set(doc(db, 'tenants', opTenantId, 'services', id), cleanFirestoreData({ ...s, id }), { merge: true });
        });
      }

      if (defaults.professionals) {
        defaults.professionals.forEach(p => {
          const id = p.id || ('barber_' + Math.random().toString(36).substring(2, 9));
          batch.set(doc(db, 'tenants', opTenantId, 'barbers', id), cleanFirestoreData({ ...p, id }), { merge: true });
        });
      }

      if (defaults.differentials) {
        defaults.differentials.forEach(d => {
          const id = d.id || ('diff_' + Math.random().toString(36).substring(2, 9));
          batch.set(doc(db, 'tenants', opTenantId, 'differentials', id), cleanFirestoreData({ ...d, id }), { merge: true });
        });
      }

      if (defaults.testimonials) {
        defaults.testimonials.forEach(t => {
          const id = t.id || ('test_' + Math.random().toString(36).substring(2, 9));
          batch.set(doc(db, 'tenants', opTenantId, 'testimonials', id), cleanFirestoreData({ ...t, id }), { merge: true });
        });
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Erro ao popular dados iniciais do tenant:", err);
      setError("Falha ao inicializar dados padrão.");
      throw err;
    }
  }, [tenantId]);

  const memoizedSettings = useMemo(() => {
    if (!settings) return null;
    return { ...settings };
  }, [settings]);

  return {
    settings: memoizedSettings, updateSettings,
    logoUrl, setLogoUrl,
    appointments, addAppointment, updateAppointmentStatus, updateAppointmentPayment, updateAppointmentProfessional, deleteAppointment,
    services, setServices, addService, updateService, deleteService,
    professionals, setProfessionals, addProfessional, updateProfessional, deleteProfessional,
    timeSlots, setTimeSlots,
    testimonials, setTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    differentials, setDifferentials, addDifferential, updateDifferential, deleteDifferential,
    crmLeads,
    loading,
    isInitialLoaded,
    error,
    seedDefaultData
  };
}
