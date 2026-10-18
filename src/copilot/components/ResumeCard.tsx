import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import type { ResumeCardData } from '../types.ts';

interface ResumeCardProps {
  data: ResumeCardData;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data || !data.downloadUrl) {
    return null;
  }

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = origin + (data.downloadUrl.startsWith('http') ? data.downloadUrl : data.downloadUrl);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="mt-3 my-2 rounded-xl overflow-hidden border border-amber-500/30 bg-[#0F131D] dark:bg-[#141926] shadow-lg text-slate-100"
      role="region"
      aria-label="Aman Mishra Resume PDF Document Card"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-950/30 border-b border-amber-500/20 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-wider">OFFICIAL CURRICULUM VITAE</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          <span>ATS Verified</span>
        </span>
      </div>

      {/* Card Body */}
      <div className="p-3.5 space-y-3">
        <div>
          <h4 className="text-sm font-sans font-bold text-white tracking-tight">
            {data.title}
          </h4>
          <p className="text-xs text-slate-300 font-normal mt-0.5">
            {data.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
              {data.filename}
            </span>
            <span>&bull;</span>
            <span>{data.fileSize}</span>
            <span>&bull;</span>
            <span className="text-emerald-400">2026 Edition</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Download Button */}
          <a
            href={data.downloadUrl}
            download={data.filename}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-[#111111] text-xs font-semibold uppercase tracking-wider transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F131D]"
            aria-label={`Download ${data.filename}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>

          {/* View in Browser Button */}
          <a
            href={data.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F131D]"
            aria-label={`Preview ${data.filename} in a new tab`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview in Tab</span>
          </a>
        </div>

        {/* Copy Direct Link */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate pr-2 text-[10px]">
            Direct Link: {data.downloadUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Copy direct resume link"
            aria-label="Copy direct resume URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
