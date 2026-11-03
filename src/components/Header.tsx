import React, { useState, useEffect, useRef } from 'react';
import {
  Minimize2,
  Maximize2,
  Crop,
  UserSquare2,
  FileText,
  RotateCw,
  Stamp,
  Contrast,
  ArrowLeftRight,
  Sun,
  Moon,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { siteConfig } from '../../config/site';
import { TOOLS_DATA, TOOL_CATEGORIES, ToolId } from '../data/tools';
import { BlurFade } from './ui/blur-fade';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenCommandPalette?: () => void;
}

/**
 * Consistent thin-line Lucide icon (strokeWidth={1.5}) per tool for menus and directory cards.
 */
export function ToolGlyph({ slug }: { slug: ToolId }) {
  const iconClass =
    'w-[15px] h-[15px] shrink-0 text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] transition-colors duration-150';

  switch (slug) {
    case 'compress-image':
    case 'resize-image-to-20kb':
    case 'resize-image-to-50kb':
    case 'resize-image-to-100kb':
      return <Minimize2 strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'resize-image':
      return <Maximize2 strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'crop-image':
      return <Crop strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'passport-photo-maker':
      return <UserSquare2 strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'image-to-pdf':
      return <FileText strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'rotate-flip-image':
      return <RotateCw strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'add-watermark':
      return <Stamp strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case 'image-to-black-and-white':
      return <Contrast strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    default:
      return <ArrowLeftRight strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
  }
}

/**
 * Renders an H1 with Instrument Serif, clamp(34px, 5vw, 56px), BlurFade entrance,
 * 40ms word rise stagger, and one word set in italic with the warm vermilion accent (#E5542B).
 */
export function StaggeredH1({
  text,
  accentWord,
  accentWordIndex,
  className = '',
}: {
  text: string;
  accentWord?: string;
  accentWordIndex?: number;
  className?: string;
}) {
  const words = text.trim().split(/\s+/);
  const matchedIdx = accentWord
    ? words.findIndex(
        (w) =>
          w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
          accentWord.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      )
    : -1;

  const targetIdx =
    matchedIdx >= 0
      ? matchedIdx
      : typeof accentWordIndex === 'number' &&
        accentWordIndex >= 0 &&
        accentWordIndex < words.length
      ? accentWordIndex
      : Math.max(0, words.length - 1);

  return (
    <BlurFade duration={0.34} delay={0} offset={6} blur="4px" inView={true}>
      <h1 className={`text-[clamp(34px,5vw,56px)] ${className}`}>
        {words.map((word, idx) => {
          const isAccent = idx === targetIdx;
          return (
            <React.Fragment key={idx}>
              <span
                className="animate-word-rise"
                style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
              >
                {isAccent ? (
                  <em className="italic text-[#E5542B] font-normal">{word}</em>
                ) : (
                  word
                )}
              </span>
              {idx < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </h1>
    </BlurFade>
  );
}

/**
 * Hook that observes `.reveal-on-scroll` elements and fades them
 * up 12px once as they enter the viewport.
 */
export function useScrollReveal(depKey?: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const root: ParentNode = containerRef.current || document;

    const elements = Array.from(root.querySelectorAll('.reveal-on-scroll'));
    if (
      typeof IntersectionObserver === 'undefined' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [depKey]);

  return containerRef;
}

const SITE_MENU_LINKS = [
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Terms', path: '/terms' },
] as const;

export function Header({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
}: HeaderProps) {
  const [localDark, setLocalDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  const isDark = theme ? theme === 'dark' : localDark;

  useEffect(() => {
    setLocalDark(document.documentElement.classList.contains('dark'));
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 6);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  // Prevent background scroll, manage focus trap, Escape key, and focus restoration
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (menuOpen) {
      wasOpenRef.current = true;
      document.body.style.overflow = 'hidden';

      const focusTimer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 20);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMenuOpen(false);
          return;
        }

        if (e.key === 'Tab' && panelRef.current) {
          const focusable = Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        menuButtonRef.current?.focus();
      }
    }
  }, [menuOpen]);

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
      return;
    }
    const nextDark = !localDark;
    setLocalDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('pixelo-theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('pixelo-theme', 'light');
      } catch {}
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setMenuOpen(false);
    onNavigate(path);
  };

  let staggerCounter = 0;

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md bg-[#F7F6F3]/90 dark:bg-[#0E0E0E]/90 border-b transition-colors duration-200 ${
          scrolled
            ? 'border-[#E7E5E0] dark:border-[#262624]'
            : 'border-transparent'
        }`}
      >
        <div className="max-w-[960px] mx-auto h-[64px] px-[20px] sm:px-[32px] flex items-center justify-between gap-[12px] min-w-0">
          {/* Left: Pixelo wordmark with accent dot */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="min-h-[48px] inline-flex items-center gap-[6px] font-serif-heading text-2xl tracking-tight text-[#1A1A1A] dark:text-[#EDEDEA] hover:text-[#E5542B] dark:hover:text-[#E5542B] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <span>{siteConfig.siteName}</span>
            <span
              aria-hidden="true"
              className="inline-block w-[5px] h-[5px] rounded-full bg-[#E5542B] translate-y-[3px]"
            />
          </a>

          {/* Right: Search icon button, Menu button with hamburger icon, and Theme toggle (all screen widths) */}
          <div className="flex items-center gap-[8px] shrink-0">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                aria-label="Search tools (Command+K)"
                title="Search tools (⌘K / Ctrl+K)"
                className="btn-press min-h-[48px] min-w-[48px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B] dark:hover:border-[#E5542B] hover:text-[#E5542B] dark:hover:text-[#E5542B] inline-flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0"
              >
                <Search strokeWidth={1.5} className="w-[18px] h-[18px]" />
              </button>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-navigation-panel"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="btn-press min-h-[48px] px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center gap-[8px] transition-colors duration-150 cursor-pointer shrink-0"
            >
              {menuOpen ? (
                <>
                  <X strokeWidth={1.5} className="w-[18px] h-[18px]" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu strokeWidth={1.5} className="w-[18px] h-[18px]" />
                  <span>Menu</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="btn-press min-h-[48px] min-w-[48px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-[#6B6B66] hover:text-[#E5542B] dark:text-[#9B9B95] dark:hover:text-[#E5542B] inline-flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0"
            >
              {isDark ? (
                <Sun strokeWidth={1.5} className="w-[18px] h-[18px] transition-transform duration-250" />
              ) : (
                <Moon strokeWidth={1.5} className="w-[18px] h-[18px] transition-transform duration-250" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SEO-safe Navigation Sheet / Right-Side Panel: always rendered in DOM, hidden when closed */}
      <div
        id="site-navigation-panel"
        role="dialog"
        aria-modal={menuOpen ? 'true' : undefined}
        aria-label="Site navigation menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
        className={`fixed inset-0 z-50 transition-opacity duration-150 motion-reduce:transition-none ${
          menuOpen
            ? 'visible pointer-events-auto opacity-100'
            : 'invisible pointer-events-none opacity-0'
        }`}
      >
        {/* Soft Backdrop */}
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        />

        {/* Full-height sheet on mobile (< 640px), 420px right-side panel on desktop (>= 640px) */}
        <div
          ref={panelRef}
          style={{
            paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          }}
          className={`fixed inset-y-0 right-0 z-10 h-dvh w-full sm:w-[420px] max-w-full overflow-y-auto bg-[#F7F6F3] dark:bg-[#0E0E0E] sm:border-l border-[#E7E5E0] dark:border-[#262624] px-[20px] sm:px-[24px] pt-[12px] shadow-xl transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:transform-none ${
            menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-[8px] opacity-0'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-[12px] pb-[12px] border-b border-[#E7E5E0] dark:border-[#262624]">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              tabIndex={menuOpen ? 0 : -1}
              className="min-h-[48px] inline-flex items-center gap-[6px] font-serif-heading text-2xl tracking-tight text-[#1A1A1A] dark:text-[#EDEDEA] hover:text-[#E5542B] transition-colors duration-150"
            >
              <span>{siteConfig.siteName}</span>
              <span
                aria-hidden="true"
                className="inline-block w-[5px] h-[5px] rounded-full bg-[#E5542B] translate-y-[3px]"
              />
            </a>

            <div className="flex items-center gap-[10px]">
              <span className="hidden sm:inline-flex items-center px-[8px] py-[3px] rounded-[6px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] font-mono text-[11px] text-[#6B6B66] dark:text-[#9B9B95]">
                Esc to close
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
                aria-label="Close menu"
                className="btn-press min-h-[48px] px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center gap-[6px] cursor-pointer"
              >
                <X strokeWidth={1.5} className="w-[16px] h-[16px]" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Main Navigation: Tools Grouped by Purpose (Compress, Convert, Edit, Documents) + Site Links */}
          <nav aria-label="Main Navigation" className="mt-[20px] space-y-[24px] min-w-0">
            {TOOL_CATEGORIES.map((category) => {
              const catTools = TOOLS_DATA.filter((t) => t.category === category.name);
              return (
                <div key={category.name} className="space-y-[8px] min-w-0">
                  <div className="px-[4px] text-[11px] font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95]">
                    {category.name}
                  </div>
                  <div className="grid grid-cols-1 gap-[6px]">
                    {catTools.map((tool) => {
                      const delayMs = staggerCounter * 20;
                      staggerCounter += 1;
                      return (
                        <a
                          key={tool.slug}
                          href={tool.path}
                          tabIndex={menuOpen ? 0 : -1}
                          onClick={(e) => handleLinkClick(e, tool.path)}
                          style={menuOpen ? { animationDelay: `${delayMs}ms` } : undefined}
                          className={`group min-h-[56px] w-full px-[14px] py-[10px] rounded-[10px] border flex items-center justify-between gap-[10px] transition-colors duration-150 min-w-0 ${
                            menuOpen ? 'animate-menu-item' : ''
                          } ${
                            currentPath === tool.path
                              ? 'border-[#E5542B] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA]'
                              : 'border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-[#1A1A1A] dark:text-[#EDEDEA]'
                          }`}
                        >
                          <div className="flex items-start gap-[10px] min-w-0 flex-1">
                            <span className="mt-[3px] shrink-0">
                              <ToolGlyph slug={tool.slug} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                                {tool.name}
                              </div>
                              <div className="text-[12px] text-[#6B6B66] dark:text-[#9B9B95] truncate">
                                {tool.shortDescription}
                              </div>
                            </div>
                          </div>
                          <span
                            aria-hidden="true"
                            className="text-sm text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150 shrink-0"
                          >
                            →
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Site Pages: Blog, About, Contact, Privacy, Terms */}
            <div className="pt-[16px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[8px] min-w-0">
              <div className="px-[4px] text-[11px] font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95]">
                Pages & Legal
              </div>
              <div className="grid grid-cols-1 gap-[6px]">
                {SITE_MENU_LINKS.map((link) => {
                  const delayMs = staggerCounter * 20;
                  staggerCounter += 1;
                  const isActive =
                    link.path === '/blog'
                      ? currentPath.startsWith('/blog')
                      : currentPath === link.path;
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      tabIndex={menuOpen ? 0 : -1}
                      onClick={(e) => handleLinkClick(e, link.path)}
                      style={menuOpen ? { animationDelay: `${delayMs}ms` } : undefined}
                      className={`group min-h-[48px] w-full px-[14px] rounded-[10px] border flex items-center justify-between text-[15px] font-medium transition-colors duration-150 ${
                        menuOpen ? 'animate-menu-item' : ''
                      } ${
                        isActive
                          ? 'border-[#E5542B] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA]'
                          : 'border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-[#1A1A1A] dark:text-[#EDEDEA]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <span
                        aria-hidden="true"
                        className="text-sm text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150"
                      >
                        →
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
