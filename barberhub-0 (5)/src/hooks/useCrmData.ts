import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { canMasterAccessSystem, canCustomerAccessSystem } from '../lib/authUtils';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  CrmLead,
  CrmClientProfile,
  CrmNotification,
  CrmStage,
  CrmInteractionLog,
} from '../types/crm';

interface UseCrmDataParams {
  tenantId: string | null;
  appointments: any[];
  services: any[];
  professionals: any[];
}

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

function parseBrazilianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    // Expected format: DD/MM/YYYY or YYYY-MM-DD
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date;
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date;
      }
    }
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
  }
  return null;
}

function parsePriceToNumber(priceStr?: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr)
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}



export function useCrmData({
  tenantId,
  appointments,
  services,
  professionals: _professionals,
}: UseCrmDataParams) {
  const { tenant, adminTenantMode } = useTenant();
  const { appUser, isSuperAdmin, isExpired } = useAuth();
  
  const isMaintenance = adminTenantMode === 'system_maintenance';
  const isEditorOrPreview = adminTenantMode === 'landing_editor' || adminTenantMode === 'landing_preview';
  
  let canLoadPrivateTenantData = false;
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
  const [firestoreLeads, setFirestoreLeads] = useState<CrmLead[]>([]);
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);
  const [deletedPhones, setDeletedPhones] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Real-time listener for deletedClients
  useEffect(() => {
    if (!tenantId || !canLoadPrivateTenantData) {
      setDeletedPhones(new Map());
      return;
    }

    const delRef = collection(db, 'tenants', tenantId, 'deletedClients');
    const unsubscribe = onSnapshot(
      delRef,
      (snapshot) => {
        const map = new Map<string, string>();
        snapshot.forEach((d) => {
          const data = d.data();
          map.set(d.id, data.deletedAt || new Date().toISOString());
        });
        setDeletedPhones(map);
      },
      (error) => {
        console.warn('Error listening to deletedClients:', error);
      }
    );

    return () => unsubscribe();
  }, [tenantId, canLoadPrivateTenantData]);

  // Real-time listener for CRM Leads
  useEffect(() => {
    if (!tenantId || !canLoadPrivateTenantData) {
      setFirestoreLeads([]);
      setLoading(false);
      return;
    }

    const leadsRef = collection(db, 'tenants', tenantId, 'crm_leads');
    const unsubscribe = onSnapshot(
      leadsRef,
      (snapshot) => {
        const leads: CrmLead[] = [];
        snapshot.forEach((d) => {
          leads.push({ id: d.id, ...(d.data() as Omit<CrmLead, 'id'>) });
        });
        setFirestoreLeads(leads);
        setLoading(false);
      },
      (error) => {
        console.warn('Error listening to crm_leads:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenantId, canLoadPrivateTenantData]);

  // Real-time listener for Notifications
  useEffect(() => {
    if (!tenantId || !canLoadPrivateTenantData) {
      setNotifications([]);
      return;
    }

    const notifRef = collection(db, 'tenants', tenantId, 'notifications');
    const unsubscribe = onSnapshot(
      notifRef,
      (snapshot) => {
        const list: CrmNotification[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<CrmNotification, 'id'>) });
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setNotifications(list);
      },
      (error) => {
        console.warn('Error listening to notifications:', error);
      }
    );

    return () => unsubscribe();
  }, [tenantId, canLoadPrivateTenantData]);

  // Build Unified Client Profiles (combining Appointments + Firestore Leads)
  const clientProfiles = useMemo<CrmClientProfile[]>(() => {
    const profileMap = new Map<string, CrmClientProfile>();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Ingest existing Firestore leads
    firestoreLeads.forEach((lead) => {
      const key = normalizePhone(lead.phone) || `lead_${lead.id}`;
      profileMap.set(key, {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        leadData: lead,
        stage: lead.stage || 'novo_lead',
        origin: lead.origin || 'Balcão',
        responsible: lead.responsible || 'Geral',
        tags: lead.tags || [],
        notes: lead.notes || '',
        planName: lead.planName || (lead as any).subscribedPlan || '',
        potentialValue: lead.potentialValue || 0,
        firstContactDate: lead.firstContactDate,
        lastContactDate: lead.lastContactDate,
        nextContactDate: lead.nextContactDate,
        appointments: [],
        totalAppointments: 0,
        confirmedAppointments: 0,
        cancelledAppointments: 0,
        totalSpent: 0,
        firstAppointmentDate: null,
        lastAppointmentDate: null,
        daysSinceLastAppointment: null,
        isInactive30Days: false,
        isNewClient: false,
        isRecurringClient: false,
        hasNoAppointments: true,
        interactionHistory: lead.interactionHistory || [],
      });
    });

    // 2. Aggregate all appointments
    appointments.forEach((app) => {
      if (!app.client) return;
      const cleanPhone = normalizePhone(app.phone);
      const key = cleanPhone || `name_${app.client.trim().toLowerCase()}`;

      let profile = profileMap.get(key);
      if (!profile) {
        profile = {
          id: cleanPhone ? `client_${cleanPhone}` : `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: app.client.trim(),
          phone: app.phone ? app.phone.trim() : '',
          email: '',
          stage: 'cliente_ativo',
          origin: 'Site',
          responsible: app.professional || 'Geral',
          tags: [],
          notes: '',
          planName: (app as any).planName || (app as any).subscribedPlan || '',
          potentialValue: 0,
          appointments: [],
          totalAppointments: 0,
          confirmedAppointments: 0,
          cancelledAppointments: 0,
          totalSpent: 0,
          firstAppointmentDate: null,
          lastAppointmentDate: null,
          daysSinceLastAppointment: null,
          isInactive30Days: false,
          isNewClient: false,
          isRecurringClient: false,
          hasNoAppointments: false,
          interactionHistory: [],
        };
        profileMap.set(key, profile);
      }

      profile.appointments.push(app);
    });

    // 3. Compute metrics for each client profile
    const profiles = Array.from(profileMap.values()).map((profile) => {
      const apps = profile.appointments;
      profile.totalAppointments = apps.length;
      profile.hasNoAppointments = apps.length === 0;

      if (apps.length > 0) {
        let confirmed = 0;
        let cancelled = 0;
        let spent = 0;

        // Sort appointments by date
        const sortedApps = [...apps].sort((a, b) => {
          const dateA = parseBrazilianDate(a.date)?.getTime() || 0;
          const dateB = parseBrazilianDate(b.date)?.getTime() || 0;
          return dateA - dateB;
        });

        sortedApps.forEach((app) => {
          if (app.status === 'Confirmado') confirmed++;
          if (app.status === 'Cancelado') cancelled++;

          if (app.status !== 'Cancelado') {
            const appPrice = (app as any).price ?? (app as any).totalPrice ?? (app as any).servicePrice;
            if (appPrice !== undefined && appPrice !== null && String(appPrice).trim() !== '') {
              spent += parsePriceToNumber(appPrice);
            } else {
              const srv = services.find((s) => s.name === app.service || s.id === app.service);
              spent += parsePriceToNumber(srv?.price || '0');
            }
          }
        });

        profile.confirmedAppointments = confirmed;
        profile.cancelledAppointments = cancelled;
        profile.totalSpent = spent;

        // First & Last appointments
        const validDates = sortedApps
          .map((a) => ({ dateStr: a.date, parsed: parseBrazilianDate(a.date) }))
          .filter((d) => d.parsed !== null);

        if (validDates.length > 0) {
          profile.firstAppointmentDate = validDates[0].dateStr;
          const last = validDates[validDates.length - 1];
          profile.lastAppointmentDate = last.dateStr;

          if (last.parsed) {
            const diffTime = now.getTime() - last.parsed.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            profile.daysSinceLastAppointment = diffDays;
            if (diffDays >= 30) {
              profile.isInactive30Days = true;
            }
          }
        }

        profile.isNewClient = confirmed === 1;
        profile.isRecurringClient = confirmed >= 2;

        // Auto Stage determination if not explicitly overridden in leadData
        if (!profile.leadData?.stage) {
          if (profile.isInactive30Days) {
            profile.stage = 'inativo';
          } else if (profile.isRecurringClient) {
            profile.stage = 'cliente_recorrente';
          } else if (confirmed > 0) {
            profile.stage = 'cliente_ativo';
          } else {
            profile.stage = 'agendamento_pendente';
          }
        }
      }

      return profile;
    });

    // Filter out deleted clients unless they have a newer appointment
    const visibleProfiles = profiles.filter((profile) => {
      const cleanPhone = normalizePhone(profile.phone);
      if (!cleanPhone || !deletedPhones.has(cleanPhone)) return true;
      const deletedAtStr = deletedPhones.get(cleanPhone)!;
      const deletedAtTime = new Date(deletedAtStr).getTime();

      // Check if there is an appointment with date / createdAt newer than deletedAtTime
      const hasNewerApp = profile.appointments.some((app) => {
        const parsed = parseBrazilianDate(app.date);
        const appTime = app.createdAt ? new Date(app.createdAt).getTime() : (parsed ? parsed.getTime() : 0);
        return appTime > deletedAtTime;
      });

      if (hasNewerApp) {
        // Auto remove deletedClients marker so the client reactivates
        if (tenantId) {
          deleteDoc(doc(db, 'tenants', tenantId, 'deletedClients', cleanPhone)).catch(() => {});
        }
        return true;
      }

      return false;
    });

    // Sort: Inactive & recent contacts first, then by total spent
    return visibleProfiles.sort((a, b) => {
      if (a.isInactive30Days && !b.isInactive30Days) return -1;
      if (!a.isInactive30Days && b.isInactive30Days) return 1;
      return b.totalSpent - a.totalSpent;
    });
  }, [firestoreLeads, appointments, services, deletedPhones, tenantId]);

  // Synchronize Inactive Client Notifications (30+ days without appointments)
  useEffect(() => {
    if (!tenantId || loading || clientProfiles.length === 0) return;

    const syncNotifications = async () => {
      try {
        const inactiveClients = clientProfiles.filter((p) => p.isInactive30Days && p.phone);

        for (const client of inactiveClients) {
          const notifId = `inactive_30d_${normalizePhone(client.phone)}`;
          const existing = notifications.find((n) => n.id === notifId);

          if (!existing) {
            // Create notification doc
            const notifDocRef = doc(db, 'tenants', tenantId, 'notifications', notifId);
            await setDoc(notifDocRef, {
              clientId: client.id,
              clientName: client.name,
              phone: client.phone,
              daysInactive: client.daysSinceLastAppointment || 30,
              lastAppointmentDate: client.lastAppointmentDate || '',
              status: 'created',
              createdAt: new Date().toISOString(),
            }, { merge: true });
          } else if (existing.status === 'created' || existing.status === 'viewed') {
            // Check if client is still inactive or days changed
            if (client.daysSinceLastAppointment && client.daysSinceLastAppointment !== existing.daysInactive) {
              const notifDocRef = doc(db, 'tenants', tenantId, 'notifications', notifId);
              await updateDoc(notifDocRef, {
                daysInactive: client.daysSinceLastAppointment,
              });
            }
          }
        }

        // Auto-resolve notifications for clients who booked a new appointment (< 30 days)
        const activeClients = clientProfiles.filter((p) => !p.isInactive30Days && p.phone);
        for (const client of activeClients) {
          const notifId = `inactive_30d_${normalizePhone(client.phone)}`;
          const existing = notifications.find((n) => n.id === notifId && n.status !== 'resolved');
          if (existing) {
            const notifDocRef = doc(db, 'tenants', tenantId, 'notifications', notifId);
            await updateDoc(notifDocRef, {
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('Error syncing notifications in Firestore:', err);
      }
    };

    const timeout = setTimeout(() => {
      syncNotifications();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [tenantId, loading, clientProfiles, notifications]);

  // CRUD: Save or Update Lead
  const saveLead = useCallback(
    async (leadInput: Partial<CrmLead> & { name: string; phone: string }) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) {
        return;
      }
      const cleanPhone = normalizePhone(leadInput.phone);
      const leadId = leadInput.id || `lead_${cleanPhone || Date.now()}`;
      const docRef = doc(db, 'tenants', opTenantId, 'crm_leads', leadId);

      const payload: Partial<CrmLead> = {
        name: leadInput.name.trim(),
        phone: leadInput.phone.trim(),
        stage: leadInput.stage || 'novo_lead',
        origin: leadInput.origin || 'Balcão',
        responsible: leadInput.responsible || 'Geral',
        tags: leadInput.tags || [],
        notes: leadInput.notes || '',
        potentialValue: leadInput.potentialValue || 0,
        updatedAt: new Date().toISOString(),
      };

      if (leadInput.email) payload.email = leadInput.email.trim();
      if (leadInput.planName !== undefined) payload.planName = leadInput.planName ? leadInput.planName.trim() : '';
      if (leadInput.firstContactDate) payload.firstContactDate = leadInput.firstContactDate;
      if (leadInput.lastContactDate) payload.lastContactDate = leadInput.lastContactDate;
      if (leadInput.nextContactDate) payload.nextContactDate = leadInput.nextContactDate;
      if (!leadInput.createdAt) payload.createdAt = new Date().toISOString();

      await setDoc(docRef, payload, { merge: true });
    },
    [tenantId, canLoadPrivateTenantData]
  );

  // Update Lead Stage
  const updateLeadStage = useCallback(
    async (leadId: string, stage: CrmStage, logChange: boolean = true) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const docRef = doc(db, 'tenants', opTenantId, 'crm_leads', leadId);

      const existingLead = firestoreLeads.find((l) => l.id === leadId);
      const history = existingLead?.interactionHistory || [];

      if (logChange) {
        const newLog: CrmInteractionLog = {
          id: `log_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'status_change',
          description: `Fase alterada para: ${stage}`,
        };
        history.unshift(newLog);
      }

      await setDoc(
        docRef,
        {
          stage,
          interactionHistory: history,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },
    [tenantId, canLoadPrivateTenantData, firestoreLeads]
  );

  // Add Contact Log / Interaction
  const addContactLog = useCallback(
    async (leadId: string, log: Omit<CrmInteractionLog, 'id' | 'date'>) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const docRef = doc(db, 'tenants', opTenantId, 'crm_leads', leadId);
      const existingLead = firestoreLeads.find((l) => l.id === leadId);
      const history = existingLead?.interactionHistory || [];

      const newLog: CrmInteractionLog = {
        id: `log_${Date.now()}`,
        date: new Date().toISOString(),
        type: log.type,
        description: log.description,
        author: log.author || 'Admin',
      };

      history.unshift(newLog);

      await setDoc(
        docRef,
        {
          interactionHistory: history,
          lastContactDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },
    [tenantId, canLoadPrivateTenantData, firestoreLeads]
  );

  // Delete Lead
  const deleteLead = useCallback(
    async (leadId: string) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const docRef = doc(db, 'tenants', opTenantId, 'crm_leads', leadId);
      await deleteDoc(docRef);
    },
    [tenantId, canLoadPrivateTenantData]
  );

  // Delete Client Profile (Persistent view exclusion without deleting history)
  const deleteClientProfile = useCallback(
    async (phone: string, leadId?: string) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone) {
        throw new Error('Telefone do cliente é obrigatório para exclusão.');
      }
      const now = new Date().toISOString();

      // 1. Register persistent exclusion marker in tenants/{tenantId}/deletedClients/{normalizedPhone}
      const delDocRef = doc(db, 'tenants', opTenantId, 'deletedClients', cleanPhone);
      await setDoc(delDocRef, {
        phone: cleanPhone,
        deletedAt: now,
      });

      // 2. Remove matching lead if exists
      if (leadId) {
        try {
          await deleteDoc(doc(db, 'tenants', opTenantId, 'crm_leads', leadId));
        } catch (err) {
          console.warn('Erro ao remover lead na exclusão:', err);
        }
      } else {
        const matchingLead = firestoreLeads.find((l) => normalizePhone(l.phone) === cleanPhone);
        if (matchingLead) {
          try {
            await deleteDoc(doc(db, 'tenants', opTenantId, 'crm_leads', matchingLead.id));
          } catch (err) {
            console.warn('Erro ao remover lead correspondente:', err);
          }
        }
      }

      // 3. Clear any active notifications for this phone
      const notifId = `inactive_30d_${cleanPhone}`;
      try {
        await deleteDoc(doc(db, 'tenants', opTenantId, 'notifications', notifId));
      } catch {}
    },
    [tenantId, canLoadPrivateTenantData, firestoreLeads]
  );

  // Notification actions
  const markNotificationViewed = useCallback(
    async (notifId: string) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const notifRef = doc(db, 'tenants', opTenantId, 'notifications', notifId);
      await updateDoc(notifRef, { status: 'viewed' });
    },
    [tenantId, canLoadPrivateTenantData]
  );

  const markNotificationResolved = useCallback(
    async (notifId: string) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const notifRef = doc(db, 'tenants', opTenantId, 'notifications', notifId);
      await updateDoc(notifRef, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      });
    },
    [tenantId, canLoadPrivateTenantData]
  );

  const dismissNotification = useCallback(
    async (notifId: string) => {
      const opTenantId = tenantId;
      if (!opTenantId || !canLoadPrivateTenantData) return;
      const notifRef = doc(db, 'tenants', opTenantId, 'notifications', notifId);
      await deleteDoc(notifRef);
    },
    [tenantId, canLoadPrivateTenantData]
  );

  // Unread / Unresolved notification counter
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => n.status === 'created').length;
  }, [notifications]);

  // Overall CRM Stats
  const crmStats = useMemo(() => {
    const totalLeads = clientProfiles.length;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newLeadsCount = clientProfiles.filter((p) => {
      if (p.firstContactDate && new Date(p.firstContactDate) >= sevenDaysAgo) return true;
      if (p.leadData?.createdAt && new Date(p.leadData.createdAt) >= sevenDaysAgo) return true;
      if (p.firstAppointmentDate) {
        const parsed = parseBrazilianDate(p.firstAppointmentDate);
        if (parsed && parsed >= sevenDaysAgo) return true;
      }
      return p.stage === 'novo_lead' || p.stage === 'primeiro_contato';
    }).length;

    const noAppointmentsCount = clientProfiles.filter((p) => p.hasNoAppointments).length;
    const inactive30DaysCount = clientProfiles.filter((p) => p.isInactive30Days).length;
    const recoveryCount = clientProfiles.filter((p) => p.stage === 'recuperacao' || p.stage === 'inativo').length;

    // Future appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureAppointmentsCount = appointments.filter((app) => {
      if (app.status === 'Cancelado') return false;
      const parsed = parseBrazilianDate(app.date);
      return parsed && parsed >= today;
    }).length;

    return {
      totalLeads,
      newLeadsCount,
      noAppointmentsCount,
      inactive30DaysCount,
      recoveryCount,
      futureAppointmentsCount,
    };
  }, [clientProfiles, appointments]);

  return {
    loading,
    leads: firestoreLeads,
    clientProfiles,
    notifications,
    unreadNotificationCount,
    crmStats,
    saveLead,
    updateLeadStage,
    addContactLog,
    deleteLead,
    deleteClientProfile,
    markNotificationViewed,
    markNotificationResolved,
    dismissNotification,
  };
}
