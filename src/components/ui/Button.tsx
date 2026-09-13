import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  asLink = false,
  href,
  target,
  rel,
  children,
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs py-2 px-4 gap-1.5',
    md: 'text-xs py-2.5 px-5 gap-2',
    lg: 'text-xs py-3 px-6 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-slate-100 text-slate-900 hover:bg-white active:scale-[0.98] shadow-md shadow-black/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
    secondary:
      'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline:
      'border border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800/40 active:scale-[0.98]',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
  }[variant];

  const baseClasses = `inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`;

  if (asLink && href) {
    return (
      <a href={href} target={target} rel={rel} className={baseClasses}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
      {icon}
    </button>
  );
};
