import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  const variantClasses = {
    neutral:
      'bg-slate-800/80 text-slate-300 border border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 light:bg-stone-100 light:text-stone-700 light:border-stone-300',
    accent:
      'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/30 light:bg-sky-50 light:text-sky-800 light:border-sky-200',
    success:
      'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800 light:border-emerald-200',
    amber:
      'bg-amber-950/60 text-amber-300 border border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30 light:bg-amber-50 light:text-amber-800 light:border-amber-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full tracking-wide transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
