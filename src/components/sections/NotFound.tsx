import React from 'react';
import { PageSEO } from '../common/PageSEO';
import { Home, FolderGit2, Mail } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
  onNavigateProjects: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  onNavigateHome,
  onNavigateProjects,
}) => {
  return (
    <>
      <PageSEO
        title="404: Page Not Found | Aman Mishra Portfolio"
        description="The requested page could not be found. Explore Aman Mishra's software engineering projects, experience, and algorithmic solutions."
        canonical="https://www.calligraphyguruji.dev/404"
        noindex={true}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
        <div className="editorial-panel p-8 sm:p-14 relative overflow-hidden">
          {/* Subtle Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl sm:text-[14rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none">
            404
          </div>

          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Error 404 · Route Not Found
            </span>

            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-[#171717] dark:text-white">
              Looking for something that isn&apos;t here.
            </h1>

            <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              The page or project you requested may have moved, been renamed, or does not exist. Use the links below to navigate back to verified sections.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </a>

              <a
                href="/projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateProjects();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white transition-all shadow-xs"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Browse Projects</span>
              </a>

              <a
                href="/#contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white transition-all shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Aman</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
