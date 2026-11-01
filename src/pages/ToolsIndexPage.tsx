import React from 'react';
import { TOOLS_DATA, TOOL_CATEGORIES } from '../data/tools';
import { StaggeredH1, ToolGlyph, useScrollReveal } from '../components/Header';
import { BlurFade } from '../components/ui/blur-fade';

interface ToolsIndexPageProps {
  onNavigate: (path: string) => void;
}

export function ToolsIndexPage({ onNavigate }: ToolsIndexPageProps) {
  useScrollReveal('tools-index');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] space-y-[72px] min-w-0">
      <header className="max-w-[680px] space-y-[12px] min-w-0">
        <StaggeredH1
          text="All Browser Image Tools"
          accentWord="Browser"
          className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
        />
        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
          <p className="text-[17px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
            Every utility listed below runs entirely in your browser tab. Choose a tool to compress, resize, crop, convert, or prepare official document photos without uploading your files to any server.
          </p>
        </BlurFade>
      </header>

      <div className="space-y-[72px] min-w-0">
        {TOOL_CATEGORIES.map((cat, catIdx) => {
          const tools = TOOLS_DATA.filter((t) => t.category === cat.name);
          return (
            <BlurFade
              key={cat.name}
              duration={0.34}
              delay={0.04 * catIdx}
              offset={6}
              blur="4px"
              inView={true}
            >
              <section className="space-y-[24px] min-w-0">
                <div className="border-b border-[#E7E5E0] dark:border-[#262624] pb-[12px]">
                  <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]">
                    {cat.name}
                  </h2>
                  <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95] mt-[4px] leading-[1.7]">
                    {cat.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] min-w-0">
                  {tools.map((tool, idx) => (
                    <BlurFade
                      key={tool.slug}
                      duration={0.34}
                      delay={0.04 * idx}
                      offset={6}
                      blur="4px"
                      inView={true}
                      className="min-w-0"
                    >
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
                              <h3 className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                                {tool.name}
                              </h3>
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
                    </BlurFade>
                  ))}
                </div>
              </section>
            </BlurFade>
          );
        })}
      </div>
    </div>
  );
}
