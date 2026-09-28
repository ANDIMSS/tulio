import React from 'react';

export const CrmSummarySection: React.FC<any> = () => {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
      <h4 className="font-medium text-amber-400">Resumo CRM & Fidelização</h4>
      <p className="text-sm text-slate-400 mt-1">124 clientes ativos esta semana.</p>
    </div>
  );
};
