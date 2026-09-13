import { personalInfo } from './data/portfolioData';

export default function App() {
  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
          Phase 1 Build Setup Complete
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          {personalInfo.name}
        </h1>
        <p className="text-slate-400 text-sm">
          {personalInfo.role} • {personalInfo.college}
        </p>
      </div>
    </div>
  );
}
