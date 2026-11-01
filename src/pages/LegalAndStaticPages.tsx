import React, { useState } from 'react';
import { siteConfig } from '../../config/site';
import { TOOLS_DATA } from '../data/tools';
import { StaggeredH1, ToolGlyph } from '../components/Header';
import { BlurFade } from '../components/ui/blur-fade';

interface StaticPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: StaticPageProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0">
      <article className="max-w-[680px] space-y-[24px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90 min-w-0">
        <StaggeredH1
          text={`About ${siteConfig.siteName}`}
          accentWord={siteConfig.siteName}
          className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
        />

        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true} className="space-y-[24px]">
          <p>
            {siteConfig.siteName} was built by a small team of web performance engineers and imaging editors led by {siteConfig.authorName}. We started this project after watching students, job applicants, and small business owners struggle with a simple problem: every time someone needed to shrink a passport photo under 50 kilobytes, crop a handwritten signature to 20 kilobytes, or combine scanned receipts into a PDF, the top search results forced them to upload private identity documents to remote cloud servers.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[24px] tracking-[-0.015em]">
            Why We Built a 100% Browser-Based Toolkit
          </h2>
          <p>
            In the early days of the web, browsers could only display static pictures, so resizing or converting an image genuinely required a backend server running ImageMagick or Python. Today, modern web browsers ship with hardware-accelerated HTML5 Canvas APIs, typed memory arrays, and client-side PDF builders that can decode and re-encode a 12-megapixel camera file in less than 150 milliseconds right on your laptop or phone.
          </p>
          <p>
            By running every single calculation inside your own browser tab, {siteConfig.siteName} eliminates two problems at once. First, your sensitive files—whether an unredacted driver’s license, a handwritten signature, or unreleased company product mockups—never leave your device. Second, you never wait in a server upload queue or hit a "2 files per day" paywall because your own computer’s processor is doing the work.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[24px] tracking-[-0.015em]">
            How Our Tools Work Under the Hood
          </h2>
          <p>
            When you select a JPG, PNG, or WebP file on any {siteConfig.siteName} page, the browser reads the file locally via the JavaScript FileReader and URL.createObjectURL APIs. Image dimensions, color quantization, luminance grayscale matrices, and watermarks are drawn onto an offscreen 2D canvas and exported back to a downloadable binary blob. For our target-size utilities (20KB, 50KB, and 100KB), a client-side binary search tests multiple JPEG quality steps in memory until it finds the sharpest version that fits strictly beneath your portal’s byte limit.
          </p>

          <div className="pt-[24px] flex flex-col sm:flex-row gap-[12px]">
            <a
              href="/tools"
              onClick={(e) => handleLinkClick(e, '/tools')}
              className="btn-press h-[48px] sm:h-[44px] px-[24px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white transition-colors duration-150"
            >
              Explore all 14 tools
            </a>
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="btn-press h-[48px] sm:h-[44px] px-[24px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[14px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center hover:border-[#E5542B] dark:hover:border-[#E5542B] transition-colors duration-150"
            >
              Contact the team
            </a>
          </div>
        </BlurFade>
      </article>
    </div>
  );
}

export function ContactPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const mailtoHref = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    subject || `Feedback for ${siteConfig.siteName}`
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0">
      <div className="max-w-[680px] space-y-[48px] min-w-0">
        <header className="space-y-[12px]">
          <StaggeredH1
            text={`Contact ${siteConfig.siteName}`}
            accentWord="Contact"
            className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
          />
          <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true}>
            <p className="text-[17px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
              Have a question about an exam portal specification, spotted a browser compatibility issue, or want to suggest a new image utility? We read every message.
            </p>
          </BlurFade>
        </header>

        <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true} className="space-y-[48px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px] py-[24px] border-y border-[#E7E5E0] dark:border-[#262624]">
            <div className="space-y-[4px] min-w-0">
              <div className="text-[14px] text-[#6B6B66] dark:text-[#9B9B95]">Direct email</div>
              <div className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                <a href={`mailto:${siteConfig.contactEmail}`} className="link-draw">
                  {siteConfig.contactEmail}
                </a>
              </div>
              <p className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95] pt-[4px]">
                Email us directly from any mail client. Do not attach sensitive identity documents.
              </p>
            </div>

            <div className="space-y-[4px] min-w-0">
              <div className="text-[14px] text-[#6B6B66] dark:text-[#9B9B95]">Response time</div>
              <div className="text-[16px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                1 to 2 business days
              </div>
              <p className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95] pt-[4px]">
                Monday through Friday between 9:00 AM and 6:00 PM UTC.
              </p>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[20px] sm:p-[32px] space-y-[16px]">
            <h2 className="font-serif-heading text-[24px] text-[#1A1A1A] dark:text-[#EDEDEA]">
              Send a message
            </h2>
            <div>
              <label
                htmlFor="contact-subject"
                className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Question about 20KB signature tool"
                className="w-full h-[44px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-[14px]"
              />
            </div>
            <div>
              <label
                htmlFor="contact-body"
                className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]"
              >
                Message
              </label>
              <textarea
                id="contact-body"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us which browser and device you are using..."
                className="w-full p-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-[14px]"
              />
            </div>
            <a
              href={mailtoHref}
              className="btn-press w-full sm:w-auto h-[48px] sm:h-[40px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white transition-colors duration-150"
            >
              Open in email client
            </a>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0">
      <article className="max-w-[680px] space-y-[24px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90 min-w-0">
        <header className="space-y-[8px] border-b border-[#E7E5E0] dark:border-[#262624] pb-[24px]">
          <StaggeredH1
            text="Privacy Policy"
            accentWord="Privacy"
            className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
          />
          <p className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95]">Last updated: October 28, 2026</p>
        </header>

        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true} className="space-y-[24px]">
          <p>
            At {siteConfig.siteName} ({siteConfig.domain}), privacy is an architectural guarantee, not just a legal promise. This Privacy Policy explains how our website handles your images, what limited technical data is collected when you browse our pages, and how cookies and third-party advertising partners operate.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            1. Local Browser Image Processing (Zero File Uploads)
          </h2>
          <p>
            When you select, drag, compress, resize, crop, watermark, or convert any image or PDF on {siteConfig.siteName}, <strong>your files never leave your device</strong>. All image decoding, pixel manipulation, and file generation occur locally inside your web browser’s memory using the HTML5 Canvas API, Web Workers, and client-side JavaScript libraries. We do not operate file-upload servers, we cannot view or access the images you process, and no copies of your photos or documents are ever transmitted to us or any third party.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            2. Local Storage and Essential Preferences
          </h2>
          <p>
            We use your browser’s localStorage solely to remember your visual interface preference (such as Light Mode or Dark Mode under the key pixelo-theme). This setting stays on your device and does not track you across websites.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            3. Cookies, Analytics, and Log Files
          </h2>
          <p>
            Like most standard websites, our hosting provider records basic, non-identifying HTTP request metadata (such as browser type, referring page, date/time stamp, and anonymized IP address) to prevent abuse and diagnose broken links. We may also use privacy-focused web analytics to understand aggregate page traffic and determine which image guides and utilities are most helpful to readers.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            4. Google AdSense and Third-Party Advertising Vendors
          </h2>
          <p>
            To keep {siteConfig.siteName} free for everyone without paywalls or subscription fees, we may display advertisements served by Google AdSense and certified third-party advertising vendors on content-rich pages. Please note how advertising cookies work:
          </p>
          <ul className="list-disc pl-[24px] space-y-[8px] text-[#6B6B66] dark:text-[#9B9B95]">
            <li>
              Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie) to serve ads based on a user’s prior visits to this website or other websites on the internet.
            </li>
            <li>
              Google’s use of advertising cookies enables it and its partners to serve personalized or non-personalized ads to users based on their visit to {siteConfig.siteName} and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-[#1A1A1A] dark:text-[#EDEDEA]"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of a third-party vendor’s use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-[#1A1A1A] dark:text-[#EDEDEA]"
              >
                www.aboutads.info
              </a>{' '}
              or the Network Advertising Initiative opt-out page.
            </li>
          </ul>
          <p>
            Advertising scripts never have access to the local files or canvas memory you process inside our image tools.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            5. Your Data Protection Rights (GDPR & CCPA)
          </h2>
          <p>
            Depending on your location, you have the right to request information about any personal data we hold (such as if you emailed our support address directly), request deletion of your email correspondence, and manage cookie consent preferences in your browser settings.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            6. Contact Information
          </h2>
          <p>
            If you have any questions about this Privacy Policy or our client-side architecture, please contact us at{' '}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="link-draw text-[#1A1A1A] dark:text-[#EDEDEA]"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </BlurFade>
      </article>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] min-w-0">
      <article className="max-w-[680px] space-y-[24px] text-[17px] leading-[1.7] text-[#1A1A1A]/90 dark:text-[#EDEDEA]/90 min-w-0">
        <header className="space-y-[8px] border-b border-[#E7E5E0] dark:border-[#262624] pb-[24px]">
          <StaggeredH1
            text="Terms of Service"
            accentWord="Terms"
            className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
          />
          <p className="text-[13px] text-[#6B6B66] dark:text-[#9B9B95]">Last updated: October 28, 2026</p>
        </header>

        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true} className="space-y-[24px]">
          <p>
            Welcome to {siteConfig.siteName}. By accessing and using the tools and articles on {siteConfig.domain}, you agree to the following Terms of Service.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            1. Use of Browser Utilities
          </h2>
          <p>
            {siteConfig.siteName} provides client-side image compression, resizing, cropping, format conversion, watermarking, and PDF generation tools free of charge for both personal and commercial use. Because all image processing happens locally on your own hardware, you retain 100% ownership and responsibility for the files you process.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            2. Official Form & Passport Photo Verification
          </h2>
          <p>
            While our Passport Photo Maker and target-kilobyte tools (20KB, 50KB, 100KB) are calibrated to standard international specifications (such as 35×45 mm and 2×2 inches at 300 DPI), individual embassies, examination boards, and recruitment portals may update their specific lighting, background, or pixel rules at any time. Users are responsible for verifying that their final downloaded file meets the official instructions of the agency to which they are applying.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            3. Intellectual Property of Site Content
          </h2>
          <p>
            All written guides, tutorials, interface code, and branding on {siteConfig.siteName} are original works protected by copyright. You may link freely to any tool or article, but you may not scrape or republish our written guides verbatim on another website.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            4. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p>
            The tools on {siteConfig.siteName} are provided "as is" without warranties of any kind. Always keep a backup of your original photographs before overwriting files on your device. In no event shall {siteConfig.siteName} or its authors be liable for any indirect or consequential damages arising from the use of our browser tools.
          </p>

          <h2 className="font-serif-heading text-[26px] sm:text-[32px] text-[#1A1A1A] dark:text-[#EDEDEA] pt-[16px] tracking-[-0.015em]">
            5. Contact
          </h2>
          <p>
            Questions regarding these Terms can be sent to{' '}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="link-draw text-[#1A1A1A] dark:text-[#EDEDEA]"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </BlurFade>
      </article>
    </div>
  );
}

export function NotFoundPage({ onNavigate }: StaticPageProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(path);
  };

  const popularTools = TOOLS_DATA.slice(0, 6);

  return (
    <div className="w-full max-w-[960px] mx-auto px-[20px] sm:px-[32px] py-[48px] sm:py-[72px] space-y-[48px] min-w-0">
      <div className="max-w-[580px] space-y-[16px] min-w-0">
        <StaggeredH1
          text="Page not found"
          accentWord="found"
          className="font-serif-heading text-[36px] sm:text-[48px] text-[#1A1A1A] dark:text-[#EDEDEA] leading-[1.08] tracking-[-0.02em]"
        />
        <BlurFade duration={0.34} delay={0.05} offset={6} blur="4px" inView={true} className="space-y-[16px]">
          <p className="text-[17px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.7]">
            The URL you followed may have been mistyped or moved. Jump directly to one of our image utilities below or return to the home page.
          </p>
          <div className="pt-[8px]">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="btn-press h-[48px] sm:h-[40px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white transition-colors duration-150"
            >
              Return home
            </a>
          </div>
        </BlurFade>
      </div>

      <BlurFade duration={0.34} delay={0.08} offset={6} blur="4px" inView={true}>
        <div className="space-y-[16px] pt-[32px] border-t border-[#E7E5E0] dark:border-[#262624] min-w-0">
          <h2 className="font-serif-heading text-[24px] text-[#1A1A1A] dark:text-[#EDEDEA]">
            Popular tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] min-w-0">
            {popularTools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.path}
                onClick={(e) => handleLinkClick(e, tool.path)}
                className="group p-[20px] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] dark:hover:border-[#E5542B] hover:-translate-y-[2px] transition-all duration-150 min-w-0"
              >
                <div className="flex items-center justify-between gap-[8px]">
                  <div className="flex items-center gap-[8px] min-w-0">
                    <span className="text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] shrink-0">
                      <ToolGlyph slug={tool.slug} />
                    </span>
                    <div className="font-medium text-[15px] text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                      {tool.name}
                    </div>
                  </div>
                  <span aria-hidden="true" className="text-[13px] text-[#6B6B66] group-hover:text-[#E5542B] group-hover:translate-x-[3px] transition-all duration-150 shrink-0">
                    →
                  </span>
                </div>
                <p className="mt-[8px] text-[13px] text-[#6B6B66] dark:text-[#9B9B95] leading-[1.6]">
                  {tool.shortDescription}
                </p>
              </a>
            ))}
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
