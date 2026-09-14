import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { WhatIBuild } from './components/sections/WhatIBuild';
import { Skills } from './components/sections/Skills';
import { ProblemSolving } from './components/sections/ProblemSolving';
import { Experience } from './components/sections/Experience';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { ProjectDetail } from './components/sections/ProjectDetail';
import { projects } from './data/portfolioData';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      if (!hash.startsWith('#/project/')) {
        const id = hash.replace(/^#/, '');
        if (id) {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 80);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Determine if viewing a specific project detail page
  const projectMatch = currentHash.match(/^#\/project\/([a-zA-Z0-9_-]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;
  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId)
    : null;

  const handleSelectProject = (id: string) => {
    window.location.hash = `#/project/${id}`;
  };

  const handleBackToWork = () => {
    window.location.hash = '#work';
  };

  return (
    <div className="atmospheric-bg min-h-screen text-[#171717] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300 selection:bg-[#171717] selection:text-white dark:selection:bg-white dark:selection:text-[#171717]">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow space-y-4 sm:space-y-8">
        {activeProject ? (
          <ProjectDetail
            project={activeProject}
            onBack={handleBackToWork}
            onSelectProject={handleSelectProject}
          />
        ) : (
          <>
            <Hero />
            <Projects onSelectProject={handleSelectProject} />
            <WhatIBuild />
            <Skills />
            <ProblemSolving />
            <Experience />
            <About />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
