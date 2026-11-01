import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolShell } from './components/ToolShell';
import { HomePage } from './pages/HomePage';
import { ToolsIndexPage } from './pages/ToolsIndexPage';
import { BlogIndexPage, BlogPostPage } from './pages/BlogPages';
import {
  AboutPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
  NotFoundPage,
} from './pages/LegalAndStaticPages';
import { TOOLS_BY_SLUG, ToolId } from './data/tools';
import { BLOG_BY_SLUG } from './data/blog';
import { normalizePathname, getPageSEO } from './lib/seo';
import { runCanvasCheck } from './lib/canvas-check';
import { recordRecentTool } from './lib/recent-tools';

const LazyToaster = lazy(() => import('./components/ui/sonner'));
const LazyCommandPalette = lazy(() => import('./components/ui/command-palette'));

interface AppProps {
  initialPath?: string;
}

export default function App({ initialPath }: AppProps) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return normalizePathname(initialPath);
    if (typeof window !== 'undefined') return normalizePathname(window.location.pathname);
    return '/';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      const dark = document.documentElement.classList.contains('dark');
      setTheme(dark ? 'dark' : 'light');
    }
    void runCanvasCheck(false);
  }, []);

  // Global Cmd/Ctrl+K keyboard shortcut for the command palette
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('pixelo-theme', nextTheme);
      } catch {}
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePathname(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const seo = getPageSEO(currentPath, window.location.origin);
    document.title = seo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', seo.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', `${window.location.origin}${seo.ogImage}`);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', `${window.location.origin}${seo.ogImage}`);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        'href',
        `${window.location.origin}${seo.canonicalPath === '/' ? '/' : seo.canonicalPath}`
      );
    }

    const toolSlug = currentPath.slice(1) as ToolId;
    if (TOOLS_BY_SLUG[toolSlug]) {
      recordRecentTool(toolSlug);
    }
  }, [currentPath]);

  const handleNavigate = (nextPath: string) => {
    const normalized = normalizePathname(nextPath);
    const applyNav = () => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', normalized);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
      setCurrentPath(normalized);
    };

    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as Document & { startViewTransition?: (cb: () => void) => void })
        .startViewTransition === 'function' &&
      !(
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    ) {
      try {
        (
          document as Document & { startViewTransition: (cb: () => void) => void }
        ).startViewTransition(() => {
          applyNav();
        });
        return;
      } catch {}
    }

    applyNav();
  };

  const renderRouteContent = () => {
    if (currentPath === '/') {
      return (
        <HomePage
          onNavigate={handleNavigate}
          onOpenCommandPalette={() => setCommandOpen(true)}
        />
      );
    }
    if (currentPath === '/tools') {
      return <ToolsIndexPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/blog') {
      return <BlogIndexPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage />;
    }
    if (currentPath === '/terms') {
      return <TermsPage />;
    }

    const toolSlug = currentPath.slice(1) as ToolId;
    if (TOOLS_BY_SLUG[toolSlug]) {
      return <ToolShell tool={TOOLS_BY_SLUG[toolSlug]} onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('/blog/')) {
      const blogSlug = currentPath.replace('/blog/', '');
      const article = BLOG_BY_SLUG[blogSlug];
      if (article) {
        return <BlogPostPage article={article} onNavigate={handleNavigate} />;
      }
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="relative min-h-dvh w-full max-w-full overflow-x-clip flex flex-col bg-[#F7F6F3] text-[#1A1A1A] dark:bg-[#0E0E0E] dark:text-[#EDEDEA] transition-colors duration-250">
      {/* Subtle paper-grain texture over the page background (SVG noise at 3.5% opacity, pointer-events none) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.035] dark:opacity-[0.04]"
      >
        <filter id="pixelo-paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pixelo-paper-grain)" />
      </svg>

      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setCommandOpen(true)}
      />
      <main key={currentPath} className="flex-1 w-full min-w-0 max-w-full animate-page-fade">
        {renderRouteContent()}
      </main>
      <Footer onNavigate={handleNavigate} />

      {isMounted && (
        <Suspense fallback={null}>
          <LazyToaster theme={theme} />
          <LazyCommandPalette
            open={commandOpen}
            onOpenChange={setCommandOpen}
            onSelectPath={handleNavigate}
          />
        </Suspense>
      )}
    </div>
  );
}
