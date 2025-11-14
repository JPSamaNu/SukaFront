import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  className?: string;
  scanline?: boolean;
  tone?: 'neutral' | 'success' | 'warning';
}

export function Screen({ 
  children, 
  className,
  scanline = false,
  tone = 'neutral'
}: ScreenProps) {
  const toneStyles = {
    neutral: '',
    success: 'ring-1 ring-green-500/20',
    warning: 'ring-1 ring-pokedex-amber/20'
  };

  return (
    <div
      className={cn(
        'pokedex-screen',
        scanline && 'scanline',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
