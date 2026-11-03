import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Clock, Search, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { TOOLS_DATA, TOOL_CATEGORIES, ToolPageData } from '../data/tools';
import { BLOG_ARTICLES } from '../data/blog';
import { StaggeredH1, ToolGlyph, useScrollReveal } from '../components/Header';
import { BlurFade } from '../components/ui/blur-fade';
import { Marquee } from '../components/ui/marquee';
import { AnimatedList } from '../components/ui/animated-list';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../components/ui/hover-card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import { getRecentTools } from '../lib/recent-tools';

const LazyCompare = lazy(() => import('../components/ui/compare'));

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenCommandPalette?: () => void;
}

const HOME_FAQS = [
  {
    question: 'Are my photos or identity documents uploaded to any server?',
    answer:
      'No. Every tool on Pixelo runs 100% locally inside your web browser using the HTML5 Canvas API, Web Workers, and client-side encoders. Your images never leave your phone or computer.',
  },
  {
    question: 'How do the 20KB, 50KB, and 100KB tools hit an exact file size?',
    answer:
      'They estimate working pixel dimensions from your byte target and run a fast client-side binary search across JPEG quality steps until the encoded file fits strictly below your portal limit.',
  },
  {
    question: 'Can I compress or convert multiple photos at once on my phone?',
    answer:
      'Yes. The Compress Image, Format Converter, and Image to PDF tools process up to 10 photos sequentially in a background queue so mobile memory stays low and reliable.',
  },
  {
    question: 'Does Pixelo add watermarks or require an account?',
    answer:
      'Never. All 14 utilities are free to use with no signup, no daily limits, and no watermarks unless you explicitly use the Add Watermark tool.',
  },
];

const SUPPORTED_FORMATS_STRIP = [
  { label: 'JPG / JPEG', note: 'Camera & portal standard' },
  { label: 'PNG', note: 'Lossless transparency' },
  { label: 'WebP', note: 'Modern web compression' },
  { label: 'PDF', note: 'Multi-page document merge' },
  { label: 'HEIC / HEIF', note: 'iPhone photos decoded locally' },
  { label: '35×45 mm & 2×2 in', note: 'Passport & visa presets' },
  { label: '20 KB / 50 KB / 100 KB', note: 'Exact byte-target binary search' },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Choose or take a photo',
    detail:
      'Pick any JPG, PNG, WebP, or HEIC photo from Recents, Google Photos, Gallery, or your camera. It is read into browser memory immediately.',
  },
  {
    step: '02',
    title: 'Adjust target size or format',
    detail:
      'Slide quality, pick an exact 20KB/50KB/100KB portal cap, crop to passport dimensions, or arrange pages for a clean PDF.',
  },
  {
    step: '03',
    title: 'Save privately in under a second',
    detail:
      'Compare before and after side-by-side and download your finished file directly—without a single byte ever uploaded to a server.',
  },
];

// Lightweight inline SVG data-URIs for the hero looping before/after Compare demo (zero network requests)
const HERO_BEFORE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" width="640" height="440">
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E9E3D8"/>
        <stop offset="60%" stop-color="#D7CEC0"/>
        <stop offset="100%" stop-color="#C2B6A3"/>
      </linearGradient>
    </defs>
    <rect width="640" height="440" fill="url(#sky1)"/>
    <circle cx="485" cy="118" r="46" fill="#E5542B" opacity="0.88"/>
    <path d="M0 320 L175 190 L330 295 L470 175 L640 290 L640 440 L0 440 Z" fill="#8C8275"/>
    <path d="M120 340 L310 185 L495 320 L640 230 L640 440 L0 440 L0 340 Z" fill="#4E4942"/>
    <rect x="24" y="368" width="228" height="44" rx="8" fill="#1A1A1A" opacity="0.82"/>
    <text x="40" y="395" fill="#F7F6F3" font-family="ui-monospace, monospace" font-size="15" font-weight="500">Original · 2.84 MB</text>
  </svg>`
)}`;

const HERO_AFTER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" width="640" height="440">
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F1EDE4"/>
        <stop offset="60%" stop-color="#DFD7CA"/>
        <stop offset="100%" stop-color="#C9BEB0"/>
      </linearGradient>
    </defs>
    <rect width="640" height="440" fill="url(#sky2)"/>
    <circle cx="485" cy="118" r="46" fill="#E5542B"/>
    <path d="M0 320 L175 190 L330 295 L470 175 L640 290 L640 440 L0 440 Z" fill="#7D7468"/>
    <path d="M120 340 L310 185 L495 320 L640 230 L640 440 L0 440 L0 340 Z" fill="#3B3732"/>
    <rect x="372" y="368" width="244" height="44" rx="8" fill="#2F6B4F"/>
    <text x="388" y="395" fill="#FFFFFF" font-family="ui-monospace, monospace" font-size="15" font-weight="500">Optimized · 142 KB (-95%)</text>
  </svg>`
)}`;

export function HomePage({ onNavigate, onOpenCommandPalette }: HomePageProps) {
  useScrollReveal('home');
  const [recentTools, setRecentTools] = useState<ToolPageData[]>([]);
  const [showDemoCompare, setShowDemoCompare] = useState(false);

  useEffect(() => {
    setRecentTools(getRecentTools());
    setShowDemoCompare(true);
    const onUpdated = () => setRecentTools(getRecentTools());
    window.addEventListener('pixelo-recent-tools-updated', onUpdated);
    return () => window.removeEventListener('pixelo-recent-tools-updated', onUpdated);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  const latestArticles = BLOG_ARTICLES.slice(0, 3);

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] space-y-[72px] min-w-0">
      {/* 1. Hero & Introduction with Looping Before/After Demo */}
      <section className="space-y-[32px] min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] lg:gap-[40px] items-start min-w-0">
          <div className="lg:col-span-7 space-y-[20px] min-w-0">
            <StaggeredH1
              text="Private, precise image tools that run on your own device."
              accentWord="precise"
              className="font-serif-heading text-[38px] sm:text-[52px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.06] tracking-[-0.02em] text-balance"
            />

            <BlurFade duration={0.34} delay={0.04} offset={6} blur="4px" inView={true}>
              <p className="text-[18px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.55]">
                Compress to exact KB targets, resize, crop passport photos, convert formats, and merge PDFs locally in your browser—with zero server uploads.
              </p>
            </BlurFade>

            <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true}>
              <div className="pt-[4px] flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-[12px]">
                <a
                  href="/compress-image"
                  onClick={(e) => handleLinkClick(e, '/compress-image')}
                  className="btn-press h-[48px] sm:h-[44px] px-[24px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-[14px] font-medium inline-flex items-center justify-center transition-colors duration-150 hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white"
                >
                  Compress an image
                </a>
                <a
                  href="/tools"
                  onClick={(e) => handleLinkClick(e, '/tools')}
                  className="btn-press h-[48px] sm:h-[44px] px-[20px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[14px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center transition-colors duration-150 hover:border-[#E5542B] dark:hover:border-[#E5542B]"
                >
                  Browse all 14 tools
                </a>
                {onOpenCommandPalette && (
                  <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="btn-press h-[48px] sm:h-[44px] px-[16px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#141413] text-[13px] text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] hover:border-[#E5542B] inline-flex items-center justify-center gap-[8px] cursor-pointer"
                  >
                    <Search strokeWidth={1.5} className="w-[14px] h-[14px]" />
                    <span>Jump to tool</span>
                    <kbd className="hidden sm:inline-block px-[5px] py-[1px] rounded-[4px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] font-mono text-[10px]">
                      ⌘K
                    </kbd>
                  </button>
                )}
              </div>
            </BlurFade>
          </div>

          {/* Small looping before/after demo (Compare with autoplay, pauses under reduced motion) */}
          <div className="lg:col-span-5 w-full min-w-0">
            <BlurFade duration={0.34} delay={0.1} offset={6} blur="4px" inView={true}>
              <div className="rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[12px] space-y-[10px]">
                <div className="flex items-center justify-between gap-[8px] px-[4px]">
                  <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA] flex items-center gap-[6px]">
                    <ShieldCheck strokeWidth={1.5} className="w-[14px] h-[14px] text-[#2F6B4F] dark:text-[#4EA87D]" />
                    <span>Live quality preview</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#E5542B] font-medium tabular-nums">
                    2.84 MB → 142 KB
                  </span>
                </div>

                {showDemoCompare ? (
                  <Suspense
                    fallback={
                      <div className="w-full aspect-[16/11] rounded-[10px] bg-[#EAE8E2] dark:bg-[#1E1E1C]" />
                    }
                  >
                    <LazyCompare
                      firstImage={HERO_BEFORE_SVG}
                      secondImage={HERO_AFTER_SVG}
                      aspectRatio={640 / 440}
                      slideMode="drag"
                      autoplay={true}
                      autoplayDuration={4200}
                      firstLabel="Before · 2.8 MB"
                      secondLabel="After · 142 KB"
                      className="rounded-[10px]"
                    />
                  </Suspense>
                ) : (
                  <div className="w-full aspect-[16/11] rounded-[10px] bg-[#F7F6F3] dark:bg-[#0E0E0E]" />
                )}

                <div className="flex items-center justify-between px-[4px] text-[11px] text-[#6B6B66] dark:text-[#9B9B95]">
                  <span>Drag slider to inspect detail</span>
                  <span>100% client-side</span>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>

        <BlurFade duration={0.34} delay={0.12} offset={6} blur="4px" inView={true}>
          <div className="max-w-[680px] space-y-[16px] text-[17px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7] pt-[8px]">
            <p>
              Every day, students, designers, and office workers need to shrink a heavy smartphone photo, format a 35×45 mm passport portrait, or get a handwritten signature scan under 20 kilobytes for an online application form. Most free utilities force you to upload your personal photographs and identity documents to a remote cloud server just to change a few pixels, adding unnecessary privacy risks and slow upload queues.
            </p>
            <p>
              {siteConfig.siteName} takes a simpler approach. Every tool on this website runs directly inside your web browser using the HTML5 Canvas API and local client-side encoders. When you drop a JPG, PNG, or WebP file into any workspace below, your computer or phone processes the image in milliseconds and hands you the finished download—without a single byte ever leaving your device.
            </p>
          </div>
        </BlurFade>

        {/* Quiet "Works with" format strip using Magic UI Marquee */}
        <div className="pt-[8px]">
          <div className="flex items-center gap-[12px] mb-[10px]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95] shrink-0">
              Works locally with
            </span>
            <Separator className="flex-1" />
          </div>
          <Marquee pauseOnHover repeat={3} className="[--duration:34s] py-[4px]">
            {SUPPORTED_FORMATS_STRIP.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-[8px] px-[12px] py-[6px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-xs"
              >
                <span className="font-mono font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                  {item.label}
                </span>
                <span className="text-[#6B6B66] dark:text-[#9B9B95]">· {item.note}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* 5. Recent Tools (localStorage in try/catch, hidden if empty, rendered with AnimatedList) */}
      {recentTools.length > 0 && (
        <section
          aria-labelledby="recent-tools-heading"
          className="pt-[48px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[16px] min-w-0"
        >
          <div className="flex items-center justify-between gap-[12px]">
            <h2
              id="recent-tools-heading"
              className="text-sm font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95] inline-flex items-center gap-[6px]"
            >
              <Clock strokeWidth={1.5} className="w-[14px] h-[14px] text-[#E5542B]" />
              <span>Recent tools</span>
            </h2>
            <span className="text-xs text-[#6B6B66] dark:text-[#9B9B95]">
              Saved on this device
            </span>
          </div>

          <AnimatedList
            delay={45}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] min-w-0"
          >
            {recentTools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.path}
                onClick={(e) => handleLinkClick(e, tool.path)}
                className="group min-h-[52px] px-[16px] py-[12px] rounded-[12px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] hover:-translate-y-[2px] transition-all duration-150 flex items-center justify-between gap-[10px] min-w-0"
              >
                <span className="flex items-center gap-[10px] min-w-0 truncate">
                  <ToolGlyph slug={tool.slug} />
                  <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                    {tool.name}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-xs text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150 shrink-0"
                >
                  →
                </span>
              </a>
            ))}
          </AnimatedList>
        </section>
      )}

      {/* 2. "How it works" in three quiet steps */}
      <BlurFade duration={0.34} delay={0.04} offset={6} blur="4px" inView={true}>
        <section
          aria-labelledby="how-it-works"
          className="pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[32px] min-w-0"
        >
          <div className="max-w-[680px]">
            <h2
              id="how-it-works"
              className="font-serif-heading text-[32px] sm:text-[36px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]"
            >
              How it works
            </h2>
            <p className="mt-[6px] text-[16px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.65]">
              Three quiet steps from your phone gallery to a finished, portal-ready file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px] min-w-0">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="p-[20px] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] space-y-[10px] min-w-0"
              >
                <div className="font-mono text-xs font-medium text-[#E5542B]">
                  Step {item.step}
                </div>
                <h3 className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.6]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </BlurFade>

      {/* 3. All Tools Grouped by Purpose */}
      <section
        aria-labelledby="tools-by-purpose"
        className="space-y-[48px] pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] min-w-0"
      >
        <BlurFade duration={0.34} delay={0.04} offset={6} blur="4px" inView={true}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[12px]">
            <div>
              <h2
                id="tools-by-purpose"
                className="font-serif-heading text-[32px] sm:text-[36px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]"
              >
                Tools by purpose
              </h2>
              <p className="mt-[4px] text-[15px] text-[#6B6B66] dark:text-[#9B9B95]">
                Every utility runs locally in your browser with no file-count paywalls.
              </p>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto">
              14 tools · 100% on-device
            </Badge>
          </div>
        </BlurFade>

        <div className="space-y-[48px]">
          {TOOL_CATEGORIES.map((category) => {
            const categoryTools = TOOLS_DATA.filter((t) => t.category === category.name);
            return (
              <div key={category.name} className="space-y-[16px] min-w-0">
                <BlurFade duration={0.34} delay={0.04} offset={6} blur="4px" inView={true}>
                  <div>
                    <h3 className="text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                      {category.name}
                    </h3>
                    <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
                      {category.description}
                    </p>
                  </div>
                </BlurFade>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] min-w-0">
                  {categoryTools.map((tool, idx) => (
                    <BlurFade
                      key={tool.slug}
                      duration={0.34}
                      delay={0.04 * idx}
                      offset={6}
                      blur="4px"
                      inView={true}
                      className="min-w-0"
                    >
                      <HoverCard openDelay={280} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <a
                            href={tool.path}
                            onClick={(e) => handleLinkClick(e, tool.path)}
                            className="group h-full p-[20px] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] hover:-translate-y-[2px] transition-all duration-150 flex flex-col justify-between min-w-0"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-[8px]">
                                <div className="flex items-center gap-[8px] min-w-0">
                                  <span className="text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] transition-colors duration-150 shrink-0">
                                    <ToolGlyph slug={tool.slug} />
                                  </span>
                                  <h4 className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                                    {tool.name}
                                  </h4>
                                </div>
                                <span
                                  aria-hidden="true"
                                  className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150 shrink-0"
                                >
                                  →
                                </span>
                              </div>
                              <p className="mt-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.6]">
                                {tool.shortDescription}
                              </p>
                            </div>
                          </a>
                        </HoverCardTrigger>
                        <HoverCardContent align="start" className="hidden sm:block space-y-[8px]">
                          <div className="flex items-center justify-between gap-[8px]">
                            <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                              {tool.name}
                            </span>
                            <Badge variant="success">On-device</Badge>
                          </div>
                          <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                            {tool.subtitle}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </BlurFade>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why This Site Section */}
      <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
        <section
          aria-labelledby="why-pixelo"
          className="pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[32px] min-w-0"
        >
          <div className="max-w-[680px]">
            <h2
              id="why-pixelo"
              className="font-serif-heading text-[32px] sm:text-[36px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]"
            >
              Why choose {siteConfig.siteName}
            </h2>
            <p className="mt-[8px] text-[17px] leading-[1.7] text-[#6B6B66] dark:text-[#9B9B95]">
              Designed like a quiet desktop utility rather than a cluttered ad farm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] min-w-0">
            <div className="space-y-[8px] min-w-0">
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                100% local privacy
              </h3>
              <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.65]">
                Your photos, signatures, and ID scans never leave your device. There is no upload server and no cloud storage.
              </p>
            </div>

            <div className="space-y-[8px] min-w-0">
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                Zero upload wait time
              </h3>
              <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.65]">
                Because files don’t travel across the internet and back, even multi-megabyte camera photos finish in under a second.
              </p>
            </div>

            <div className="space-y-[8px] min-w-0">
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                Exact KB form solvers
              </h3>
              <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.65]">
                Dedicated 20KB, 50KB, and 100KB tools use binary search so exam and visa portals accept your file on the first try.
              </p>
            </div>

            <div className="space-y-[8px] min-w-0">
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                Free and no signup
              </h3>
              <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.65]">
                No email gates, no daily paywalls, and no surprise watermarks added to your downloaded images or PDFs.
              </p>
            </div>
          </div>
        </section>
      </BlurFade>

      {/* Frequently Asked Questions on Home */}
      <BlurFade duration={0.34} delay={0.06} offset={6} blur="4px" inView={true}>
        <section
          aria-labelledby="home-faq"
          className="pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] max-w-[680px] space-y-[24px] min-w-0"
        >
          <h2
            id="home-faq"
            className="font-serif-heading text-[32px] sm:text-[36px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]"
          >
            Frequently asked questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="border-y border-[#E7E5E0] dark:border-[#262624]"
          >
            {HOME_FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`home-faq-${idx}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </BlurFade>

      {/* Latest Articles */}
      <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true}>
        <section
          aria-labelledby="latest-guides"
          className="pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[32px] min-w-0"
        >
          <div className="flex items-baseline justify-between gap-[16px]">
            <h2
              id="latest-guides"
              className="font-serif-heading text-[32px] sm:text-[36px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]"
            >
              Latest guides
            </h2>
            <a
              href="/blog"
              onClick={(e) => handleLinkClick(e, '/blog')}
              className="link-draw text-[14px] text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
            >
              All articles
            </a>
          </div>

          <div className="divide-y divide-[#E7E5E0] dark:divide-[#262624] border-y border-[#E7E5E0] dark:border-[#262624]">
            {latestArticles.map((article) => (
              <a
                key={article.slug}
                href={article.path}
                onClick={(e) => handleLinkClick(e, article.path)}
                className="block py-[24px] group min-w-0"
              >
                <div className="text-[12px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                  {article.category} · {article.readingTime}
                </div>
                <h3 className="text-[18px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] group-hover:text-[#E5542B] transition-colors duration-150">
                  {article.h1}
                </h3>
                <p className="mt-[8px] text-[15px] leading-[1.65] text-[#6B6B66] dark:text-[#9B9B95] max-w-[680px]">
                  {article.excerpt}
                </p>
              </a>
            ))}
          </div>
        </section>
      </BlurFade>
    </div>
  );
}
