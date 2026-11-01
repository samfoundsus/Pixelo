import React, { Suspense, lazy } from 'react';
import { Upload, Camera } from 'lucide-react';
import { ToolPageData, TOOLS_BY_SLUG } from '../data/tools';
import { AdSlot } from './AdSlot';
import { StaggeredH1, useScrollReveal } from './Header';
import { BlurFade } from './ui/blur-fade';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import { BRAVE_HELP_LINE } from '../lib/canvas-check';

const LazyToolWorkspace = lazy(() => import('./ToolWorkspace'));

interface ToolShellProps {
  tool: ToolPageData;
  onNavigate: (path: string) => void;
}

function ToolWorkspaceFallback({ toolName }: { toolName: string }) {
  return (
    <section
      aria-label={`${toolName} Workspace`}
      className="mt-[24px] w-full max-w-full min-w-0"
    >
      <div className="relative w-full min-h-[240px] sm:min-h-[280px] rounded-[14px] border border-dashed border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] bg-dot-grid flex flex-col items-center justify-center p-[24px] sm:p-[40px] text-center">
        <div className="w-[48px] h-[48px] rounded-[12px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] flex items-center justify-center mb-[16px]">
          <Upload strokeWidth={1.5} className="w-[20px] h-[20px] text-[#E5542B]" />
        </div>
        <p className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
          Drop your image here, or choose from your device
        </p>
        <p className="mt-[6px] text-xs text-[#6B6B66] dark:text-[#9B9B95]">
          Supports JPG, PNG, WebP, HEIC · Processed 100% locally in your browser
        </p>
        <div className="mt-[20px] flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] w-full sm:w-auto">
          <span className="min-h-[48px] sm:min-h-[42px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center gap-[8px]">
            <Upload strokeWidth={1.5} className="w-[15px] h-[15px]" />
            <span>Choose photos</span>
          </span>
          <span className="min-h-[48px] sm:min-h-[42px] px-[18px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center gap-[8px]">
            <Camera strokeWidth={1.5} className="w-[15px] h-[15px]" />
            <span>Take a photo</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export function ToolShell({ tool, onNavigate }: ToolShellProps) {
  useScrollReveal(tool.slug);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[32px] sm:py-[48px] pb-[128px] sm:pb-[48px] min-w-0">
      {/* Short H1 and one line of subtext, then the tool immediately */}
      <header className="max-w-[680px] min-w-0 space-y-[12px]">
        <StaggeredH1
          text={tool.h1}
          className="font-serif-heading text-[clamp(34px,5vw,56px)] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
        />
        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
          <p className="text-[17px] leading-[1.7] text-[#6B6B66] dark:text-[#9B9B95] break-words">
            {tool.subtitle}
          </p>
        </BlurFade>
      </header>

      {/* Interactive Client-Side Tool Workspace */}
      <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true}>
        <Suspense fallback={<ToolWorkspaceFallback toolName={tool.name} />}>
          <LazyToolWorkspace tool={tool} onNavigate={onNavigate} />
        </Suspense>
      </BlurFade>

      {/* Plain Editorial Article Below (single column ~680px wide, 72px gaps between sections) */}
      <article className="mt-[72px] pt-[72px] border-t border-[#E7E5E0] dark:border-[#262624] max-w-[680px] min-w-0 space-y-[72px] text-[17px] leading-[1.7] text-[#1A1A1A] dark:text-[#EDEDEA]">
        {/* 1. What the tool does & when to use it */}
        <BlurFade duration={0.34} delay={0.04} offset={6} blur="4px" inView={true}>
          <section className="space-y-[16px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              {tool.whatItDoesHeading}
            </h2>
            {tool.whatItDoesParagraphs.map((para, idx) => (
              <p key={idx} className="text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90">
                {para}
              </p>
            ))}
          </section>
        </BlurFade>

        {/* 2. Step-by-step plain numbered list (not cards) */}
        <BlurFade duration={0.34} delay={0.06} offset={6} blur="4px" inView={true}>
          <section className="space-y-[16px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              {tool.howToHeading}
            </h2>
            <ol className="list-decimal pl-[24px] space-y-[16px] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90">
              {tool.steps.map((step, index) => (
                <li key={index} className="pl-[4px]">
                  <strong className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                    {step.title}.
                  </strong>{' '}
                  <span className="text-[#6B6B66] dark:text-[#9B9B95]">{step.detail}</span>
                </li>
              ))}
            </ol>
          </section>
        </BlurFade>

        {/* 3. Tips for best results */}
        <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true}>
          <section className="space-y-[16px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              {tool.tipsHeading}
            </h2>
            <ul className="list-disc pl-[24px] space-y-[12px] text-[#6B6B66] dark:text-[#9B9B95]">
              {tool.tips.map((tip, idx) => (
                <li key={idx} className="pl-[4px]">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </BlurFade>

        {/* 4. Supported formats and limits */}
        <BlurFade duration={0.34} delay={0.1} offset={6} blur="4px" inView={true}>
          <section className="space-y-[12px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              {tool.formatsHeading}
            </h2>
            <p className="text-[#6B6B66] dark:text-[#9B9B95]">{tool.formatsText}</p>
          </section>
        </BlurFade>

        {/* 5. Privacy note */}
        <BlurFade duration={0.34} delay={0.12} offset={6} blur="4px" inView={true}>
          <section className="space-y-[12px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              {tool.privacyHeading}
            </h2>
            <p className="text-[#6B6B66] dark:text-[#9B9B95]">{tool.privacyText}</p>
          </section>
        </BlurFade>

        {/* 6. Frequently Asked Questions using Radix Accordion with forceMount so all answers stay in static HTML */}
        <BlurFade duration={0.34} delay={0.14} offset={6} blur="4px" inView={true}>
          <section className="space-y-[16px] min-w-0">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
              Frequently asked questions
            </h2>
            <Accordion
              type="single"
              collapsible
              className="border-y border-[#E7E5E0] dark:border-[#262624]"
            >
              {tool.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="pt-[8px] text-[15px] text-[#6B6B66] dark:text-[#9B9B95]">
              {BRAVE_HELP_LINE}
            </p>
          </section>
        </BlurFade>

        {/* 7. Related tools as simple text links */}
        <BlurFade duration={0.34} delay={0.16} offset={6} blur="4px" inView={true}>
          <section className="space-y-[16px] pt-[32px] border-t border-[#E7E5E0] dark:border-[#262624] min-w-0">
            <h2 className="font-serif-heading text-[24px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.01em]">
              Related tools
            </h2>
            <ul className="flex flex-wrap gap-x-[24px] gap-y-[12px] text-[15px]">
              {tool.relatedTools.map((relSlug) => {
                const rel = TOOLS_BY_SLUG[relSlug];
                if (!rel) return null;
                return (
                  <li key={rel.slug} className="min-w-0">
                    <a
                      href={rel.path}
                      onClick={(e) => handleLinkClick(e, rel.path)}
                      className="min-h-[48px] inline-flex items-center link-draw text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] transition-colors duration-150"
                    >
                      {rel.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </BlurFade>
      </article>

      <AdSlot slotId={`tool-footer-${tool.slug}`} />
    </div>
  );
}
