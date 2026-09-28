import React, { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Tenant, TenantAccessMode, TenantStatus } from '../../types/tenant';

interface ConfigAccessModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ConfigAccessModal: React.FC<ConfigAccessModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [accessMode, setAccessMode] = useState<TenantAccessMode>(tenant.accessMode || 'full');
  const [status, setStatus] = useState<TenantStatus>(tenant.status || 'active');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalAccessMode = accessMode;
      if (status === 'suspended' || status === 'cancelled') {
        // Keep the accessMode as is, so if activated later it restores. 
        // Or if explicitly blocked:
        if (finalAccessMode !== 'blocked' && status === 'cancelled') {
          finalAccessMode = 'blocked';
        }
      }

      await updateDoc(doc(db, 'tenants', tenant.id), {
        accessMode: finalAccessMode,
        status,
        updatedAt: new Date().toISOString()
      });

      try {
        await setDoc(doc(db, 'publicTenants', tenant.id), {
          id: tenant.id,
          name: tenant.name || '',
          tradeName: tenant.tradeName || tenant.name || '',
          slug: tenant.slug || tenant.id,
          status,
          accessMode: finalAccessMode,
          customDomain: tenant.customDomain || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (pubErr) {
        console.warn('Erro ao atualizar publicTenants:', pubErr);
      }

      onShowToast('Acesso configurado com sucesso!');
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowToast('Erro ao salvar configuração: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Configuração de Acesso</h2>
            <p className="text-sm text-gray-400 mt-1">{tenant.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
          
          {/* Tipo de Acesso do Cliente */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider text-xs">
              Tipo de Acesso do Cliente
            </label>
            
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accessMode === 'full' ? 'bg-gold/10 border-gold/50' : 'bg-[#16161a] border-white/5 hover:border-white/20'}`}>
              <div className="pt-1">
                <input type="radio" name="accessMode" value="full" checked={accessMode === 'full'} onChange={() => setAccessMode('full')} className="accent-gold w-4 h-4" />
              </div>
              <div>
                <div className={`font-semibold ${accessMode === 'full' ? 'text-gold' : 'text-gray-300'}`}>Sistema + Landing</div>
                <div className="text-xs text-gray-500 mt-1">Acesso completo ao sistema operacional e site pelo cliente.</div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accessMode === 'landing_only' ? 'bg-gold/10 border-gold/50' : 'bg-[#16161a] border-white/5 hover:border-white/20'}`}>
              <div className="pt-1">
                <input type="radio" name="accessMode" value="landing_only" checked={accessMode === 'landing_only'} onChange={() => setAccessMode('landing_only')} className="accent-gold w-4 h-4" />
              </div>
              <div>
                <div className={`font-semibold ${accessMode === 'landing_only' ? 'text-gold' : 'text-gray-300'}`}>Somente Landing Page</div>
                <div className="text-xs text-gray-500 mt-1">Acesso exclusivo ao editor de site. Bloqueia o uso do sistema operacional pelo cliente.</div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accessMode === 'blocked' ? 'bg-rose-500/10 border-rose-500/50' : 'bg-[#16161a] border-white/5 hover:border-white/20'}`}>
              <div className="pt-1">
                <input type="radio" name="accessMode" value="blocked" checked={accessMode === 'blocked'} onChange={() => setAccessMode('blocked')} className="accent-rose-500 w-4 h-4" />
              </div>
              <div>
                <div className={`font-semibold ${accessMode === 'blocked' ? 'text-rose-400' : 'text-gray-300'}`}>Bloqueado</div>
                <div className="text-xs text-gray-500 mt-1">Bloqueia completamente o acesso do cliente ao sistema.</div>
              </div>
            </label>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider text-xs">Status da Empresa</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TenantStatus)}
              className="w-full px-4 py-2.5 bg-[#16161a] border border-white/10 rounded-xl text-white focus:border-gold outline-none"
            >
              <option value="active">Ativo (Permite acesso)</option>
              <option value="pending">Pendente (Aguardando)</option>
              <option value="suspended">Suspenso (Bloqueado por inadimplência/outros)</option>
              <option value="expired">Expirado (Licença vencida)</option>
              <option value="cancelled">Cancelado (Distrato)</option>
            </select>
          </div>

          {/* Master Access Notice (Somente Informativo) */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-gray-300 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span>Administrador Master:</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Acesso total a esta empresa para manutenção e suporte. O Master possui privilégio irrestrito de auditoria independente do modo de acesso do cliente.
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#16161a] shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-gray-400 font-medium hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-gold text-black font-bold flex items-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
