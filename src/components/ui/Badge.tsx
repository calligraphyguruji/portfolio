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
      'bg-[#F3F3F3] text-[#5E5E5E] border border-[#E5E7EB] dark:bg-[#161B22] dark:text-slate-300 dark:border-[#262626]',
    accent:
      'bg-[#171717] text-white border border-[#171717] dark:bg-white dark:text-[#171717] dark:border-white',
    success:
      'bg-[#F3F3F3] text-emerald-700 border border-[#E5E7EB] dark:bg-[#161B22] dark:text-emerald-400 dark:border-[#262626]',
    amber:
      'bg-[#FFE9BF]/50 text-[#855307] border border-[#FFE9BF] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full tracking-wide transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
