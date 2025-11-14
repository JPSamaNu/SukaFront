import { cn } from '@/shared/lib/utils';
import type { ReactNode, ElementType } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  interactive?: boolean;
  as?: ElementType;
}

export function Panel({ 
  children, 
  className, 
  padding = true,
  interactive = false,
  as: Component = 'div'
}: PanelProps) {
  return (
    <Component
      className={cn(
        'pokedex-panel',
        !padding && 'p-0',
        interactive && 'cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-panel',
        className
      )}
    >
      {children}
    </Component>
  );
}
