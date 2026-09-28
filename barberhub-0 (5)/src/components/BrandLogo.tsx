import React, { useState } from 'react';
import { Scissors } from 'lucide-react';

export interface BrandLogoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  showTextFallback?: boolean;
  name?: string;
  tagline?: string;
  size?: 'sm' | 'md' | 'lg' | 'custom';
}

/**
 * Universal BrandLogo component:
 * - Guarantees 100% transparent rendering without artificial background colors, overlays, or pseudo-elements.
 * - Supports PNG, SVG, WebP, and JPG preserving original alpha channels.
 * - Handles loading errors gracefully by falling back to the standard brand icon and typography.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt = 'Logo da Barbearia',
  className = '',
  containerClassName = '',
  fallbackIcon,
  showTextFallback = true,
  name,
  tagline,
  size = 'md',
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const cleanSrc = (src && typeof src === 'string' && src.trim().length > 0) ? src.trim() : null;

  const defaultImgSizes = {
    sm: 'h-9 sm:h-10 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-[54px] sm:h-[66px] w-auto',
    custom: '',
  };

  const imgClass = className || defaultImgSizes[size] || 'h-10 w-auto';

  if (cleanSrc && !loadFailed) {
    return (
      <div className={`inline-flex items-center justify-center bg-transparent ${containerClassName}`}>
        <img
          src={cleanSrc}
          alt={alt}
          onError={() => setLoadFailed(true)}
          className={`${imgClass} object-contain bg-transparent border-0 outline-none select-none`}
          style={{ backgroundColor: 'transparent' }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 bg-transparent ${containerClassName}`}>
      {fallbackIcon || (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
          <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-ink" strokeWidth={2.5} />
        </div>
      )}
      {showTextFallback && name && (
        <div className="leading-none">
          <div className="font-serif text-base sm:text-xl font-bold text-white tracking-wide">{name}</div>
          {tagline && <div className="text-[8px] sm:text-[10px] tracking-[0.25em] text-gold uppercase">{tagline}</div>}
        </div>
      )}
    </div>
  );
};
