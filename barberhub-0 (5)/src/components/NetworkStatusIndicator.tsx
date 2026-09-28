import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-[fadeUp_0.3s_ease-out]">
      {!isOnline ? (
        <div className="bg-amber-950/95 border border-amber-600/70 text-amber-200 p-3.5 rounded-sm shadow-2xl flex items-center justify-between gap-3 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-amber-300">Sem conexão com a internet</p>
              <p className="text-[11px] text-amber-400/80">Algumas ações exigirão conexão para sincronizar.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-amber-500/20 text-amber-300 rounded-sm transition-colors cursor-pointer shrink-0"
            title="Tentar reconectar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/95 border border-emerald-600/70 text-emerald-200 p-3 rounded-sm shadow-2xl flex items-center gap-2.5 text-xs backdrop-blur-md animate-[fadeUp_0.3s_ease-out]">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Wifi className="w-3.5 h-3.5" />
          </div>
          <p className="font-semibold text-emerald-300">Conexão restabelecida com sucesso.</p>
        </div>
      )}
    </div>
  );
};
