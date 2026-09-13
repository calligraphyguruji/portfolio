import React from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  number?: string;
  description?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  number,
  description,
}) => {
  return (
    <div className="mb-8 pb-3 border-b border-slate-800/80">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-cyan-400/80 block mb-1">
            {eyebrow}
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>
        {number && (
          <span className="font-serif italic text-base text-slate-500">
            {number}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
