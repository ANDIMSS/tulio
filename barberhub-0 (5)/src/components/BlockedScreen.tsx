import React from 'react';
import { ShieldAlert, Clock, MessageCircle, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_SETTINGS } from '../App';

export const BlockedScreen: React.FC = () => {
  const { user, appUser, isExpired, signOutUser } = useAuth();

  const isLicenseExpired = isExpired || (appUser?.licenseExpiresAt && new Date() > new Date(appUser.licenseExpiresAt));

  const formatExpiresDate = (isoString?: string | null) => {
    if (!isoString) return 'Não definida';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formattedExpiration = formatExpiresDate(appUser?.licenseExpiresAt);

  const whatsappMessage = encodeURIComponent(
    isLicenseExpired
      ? `Olá! Minha licença de acesso à Barbearia Elite expirou (${appUser?.email || user?.email}). Gostaria de renovar meu plano de acesso.`
      : `Olá! Realizei meu cadastro no sistema da Barbearia Elite (${appUser?.email || user?.email}) e gostaria de solicitar a ativação da minha licença de acesso.`
  );

  const whatsappUrl = `https://wa.me/${DEFAULT_SETTINGS.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden grain-bg">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="vintage-card p-6 sm:p-8 rounded-xl border border-[#2a2a2a] shadow-2xl backdrop-blur-md">
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl ${
              isLicenseExpired
                ? 'bg-amber-950/60 border border-amber-600/40 text-amber-400'
                : 'bg-red-950/60 border border-red-600/40 text-red-400'
            }`}>
              {isLicenseExpired ? (
                <Clock className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-3 bg-[#141414] border-[#2a2a2a]">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isLicenseExpired ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              <span className={isLicenseExpired ? 'text-amber-300' : 'text-red-300'}>
                {isLicenseExpired ? 'Licença Expirada' : 'Acesso em Análise'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {isLicenseExpired ? 'Sua licença expirou' : 'Aguardando Liberação'}
            </h1>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              {isLicenseExpired
                ? 'O período contratado da sua licença chegou ao fim. Para continuar utilizando todos os recursos da Barbearia Elite, entre em contato com nosso suporte.'
                : 'Seu cadastro foi realizado com sucesso e está na fila de aprovação da administração. O acesso é liberado mediante licença ativa.'}
            </p>
          </div>

          {/* User Profile Summary Box */}
          <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuário'}
                  className="w-11 h-11 rounded-full object-cover border border-[#c9a961]/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#c9a961] font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">
                  {appUser?.displayName || user?.displayName || 'Usuário'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {appUser?.email || user?.email}
                </div>
              </div>
            </div>

            {isLicenseExpired && appUser?.licenseExpiresAt && (
              <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between text-xs">
                <span className="text-gray-400">Data de expiração:</span>
                <span className="text-amber-400 font-medium">{formattedExpiration}</span>
              </div>
            )}
          </div>

          {/* Real-time sync badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#c9a961]/10 border border-[#c9a961]/25 text-xs text-[#dfc089] mb-6 leading-relaxed">
            <Sparkles className="w-4 h-4 shrink-0 text-[#c9a961]" />
            <span>
              <strong>Sincronização em tempo real ativa:</strong> assim que o administrador ativar sua conta, esta tela será liberada automaticamente.
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              id="whatsapp-support-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Falar no WhatsApp para Liberar Licença</span>
            </a>

            <button
              type="button"
              id="signout-blocked-btn"
              onClick={signOutUser}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-gray-300 hover:text-white font-medium text-xs border border-[#2a2a2a] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta / Alternar usuário</span>
            </button>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
          <p>Suporte oficial: {DEFAULT_SETTINGS.phoneDisplay}</p>
          <p className="text-[11px] text-gray-600">ID de segurança: {user?.uid}</p>
        </div>
      </div>
    </div>
  );
};
