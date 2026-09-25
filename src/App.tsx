import { useState, useEffect, useCallback } from 'react';
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
import { Resume } from './components/sections/Resume';
import { Contact } from './components/sections/Contact';
import { ProjectDetail } from './components/sections/ProjectDetail';
import { Blog } from './components/sections/Blog';
import { NotFound } from './components/sections/NotFound';
import { PageSEO } from './components/common/PageSEO';
import { projects } from './data/portfolioData';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  const [path, setPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [hash, setHash] = useState<string>(() =>
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

  const navigate = useCallback((url: string) => {
    if (url.startsWith('#')) {
      window.location.hash = url;
      setHash(url);
      const el = document.getElementById(url.replace(/^#/, ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    window.history.pushState(null, '', url);
    setPath(window.location.pathname);
    setHash(window.location.hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate (browser back/forward) and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
      setHash(window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Intercept local <a> link clicks for smooth client-side routing
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank' ||
        target.hasAttribute('download') ||
        href.endsWith('.pdf') ||
        /\.[a-zA-Z0-9]+$/.test(href.split('?')[0]) ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      if (href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
      } else if (href.startsWith('#')) {
        const normalized = path.replace(/\/+$/, '') || '/';
        const isHomeRoute =
          normalized === '/' ||
          normalized === '/projects' ||
          normalized === '/about' ||
          normalized === '/experience' ||
          normalized === '/resume' ||
          normalized === '/contact' ||
          normalized === '/services';

        if (!isHomeRoute) {
          e.preventDefault();
          window.history.pushState(null, '', '/' + href);
          setPath('/');
          setHash(href);
          setTimeout(() => {
            const el = document.getElementById(href.replace(/^#/, ''));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [navigate, path]);

  // Backward-compatibility: upgrade legacy #/project/:id to clean path /projects/:id
  useEffect(() => {
    if (hash.startsWith('#/project/')) {
      const legacyId = hash.replace('#/project/', '');
      window.history.replaceState(null, '', `/projects/${legacyId}`);
      setPath(`/projects/${legacyId}`);
      setHash('');
    }
  }, [hash]);

  // Scroll to section when anchor or home path loads
  useEffect(() => {
    const normalized = path.replace(/\/+$/, '') || '/';
    let targetId = '';

    if (hash) {
      targetId = hash.replace(/^#/, '');
    } else if (normalized === '/projects') {
      targetId = 'work';
    } else if (normalized === '/about') {
      targetId = 'about';
    } else if (normalized === '/experience') {
      targetId = 'experience';
    } else if (normalized === '/resume') {
      targetId = 'resume';
    } else if (normalized === '/contact') {
      targetId = 'contact';
    }

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [path, hash]);

  // Route matching
  const cleanPath = path.replace(/\/+$/, '') || '/';

  // 1. Project Detail Routes: /projects/:slug
  let isProjectRoute = false;
  let matchedProject: (typeof projects)[0] | null = null;

  if (cleanPath.startsWith('/projects/')) {
    isProjectRoute = true;
    const slug = cleanPath.replace('/projects/', '').toLowerCase();
    matchedProject =
      projects.find(
        (p) => p.id.toLowerCase() === slug || (slug === 'kaushalnexus' && p.id === 'kaushal-nexus')
      ) || null;
  }

  // 2. Blog Routes: /blog and /blog/:slug
  let isBlogRoute = false;
  let activeBlogSlug: string | null = null;

  if (cleanPath === '/blog') {
    isBlogRoute = true;
  } else if (cleanPath.startsWith('/blog/')) {
    isBlogRoute = true;
    activeBlogSlug = cleanPath.replace('/blog/', '').toLowerCase();
  }

  // 3. Known Home Routes
  const isHomeRoute =
    cleanPath === '/' ||
    cleanPath === '/projects' ||
    cleanPath === '/about' ||
    cleanPath === '/experience' ||
    cleanPath === '/resume' ||
    cleanPath === '/contact' ||
    cleanPath === '/services';

  return (
    <div className="atmospheric-bg min-h-screen text-[#171717] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300 selection:bg-[#171717] selection:text-white dark:selection:bg-white dark:selection:text-[#171717]">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow space-y-4 sm:space-y-8">
        {isProjectRoute ? (
          matchedProject ? (
            <ProjectDetail
              project={matchedProject}
              onBack={() => navigate('/projects')}
              onSelectProject={(id) => navigate(`/projects/${id}`)}
            />
          ) : (
            <NotFound
              onNavigateHome={() => navigate('/')}
              onNavigateProjects={() => navigate('/projects')}
            />
          )
        ) : isBlogRoute ? (
          <Blog
            activeSlug={activeBlogSlug}
            onNavigateHome={() => navigate('/')}
            onSelectArticle={(slug) => (slug ? navigate(`/blog/${slug}`) : navigate('/blog'))}
          />
        ) : isHomeRoute ? (
          <>
            <PageSEO
              title="Aman Mishra | Software Developer | C++ • React • AI/ML"
              description="Aman Mishra is a software developer specializing in C++, Data Structures & Algorithms, React, full-stack systems, and AI/ML integrations."
              canonical="https://www.calligraphyguruji.dev/"
            />
            <Hero />
            <Projects onSelectProject={(id) => navigate(`/projects/${id}`)} />
            <WhatIBuild />
            <Skills />
            <ProblemSolving />
            <Experience />
            <About />
            <Resume />
            <Contact />
          </>
        ) : (
          <NotFound
            onNavigateHome={() => navigate('/')}
            onNavigateProjects={() => navigate('/projects')}
          />
        )}
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
