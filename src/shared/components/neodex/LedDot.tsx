import { cn } from '@/shared/lib/utils';

interface LedDotProps {
  on?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function LedDot({ on = true, className, 'aria-label': ariaLabel }: LedDotProps) {
  return (
    <div
      className={cn(
        'led',
        on ? 'animate-led' : 'opacity-30',
        className
      )}
      role="status"
      aria-label={ariaLabel || (on ? 'Connected' : 'Disconnected')}
      aria-live="polite"
    />
  );
}
