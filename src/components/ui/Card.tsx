import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  rounded?: '2xl' | '3xl' | 'squircle';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  rounded = '3xl',
}) => {
  const roundedClasses = {
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    squircle: 'rounded-[2.5rem]',
  }[rounded];

  const variantClasses = {
    default:
      'bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8]',
    elevated:
      'bg-slate-900/95 dark:bg-slate-900/95 light:bg-white border border-slate-800/90 dark:border-slate-800/90 light:border-[#E4E0D8] shadow-xl',
    interactive:
      'bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-stone-400 transition-all duration-300 shadow-sm hover:shadow-md group',
  }[variant];

  return (
    <div className={`${roundedClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};
