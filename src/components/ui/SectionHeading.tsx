import React from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  number?: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  number,
  description,
  align = 'left',
}) => {
  return (
    <div className="mb-10 sm:mb-12">
      {/* Compound Section Transition Line with centered label breaking the stroke */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[#E5E7EB] dark:border-[#262626]" />
        </div>
        <div className="relative bg-white dark:bg-[#0B0F17] px-4 flex items-center gap-2">
          <span className="text-xs sm:text-[13px] font-mono tracking-wider uppercase text-[#6F6F6F] dark:text-slate-400">
            {eyebrow}
          </span>
          {number && (
            <span className="text-[11px] font-mono text-[#A0A0A0] dark:text-slate-500">
              [{number}]
            </span>
          )}
        </div>
      </div>

      {/* Section Headline */}
      <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : ''}>
        <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-[-0.02em] leading-[1.18] text-[#171717] dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-400 mt-2.5 max-w-2xl leading-[1.58] font-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
