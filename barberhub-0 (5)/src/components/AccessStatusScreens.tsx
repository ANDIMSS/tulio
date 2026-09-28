import React from 'react';

export const PendingUserScreen: React.FC<any> = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
    <div className="max-w-md text-center">
      <h2 className="text-2xl font-bold text-amber-400 mb-2">Acesso Pendente</h2>
      <p className="text-slate-400">Sua conta está em análise de aprovação.</p>
    </div>
  </div>
);

export const BlockedUserScreen: React.FC<any> = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
    <div className="max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-2">Acesso Suspenso</h2>
      <p className="text-slate-400">Entre em contato com o suporte para reativar seu acesso.</p>
    </div>
  </div>
);
