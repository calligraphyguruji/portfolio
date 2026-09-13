import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  rounded?: 'card' | 'pill';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  rounded = 'card',
}) => {
  const roundedClasses = rounded === 'pill' ? 'rounded-full' : 'rounded-[20px]';

  const variantClasses = {
    default:
      'bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626]',
    elevated:
      'bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] compound-shadow',
    interactive:
      'bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all duration-200 shadow-xs group',
  }[variant];

  return (
    <div className={`${roundedClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};
