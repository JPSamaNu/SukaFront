import { cn } from '@/shared/lib/utils';
import { typeBadgeClasses } from '@/design/neodex.tokens';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function TypeBadge({ type, size = 'md', className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        typeBadgeClasses(type, size),
        'font-semibold capitalize inline-block',
        className
      )}
    >
      {type}
    </span>
  );
}
