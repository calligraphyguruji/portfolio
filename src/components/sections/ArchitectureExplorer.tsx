import React, { useState } from 'react';
import {
  Layers,
  GitCommit,
  ShieldCheck,
  Cpu,
  Server,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  FileCode2,
  Workflow
} from 'lucide-react';
import { ProjectArchitectureDataset, ArchitectureComponentNode } from '../../types/architecture';
import { ARCHIFY_SVGS } from '../../data/architectureSvgs';
import '../../styles/archifyDiagram.css';

interface ArchitectureExplorerProps {
  dataset: ProjectArchitectureDataset;
}

export const ArchitectureExplorer: React.FC<ArchitectureExplorerProps> = ({ dataset }) => {
  const [activeViewId, setActiveViewId] = useState<string>(dataset.views[0]?.id || 'topology');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(dataset.defaultNodeId);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedStateStatus, setSelectedStateStatus] = useState<string>(() => {
    if (dataset.lifecycleStates) {
      const keys = Object.keys(dataset.lifecycleStates);
      return keys[1] || keys[0] || '';
    }
    return '';
  });

  const activeView = dataset.views.find((v) => v.id === activeViewId) || dataset.views[0];

  const selectedComponent: ArchitectureComponentNode =
    dataset.components[selectedNodeId] ||
    dataset.components[dataset.defaultNodeId] ||
    Object.values(dataset.components)[0];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.8, Math.max(0.6, Math.round((prev + delta) * 10) / 10)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setIsExpanded(false);
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'GitCommit':
        return <GitCommit className="w-3.5 h-3.5" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'Workflow':
        return <Workflow className="w-3.5 h-3.5" />;
      default:
        return <Server className="w-3.5 h-3.5" />;
    }
  };

  // Resolve SVG string from ARCHIFY_SVGS map
  const projectSvgMap =
    dataset.projectId === 'credvidhi'
      ? ARCHIFY_SVGS.credvidhi
      : dataset.projectId === 'gemini-ai-chatbot' || dataset.projectId === 'bodhisakha'
      ? ARCHIFY_SVGS.bodhisakha
      : ARCHIFY_SVGS.kaushalnexus;

  const currentSvgHtml =
    (projectSvgMap as Record<string, string>)[activeView.svgKey] ||
    (projectSvgMap as Record<string, string>)['topology'] ||
    '';

  return (
    <section className="space-y-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]" aria-label="System Architecture & Data Flow">
      {/* Header with Badges & Metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-indigo-500/20 dark:border-cyan-500/25">
              <Workflow className="w-3 h-3" />
              ARCHIFY SHOWCASE VERIFIED
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-black/[0.03] dark:bg-white/[0.04]">
              SPEC SHA-256 VALIDATED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-[#171717] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
            System Architecture &amp; Data Flow
          </h2>
          <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 font-medium max-w-2xl mt-1">
            {dataset.subtitle}
          </p>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] self-start md:self-auto overflow-x-auto">
          {dataset.views.map((vw) => (
            <button
              key={vw.id}
              onClick={() => setActiveViewId(vw.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeViewId === vw.id
                  ? 'bg-white dark:bg-[#1E1E1E] text-[#171717] dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {renderIcon(vw.iconName)}
              <span>{vw.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas & Explorer Grid */}
      <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4 transition-all duration-300`}>
        {/* Architecture Canvas Column */}
        <div className={isExpanded ? 'col-span-1' : 'lg:col-span-8'}>
          <div className="relative rounded-2xl bg-white dark:bg-[#12141A] border border-black/[0.08] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
            {/* Canvas Toolbar */}
            <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-[#171717] dark:text-slate-200">
                  {activeView.label}: {activeView.sublabel}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetView}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Reset View"
                  aria-label="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
                  title={isExpanded ? 'Restore Sidebar' : 'Expand Canvas'}
                  aria-label={isExpanded ? 'Restore Sidebar' : 'Expand Canvas'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* SVG Render Container with archify-diagram wrapper */}
            <div className="relative overflow-auto max-h-[580px] min-h-[460px] p-2 sm:p-4 flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0B0D13]">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="archify-diagram transition-transform duration-150 w-full flex items-center justify-center select-none"
                dangerouslySetInnerHTML={{
                  __html: currentSvgHtml,
                }}
              />
            </div>

            {/* Canvas Legend & Trust Boundaries Footer */}
            <div className="px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/80"></span> Synchronous REST
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-rose-400"></span> External / Advisory
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80"></span> ACID Persistent Store
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80"></span> In-Memory Cache / ML
                </span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                Generated via Archify CLI (Showcase Profile: 9/9 Passes)
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Detail & Node Inspector Column */}
        <div className={isExpanded ? 'hidden' : 'lg:col-span-4'}>
          <div className="h-full rounded-2xl bg-white dark:bg-[#12141A] border border-black/[0.08] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              {/* Component Selector Bar */}
              <div className="mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Inspect System Node
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
                  {Object.values(dataset.components).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedNodeId(c.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-left truncate transition-colors border ${
                        selectedNodeId === c.id
                          ? 'bg-black text-white dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-black/[0.04] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      {c.name.split(' ')[0]} {c.name.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Node Inspector Card */}
              {selectedComponent && (
                <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#171717] dark:text-white font-sans">
                        {selectedComponent.name}
                      </h3>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400">
                        {selectedComponent.technology}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                      selectedComponent.status === 'Implemented'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedComponent.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#5E5E5E] dark:text-slate-300 leading-relaxed font-sans">
                    {selectedComponent.description}
                  </p>

                  {/* IO Specifications */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Inputs</span>
                      <ul className="space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        {selectedComponent.inputs.map((inp, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-cyan-400"></span>
                            <span className="truncate">{inp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Security Controls</span>
                      <ul className="space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        {selectedComponent.securityControls.map((sec, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Lock className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            <span className="truncate">{sec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Source Verification Link */}
                  {selectedComponent.sourceReferences && selectedComponent.sourceReferences.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        Verified Source File
                      </span>
                      {selectedComponent.sourceReferences.map((sf, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-indigo-50/50 dark:bg-cyan-950/20 border border-indigo-500/10 dark:border-cyan-500/20 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-indigo-700 dark:text-cyan-300 font-bold truncate">
                            <span className="flex items-center gap-1.5 truncate">
                              <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{sf.file}</span>
                            </span>
                            {sf.lines && <span className="text-[10px] opacity-75">#L{sf.lines}</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {sf.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Implementation Note */}
            {selectedComponent?.implementationNotes && (
              <div className="p-2.5 rounded-xl bg-amber-500/[0.05] dark:bg-amber-400/[0.04] border border-amber-500/15 dark:border-amber-400/20 text-[11px] text-amber-800 dark:text-amber-200 font-mono">
                <span className="font-bold uppercase text-[9px] block text-amber-600 dark:text-amber-400 mb-0.5">Note:</span>
                {selectedComponent.implementationNotes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lifecycle Matrix Deep Dive */}
      {dataset.lifecycleStates && (
        <div className="rounded-2xl bg-white dark:bg-[#12141A] border border-black/[0.08] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white font-sans flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
                {dataset.lifecycleTitle || 'Application Lifecycle State Matrix'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Authoritative backend state transitions governed inside ACID database boundaries.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
              TRANSITIONS ENFORCED
            </span>
          </div>

          {/* State Pills */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(dataset.lifecycleStates).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStateStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                  selectedStateStatus === st
                    ? 'bg-black text-white dark:bg-cyan-500 dark:text-black border-transparent shadow-xs'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-black/[0.06] dark:border-white/[0.08] hover:border-black/30'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Active Selected State Card */}
          {dataset.lifecycleStates[selectedStateStatus] && (
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Authorized Actor</span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {dataset.lifecycleStates[selectedStateStatus].actor}
                </span>
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Preconditions &amp; Validation</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {dataset.lifecycleStates[selectedStateStatus].preconditions}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Permitted Targets</span>
                <div className="flex flex-wrap gap-1">
                  {dataset.lifecycleStates[selectedStateStatus].allowedTargets.length > 0 ? (
                    dataset.lifecycleStates[selectedStateStatus].allowedTargets.map((tgt) => (
                      <span key={tgt} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {tgt}
                      </span>
                    ))
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                      TERMINAL (0 Outbound)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engineering Decisions Panel */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            /ENGINEERING DECISIONS &amp; ARCHITECTURAL TRADEOFFS
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {dataset.decisions.length} Verified Decisions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataset.decisions.map((dec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#12141A] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-3 font-sans"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-[#171717] dark:text-white">
                  {dec.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase shrink-0 ${
                  dec.status === 'Implemented'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {dec.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#5E5E5E] dark:text-slate-300 leading-relaxed font-sans">
                <div>
                  <strong className="text-[#171717] dark:text-slate-200 font-mono text-[11px] block">Implementation:</strong>
                  {dec.implementation}
                </div>
                <div>
                  <strong className="text-[#171717] dark:text-slate-200 font-mono text-[11px] block">Architectural Rationale:</strong>
                  {dec.reason}
                </div>
                <div>
                  <strong className="text-[#171717] dark:text-slate-200 font-mono text-[11px] block">Engineering Trade-off:</strong>
                  {dec.tradeoff}
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] font-mono text-indigo-600 dark:text-cyan-400 flex items-start gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="truncate">Evidence: {dec.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
