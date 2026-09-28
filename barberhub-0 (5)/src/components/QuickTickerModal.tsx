import React from 'react';

export const QuickTickerModal: React.FC<any> = ({ isOpen, onClose, onSave, currentTicker }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full">
        <h3 className="text-lg font-bold text-white mb-4">Editar Ticker da Faixa</h3>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
