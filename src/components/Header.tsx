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
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { siteConfig } from '../../config/site';
import { TOOLS_DATA, TOOL_CATEGORIES, ToolId } from '../data/tools';
import { BlurFade } from './ui/blur-fade';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './ui/tooltip';

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

export function Header({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
}: HeaderProps) {
  const [localDark, setLocalDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setDesktopMenuOpen(false);
    setMobileSheetOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!desktopMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        desktopMenuOpen &&
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(e.target as Node)
      ) {
        setDesktopMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [desktopMenuOpen]);

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
    setDesktopMenuOpen(false);
    setMobileSheetOpen(false);
    onNavigate(path);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md bg-[#F7F6F3]/90 dark:bg-[#0E0E0E]/90 border-b transition-colors duration-200 ${
          scrolled
            ? 'border-[#E7E5E0] dark:border-[#262624]'
            : 'border-transparent'
        }`}
      >
        <div className="max-w-[960px] mx-auto h-[64px] px-[20px] sm:px-[32px] flex items-center justify-between gap-[12px] sm:gap-[16px] min-w-0">
          {/* Wordmark Logo Left */}
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

          {/* Desktop Navigation (>= 640px) */}
          <div className="hidden sm:flex items-center gap-[16px] min-w-0">
            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-[18px] text-sm text-[#6B6B66] dark:text-[#9B9B95] min-w-0"
            >
              {/* Tools Dropdown Trigger + Direct Link */}
              <div ref={desktopMenuRef} className="relative">
                <div className="flex items-center gap-[2px]">
                  <a
                    href="/tools"
                    onClick={(e) => handleLinkClick(e, '/tools')}
                    className={`min-h-[48px] inline-flex items-center px-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] whitespace-nowrap ${
                      currentPath === '/tools' ? 'text-[#1A1A1A] dark:text-[#EDEDEA] font-medium' : ''
                    }`}
                  >
                    Tools
                  </a>
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((o) => !o)}
                    aria-expanded={desktopMenuOpen}
                    aria-label="Toggle tools quick menu"
                    className="min-h-[48px] min-w-[32px] inline-flex items-center justify-center text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#E5542B] dark:hover:text-[#E5542B] transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronDown
                      strokeWidth={1.5}
                      className={`w-[15px] h-[15px] transition-transform duration-150 ${
                        desktopMenuOpen ? 'rotate-180 text-[#E5542B]' : ''
                      }`}
                    />
                  </button>
                </div>

                {desktopMenuOpen && (
                  <div
                    role="menu"
                    className="animate-menu-open absolute right-0 sm:left-0 sm:right-auto mt-[8px] w-[520px] max-w-[calc(100vw-40px)] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[16px] shadow-sm z-50"
                  >
                    <div className="grid grid-cols-2 gap-[16px] max-h-[72dvh] overflow-y-auto">
                      {TOOL_CATEGORIES.map((cat) => (
                        <div key={cat.name} className="space-y-[6px] min-w-0">
                          <div className="px-[10px] text-[11px] font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95]">
                            {cat.name}
                          </div>
                          <div className="space-y-[2px]">
                            {TOOLS_DATA.filter((t) => t.category === cat.name).map((tool, idx) => (
                              <a
                                key={tool.slug}
                                href={tool.path}
                                role="menuitem"
                                onClick={(e) => handleLinkClick(e, tool.path)}
                                style={{ animationDelay: `${idx * 15}ms` }}
                                className="animate-menu-item group min-h-[44px] flex items-center justify-between gap-[8px] px-[10px] py-[8px] rounded-[8px] hover:bg-[#F7F6F3] dark:hover:bg-[#0E0E0E] text-sm text-[#1A1A1A] dark:text-[#EDEDEA] transition-colors duration-150 min-w-0"
                              >
                                <span className="flex items-center gap-[8px] min-w-0 truncate">
                                  <ToolGlyph slug={tool.slug} />
                                  <span className="truncate">{tool.name}</span>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="text-xs text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150 shrink-0"
                                >
                                  →
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a
                href="/blog"
                onClick={(e) => handleLinkClick(e, '/blog')}
                className={`min-h-[48px] inline-flex items-center px-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] whitespace-nowrap ${
                  currentPath.startsWith('/blog') ? 'text-[#1A1A1A] dark:text-[#EDEDEA] font-medium' : ''
                }`}
              >
                Blog
              </a>
              <a
                href="/about"
                onClick={(e) => handleLinkClick(e, '/about')}
                className={`min-h-[48px] inline-flex items-center px-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] whitespace-nowrap ${
                  currentPath === '/about' ? 'text-[#1A1A1A] dark:text-[#EDEDEA] font-medium' : ''
                }`}
              >
                About
              </a>
            </nav>

            {/* Command Search Button (Desktop) */}
            {onOpenCommandPalette && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    aria-label="Search tools (Command+K)"
                    className="btn-press min-h-[38px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-xs text-[#6B6B66] dark:text-[#9B9B95] hover:border-[#E5542B] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] inline-flex items-center gap-[8px] transition-colors duration-150 cursor-pointer shrink-0"
                  >
                    <Search strokeWidth={1.5} className="w-[14px] h-[14px] shrink-0" />
                    <span>Search tools...</span>
                    <kbd className="ml-[2px] px-[5px] py-[1px] rounded-[5px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] font-mono text-[10px] text-[#6B6B66] dark:text-[#9B9B95]">
                      ⌘K
                    </kbd>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Jump to any tool (⌘K / Ctrl+K)</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="btn-press min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-[10px] text-[#6B6B66] hover:text-[#E5542B] dark:text-[#9B9B95] dark:hover:text-[#E5542B] cursor-pointer shrink-0"
                >
                  {isDark ? (
                    <Sun strokeWidth={1.5} className="w-[18px] h-[18px] transition-transform duration-250" />
                  ) : (
                    <Moon strokeWidth={1.5} className="w-[18px] h-[18px] transition-transform duration-250" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile Search + Menu Buttons Right (< 640px) */}
          <div className="flex sm:hidden items-center gap-[8px]">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                aria-label="Search tools"
                className="btn-press min-h-[48px] min-w-[48px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center cursor-pointer"
              >
                <Search strokeWidth={1.5} className="w-[18px] h-[18px]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileSheetOpen((open) => !open)}
              aria-expanded={mobileSheetOpen}
              aria-controls="mobile-navigation-sheet"
              aria-label={mobileSheetOpen ? 'Close menu' : 'Open menu'}
              className="btn-press min-h-[48px] px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center gap-[8px] cursor-pointer"
            >
              {mobileSheetOpen ? (
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
          </div>
        </div>

        {/* Mobile Menu Sheet using shadcn Sheet on Radix Dialog (100dvh, closes on route change) */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent
            id="mobile-navigation-sheet"
            aria-label="Site navigation menu"
            style={{
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            }}
            className="sm:hidden px-[20px] pt-[16px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Site navigation menu</SheetTitle>
              <SheetDescription>
                Browse all 14 private image tools, guides, and appearance settings.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-[24px] max-w-[680px] mx-auto min-w-0">
              <div className="flex items-center justify-between pb-[12px] border-b border-[#E7E5E0] dark:border-[#262624]">
                <span className="font-serif-heading text-2xl text-[#1A1A1A] dark:text-[#EDEDEA]">
                  {siteConfig.siteName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="Close navigation menu"
                  className="btn-press min-h-[48px] px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center gap-[6px] cursor-pointer"
                >
                  <X strokeWidth={1.5} className="w-[16px] h-[16px]" />
                  <span>Close</span>
                </button>
              </div>

              {/* Primary Links + Search + Theme Toggle */}
              <nav aria-label="Mobile Primary Links" className="space-y-[8px]">
                {onOpenCommandPalette && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSheetOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="btn-press min-h-[48px] w-full px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] flex items-center justify-between text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] cursor-pointer"
                  >
                    <span className="flex items-center gap-[10px]">
                      <Search strokeWidth={1.5} className="w-[16px] h-[16px] text-[#E5542B]" />
                      <span>Search tools...</span>
                    </span>
                    <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9B9B95]">
                      Quick jump
                    </span>
                  </button>
                )}

                <a
                  href="/tools"
                  onClick={(e) => handleLinkClick(e, '/tools')}
                  className="min-h-[48px] w-full px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] flex items-center justify-between text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]"
                >
                  <span>All Tools</span>
                  <span aria-hidden="true" className="text-[#6B6B66] dark:text-[#9B9B95]">
                    →
                  </span>
                </a>
                <a
                  href="/blog"
                  onClick={(e) => handleLinkClick(e, '/blog')}
                  className="min-h-[48px] w-full px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] flex items-center justify-between text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]"
                >
                  <span>Blog & Guides</span>
                  <span aria-hidden="true" className="text-[#6B6B66] dark:text-[#9B9B95]">
                    →
                  </span>
                </a>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="min-h-[48px] w-full px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] flex items-center justify-between text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]"
                >
                  <span>About</span>
                  <span aria-hidden="true" className="text-[#6B6B66] dark:text-[#9B9B95]">
                    →
                  </span>
                </a>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn-press min-h-[48px] w-full px-[14px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] flex items-center justify-between text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] cursor-pointer"
                >
                  <span>Appearance: {isDark ? 'Dark mode' : 'Light mode'}</span>
                  {isDark ? (
                    <Sun strokeWidth={1.5} className="w-[18px] h-[18px] text-[#E5542B]" />
                  ) : (
                    <Moon strokeWidth={1.5} className="w-[18px] h-[18px] text-[#6B6B66]" />
                  )}
                </button>
              </nav>

              {/* Tools Grouped by Purpose inside the Sheet */}
              <div className="space-y-[20px] pt-[8px] border-t border-[#E7E5E0] dark:border-[#262624]">
                {TOOL_CATEGORIES.map((category) => {
                  const catTools = TOOLS_DATA.filter((t) => t.category === category.name);
                  return (
                    <div key={category.name} className="space-y-[8px] min-w-0">
                      <div className="px-[4px] text-xs font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95]">
                        {category.name}
                      </div>
                      <div className="grid grid-cols-1 gap-[6px]">
                        {catTools.map((tool) => (
                          <a
                            key={tool.slug}
                            href={tool.path}
                            onClick={(e) => handleLinkClick(e, tool.path)}
                            className={`group min-h-[48px] w-full px-[14px] rounded-[10px] border flex items-center justify-between gap-[10px] text-[16px] transition-colors duration-150 min-w-0 ${
                              currentPath === tool.path
                                ? 'border-[#E5542B] bg-white dark:bg-[#161616] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]'
                                : 'border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA]'
                            }`}
                          >
                            <span className="flex items-center gap-[10px] min-w-0 truncate">
                              <ToolGlyph slug={tool.slug} />
                              <span className="truncate">{tool.name}</span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="text-sm text-[#6B6B66] dark:text-[#9B9B95] shrink-0"
                            >
                              →
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </TooltipProvider>
  );
}
