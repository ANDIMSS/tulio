import React from 'react';

export const AdminPanel: React.FC<any> = (props) => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <h2 className="text-xl font-bold text-amber-400 mb-4">Painel Administrativo</h2>
      <p className="text-slate-400">Gerenciamento completo da barbearia ativado.</p>
    </div>
  );
};
