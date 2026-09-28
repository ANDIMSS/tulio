import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC<any> = () => {
  return (
    <button className="relative p-2 text-slate-400 hover:text-amber-400 transition-colors">
      <Bell className="w-5 h-5" />
    </button>
  );
};
