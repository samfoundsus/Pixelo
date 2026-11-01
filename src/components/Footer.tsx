import React from 'react';
import { siteConfig } from '../../config/site';
import { TOOLS_DATA, TOOL_CATEGORIES } from '../data/tools';
import { BlurFade } from './ui/blur-fade';
import { BRAVE_HELP_LINE } from '../lib/canvas-check';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="mt-[96px] border-t border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] transition-colors duration-250">
      <BlurFade
        inView={true}
        duration={0.34}
        delay={0.04}
        offset={6}
        blur="4px"
        className="max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0"
      >
        {/* Logo Area & Human Voice Tagline */}
        <div className="pb-[32px] mb-[32px] border-b border-[#E7E5E0] dark:border-[#262624] flex flex-col sm:flex-row sm:items-baseline justify-between gap-[8px]">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="min-h-[48px] inline-flex items-center font-serif-heading text-2xl text-[#1A1A1A] dark:text-[#EDEDEA] hover:text-[#E5542B] transition-colors duration-150"
          >
            {siteConfig.siteName}
          </a>
          <p className="text-sm text-[#6B6B66] dark:text-[#9B9B95]">
            Made in Bihar. Your photos never leave your phone.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[24px] sm:gap-[32px] text-sm min-w-0">
          {TOOL_CATEGORIES.slice(0, 3).map((cat) => (
            <div key={cat.name} className="space-y-[12px] min-w-0">
              <div className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">{cat.name}</div>
              <ul className="space-y-[6px] text-[#6B6B66] dark:text-[#9B9B95]">
                {TOOLS_DATA.filter((t) => t.category === cat.name).map((tool) => (
                  <li key={tool.slug} className="min-w-0">
                    <a
                      href={tool.path}
                      onClick={(e) => handleLinkClick(e, tool.path)}
                      className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                    >
                      {tool.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-[12px] min-w-0">
            <div className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">Site</div>
            <ul className="space-y-[6px] text-[#6B6B66] dark:text-[#9B9B95]">
              {TOOLS_DATA.filter((t) => t.category === 'Documents').map((tool) => (
                <li key={tool.slug} className="min-w-0">
                  <a
                    href={tool.path}
                    onClick={(e) => handleLinkClick(e, tool.path)}
                    className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/blog"
                  onClick={(e) => handleLinkClick(e, '/blog')}
                  className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleLinkClick(e, '/contact')}
                  className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleLinkClick(e, '/privacy')}
                  className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleLinkClick(e, '/terms')}
                  className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[48px] pt-[24px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[12px] text-xs text-[#6B6B66] dark:text-[#9B9B95]">
          <p className="text-[#6B6B66] dark:text-[#9B9B95]">
            {BRAVE_HELP_LINE}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
            <p>© {new Date().getFullYear()} {siteConfig.siteName}. 100% client-side browser utilities.</p>
            <div className="flex items-center gap-[16px]">
              <a
                href="/sitemap.xml"
                className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
              >
                Sitemap
              </a>
              <a
                href="/privacy"
                onClick={(e) => handleLinkClick(e, '/privacy')}
                className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
              >
                Privacy
              </a>
              <a
                href="/terms"
                onClick={(e) => handleLinkClick(e, '/terms')}
                className="inline-flex items-center py-[4px] link-draw hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </BlurFade>
    </footer>
  );
}
