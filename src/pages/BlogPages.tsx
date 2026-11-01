import React from 'react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blog';
import { TOOLS_BY_SLUG } from '../data/tools';
import { AdSlot } from '../components/AdSlot';
import { StaggeredH1, useScrollReveal } from '../components/Header';
import { BlurFade } from '../components/ui/blur-fade';

interface BlogIndexPageProps {
  onNavigate: (path: string) => void;
}

export function BlogIndexPage({ onNavigate }: BlogIndexPageProps) {
  useScrollReveal('blog-index');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] space-y-[48px] min-w-0">
      <header className="max-w-[680px] space-y-[12px] min-w-0">
        <StaggeredH1
          text="Image Optimization & Format Guides"
          accentWord="Optimization"
          className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
        />
        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
          <p className="text-[17px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
            Clear, practical articles explaining how image compression works, how to pass strict online application portal checks, and when to use JPG, PNG, or WebP.
          </p>
        </BlurFade>
      </header>

      <div className="max-w-[680px] divide-y divide-[#E7E5E0] dark:divide-[#262624] border-y border-[#E7E5E0] dark:border-[#262624] min-w-0">
        {BLOG_ARTICLES.map((article, idx) => (
          <BlurFade
            key={article.slug}
            duration={0.34}
            delay={0.04 * idx}
            offset={6}
            blur="4px"
            inView={true}
          >
            <article className="py-[32px] space-y-[12px] min-w-0">
              <div className="flex flex-wrap items-center gap-[8px] text-[12px] text-[#6B6B66] dark:text-[#9B9B95]">
                <span>{article.category}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.publishedAt}>{article.publishedDateFormatted}</time>
                <span aria-hidden="true">·</span>
                <span>{article.readingTime}</span>
              </div>

              <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.18] tracking-[-0.015em]">
                <a
                  href={article.path}
                  onClick={(e) => handleLinkClick(e, article.path)}
                  className="hover:text-[#E5542B] transition-colors duration-150"
                >
                  {article.h1}
                </a>
              </h2>

              <p className="text-[16px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
                {article.excerpt}
              </p>
            </article>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}

interface BlogPostPageProps {
  article: BlogArticle;
  onNavigate: (path: string) => void;
}

export function BlogPostPage({ article, onNavigate }: BlogPostPageProps) {
  useScrollReveal(article.slug);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0">
      <article className="max-w-[680px] space-y-[48px] min-w-0">
        <header className="space-y-[16px] pb-[32px] border-b border-[#E7E5E0] dark:border-[#262624]">
          <div className="flex flex-wrap items-center gap-[8px] text-[12px] text-[#6B6B66] dark:text-[#9B9B95]">
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{article.publishedDateFormatted}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime}</span>
          </div>

          <StaggeredH1
            text={article.h1}
            className="font-serif-heading text-[34px] sm:text-[46px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em] text-balance"
          />

          <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
            <div className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95]">
              By <span className="text-[#1A1A1A] dark:text-[#EDEDEA] font-medium">{article.authorName}</span> · {article.authorRole}
            </div>
          </BlurFade>
        </header>

        {/* Intro Paragraphs */}
        <BlurFade duration={0.34} delay={0.06} offset={6} blur="4px" inView={true}>
          <div className="space-y-[16px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90">
            {article.introParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </BlurFade>

        {/* Structured H2 / H3 Article Sections */}
        <div className="space-y-[72px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90">
          {article.sections.map((sec, sIdx) => (
            <BlurFade
              key={sIdx}
              duration={0.34}
              delay={0.04}
              offset={6}
              blur="4px"
              inView={true}
            >
              <section className="space-y-[16px] min-w-0">
                <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.15] tracking-[-0.015em]">
                  {sec.h2}
                </h2>
                {sec.paragraphs?.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}

                {sec.subsections && (
                  <div className="space-y-[24px] pt-[8px]">
                    {sec.subsections.map((sub, subIdx) => (
                      <div key={subIdx} className="space-y-[8px]">
                        <h3 className="text-[19px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                          {sub.h3}
                        </h3>
                        {sub.paragraphs.map((sp, spIdx) => (
                          <p key={spIdx}>{sp}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {sec.toolCallout && (
                  <div className="my-[24px] py-[16px] border-y border-[#E7E5E0] dark:border-[#262624] flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
                    <p className="text-[15px] text-[#6B6B66] dark:text-[#9B9B95]">
                      {sec.toolCallout.text}
                    </p>
                    <a
                      href={sec.toolCallout.href}
                      onClick={(e) => handleLinkClick(e, sec.toolCallout!.href)}
                      className="btn-press w-full sm:w-auto h-[44px] sm:h-[38px] px-[16px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-[13px] font-medium inline-flex items-center justify-center whitespace-nowrap shrink-0 hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white transition-colors duration-150"
                    >
                      {sec.toolCallout.linkText}
                    </a>
                  </div>
                )}
              </section>
            </BlurFade>
          ))}
        </div>

        {/* Conclusion */}
        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
          <div className="pt-[48px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[16px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90">
            <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] tracking-[-0.015em]">
              Summary
            </h2>
            {article.conclusionParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </BlurFade>

        {/* Related Tools */}
        <BlurFade duration={0.34} delay={0.06} offset={6} blur="4px" inView={true}>
          <div className="pt-[32px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[12px]">
            <h2 className="font-serif-heading text-[24px] text-[#1A1A1A] dark:text-[#EDEDEA]">
              Related tools
            </h2>
            <ul className="flex flex-wrap gap-x-[24px] gap-y-[8px] text-[15px]">
              {article.relatedTools.map((slug) => {
                const tool = TOOLS_BY_SLUG[slug];
                if (!tool) return null;
                return (
                  <li key={tool.slug}>
                    <a
                      href={tool.path}
                      onClick={(e) => handleLinkClick(e, tool.path)}
                      className="link-draw text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]"
                    >
                      {tool.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </BlurFade>
      </article>

      <AdSlot slotId={`blog-footer-${article.slug}`} />
    </div>
  );
}
