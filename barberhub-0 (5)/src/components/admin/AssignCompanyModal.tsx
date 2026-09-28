import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Search,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Tenant, TenantRole } from '../../types/tenant';
import { AppUser } from '../../types/auth';
import { approveUserAndAssignTenant, transferUserToTenant } from '../../lib/tenantUtils';

interface AssignCompanyModalProps {
  isOpen: boolean;
  user: AppUser | null;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export const AssignCompanyModal: React.FC<AssignCompanyModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<TenantRole>('owner');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setError(null);
    setSelectedTenantId(user.tenantId || '');

    const fetchTenants = async () => {
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        const list: Tenant[] = [];
        snap.forEach((d) => list.push(d.data() as Tenant));
        setTenants(list);
      } catch (err: any) {
        console.error('Erro ao buscar empresas:', err);
        setError('Não foi possível carregar a lista de empresas.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const filteredTenants = tenants.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.tradeName && t.tradeName.toLowerCase().includes(term)) ||
      (t.slug && t.slug.toLowerCase().includes(term)) ||
      (t.ownerEmail && t.ownerEmail.toLowerCase().includes(term))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setError('Por favor, selecione uma empresa.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const targetTenant = tenants.find((t) => t.id === selectedTenantId);

      // Check if user is already linked to another tenant
      if (user.tenantId && user.tenantId !== selectedTenantId) {
        const confirmTransfer = window.confirm(
          `O usuário ${user.displayName || user.email} já está vinculado a outra empresa. Deseja realizar a transferência para "${targetTenant?.name || selectedTenantId}"?`
        );
        if (!confirmTransfer) {
          setSaving(false);
          return;
        }

        const res = await transferUserToTenant(user.uid, selectedTenantId, selectedRole);
        if (!res.success) {
          throw new Error(res.message);
        }
        onShowToast(res.message);
      } else {
        await approveUserAndAssignTenant(user.uid, selectedTenantId, selectedRole);
        onShowToast(`Usuário ${user.displayName || user.email} vinculado com sucesso à empresa!`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao vincular empresa:', err);
      setError(err.message || 'Falha ao vincular empresa ao usuário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Vincular Empresa ao Usuário
              </h2>
              <p className="text-xs text-gray-400">
                Usuário: <span className="text-gold font-medium">{user.displayName || user.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Function Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Função no Tenant (RBAC)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as TenantRole)}
              className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-gold cursor-pointer"
            >
              <option value="owner">Proprietário (Owner)</option>
              <option value="manager">Gerente (Manager)</option>
              <option value="barber">Barbeiro / Profissional</option>
            </select>
          </div>

          {/* Search Tenant */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Selecione a Empresa (Tenant)
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, slug ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-gold"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 border border-white/10 rounded-lg p-2 bg-[#0E0E10] custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Carregando empresas...</span>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  Nenhuma empresa encontrada.
                </div>
              ) : (
                filteredTenants.map((t) => {
                  const isSelected = selectedTenantId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTenantId(t.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-gold/15 border-gold text-white font-medium'
                          : 'bg-[#16161A] border-white/5 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{t.tradeName || t.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({t.slug})</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Proprietário: {t.ownerEmail || 'Não definido'}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !selectedTenantId}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gold hover:bg-gold/90 text-black font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Confirmar Vínculo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
