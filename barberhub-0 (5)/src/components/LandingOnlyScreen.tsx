import React from 'react';

export const LandingOnlyScreen: React.FC<any> = ({ children }) => {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
};
