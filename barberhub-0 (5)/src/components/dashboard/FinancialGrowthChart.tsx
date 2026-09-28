import React from 'react';

export const FinancialGrowthChart: React.FC<any> = () => {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
      <h4 className="font-medium text-amber-400 mb-2">Crescimento Financeiro</h4>
      <div className="h-32 flex items-end gap-2 pt-4">
        <div className="bg-amber-500/40 w-1/5 h-1/2 rounded-t"></div>
        <div className="bg-amber-500/60 w-1/5 h-2/3 rounded-t"></div>
        <div className="bg-amber-500/80 w-1/5 h-3/4 rounded-t"></div>
        <div className="bg-amber-500 w-1/5 h-full rounded-t"></div>
      </div>
    </div>
  );
};
