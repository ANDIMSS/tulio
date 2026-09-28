import React from 'react';

interface SplitHeroTitleProps {
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  className?: string;
}

export const SplitHeroTitle: React.FC<SplitHeroTitleProps> = ({
  titlePrefix = 'SEU ESTILO,',
  titleHighlight = 'SUA IDENTIDADE',
  titleSuffix = '',
  className = ''
}) => {
  return (
    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white ${className}`}>
      <span>{titlePrefix} </span>
      {titleHighlight && (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200">
          {titleHighlight}
        </span>
      )}
      {titleSuffix && <span> {titleSuffix}</span>}
    </h1>
  );
};
