import { siteConfig } from '../../config/site';
import { TOOLS_BY_SLUG, TOOLS_DATA, ToolId } from '../data/tools';
import { BLOG_ARTICLES, BLOG_BY_SLUG } from '../data/blog';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'article';
  ogImage?: string;
  jsonLd: Record<string, unknown>[];
  is404?: boolean;
}

export function normalizePathname(rawPath: string): string {
  const withoutQuery = rawPath.split('?')[0].split('#')[0];
  if (!withoutQuery || withoutQuery === '/') return '/';
  const cleaned = withoutQuery.replace(/\/+$/, '');
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

export function getAllStaticRoutes(): string[] {
  const staticPages = ['/', '/tools', '/blog', '/about', '/contact', '/privacy', '/terms'];
  const toolRoutes = TOOLS_DATA.map((t) => t.path);
  const blogRoutes = BLOG_ARTICLES.map((b) => b.path);
  return [...staticPages, ...toolRoutes, ...blogRoutes];
}

export function getOgImageSlug(pathname: string): string {
  const norm = normalizePathname(pathname);
  if (norm === '/') return 'home';
  return norm.slice(1).replace(/\//g, '-');
}

export function getPageSEO(pathname: string, baseUrl: string = siteConfig.domain): PageSEO {
  const path = normalizePathname(pathname);
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const fullUrl = `${cleanBase}${path === '/' ? '/' : path}`;
  const ogImage = `${cleanBase}/og/${getOgImageSlug(path)}.svg`;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: `${cleanBase}/`,
    description:
      'Free, private, browser-based image utilities to compress, resize, crop, convert, and prepare photos for forms and the web.',
  };

  if (path === '/') {
    return {
      title: `${siteConfig.siteName} – Free Private Browser Image Tools`,
      description:
        'Compress, resize, crop, and convert images directly in your browser. Files never leave your device. Fast, free, and built for everyday forms and web work.',
      canonicalPath: '/',
      ogType: 'website',
      ogImage,
      jsonLd: [websiteSchema],
    };
  }

  if (path === '/tools') {
    return {
      title: `All Free Browser Image Tools – ${siteConfig.siteName}`,
      description:
        'Browse all 14 private, browser-based image utilities: compress to 20KB/50KB/100KB, resize pixels, convert JPG/PNG/WebP, make passport photos, and build PDFs.',
      canonicalPath: '/tools',
      ogType: 'website',
      ogImage,
      jsonLd: [
        websiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
            { '@type': 'ListItem', position: 2, name: 'All Tools', item: fullUrl },
          ],
        },
      ],
    };
  }

  if (path === '/blog') {
    return {
      title: `Image Optimization & Format Guides – ${siteConfig.siteName} Blog`,
      description:
        'Practical guides on reducing image size for exam forms, choosing between JPG, PNG, and WebP, understanding DPI, and taking passport photos at home.',
      canonicalPath: '/blog',
      ogType: 'website',
      ogImage,
      jsonLd: [
        websiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: fullUrl },
          ],
        },
      ],
    };
  }

  if (path === '/about') {
    return {
      title: `About ${siteConfig.siteName} – Local Browser Image Processing`,
      description:
        'Learn how Pixelo processes your photographs, signatures, and documents entirely inside your browser without uploading files to external servers.',
      canonicalPath: '/about',
      ogType: 'website',
      ogImage,
      jsonLd: [
        websiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
            { '@type': 'ListItem', position: 2, name: 'About', item: fullUrl },
          ],
        },
      ],
    };
  }

  if (path === '/contact') {
    return {
      title: `Contact ${siteConfig.siteName} – Support & Feedback`,
      description: `Get in touch with the ${siteConfig.siteName} editorial and engineering team for bug reports, tool requests, or questions.`,
      canonicalPath: '/contact',
      ogType: 'website',
      ogImage,
      jsonLd: [
        websiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: fullUrl },
          ],
        },
      ],
    };
  }

  if (path === '/privacy') {
    return {
      title: `Privacy Policy – ${siteConfig.siteName}`,
      description:
        'Read how Pixelo protects your privacy with 100% local client-side image processing, and learn about cookies, analytics, and advertising policies.',
      canonicalPath: '/privacy',
      ogType: 'website',
      ogImage,
      jsonLd: [websiteSchema],
    };
  }

  if (path === '/terms') {
    return {
      title: `Terms of Service – ${siteConfig.siteName}`,
      description: `Review the Terms of Service and acceptable use guidelines for ${siteConfig.siteName} browser-based image utilities.`,
      canonicalPath: '/terms',
      ogType: 'website',
      ogImage,
      jsonLd: [websiteSchema],
    };
  }

  const slug = path.slice(1) as ToolId;
  if (TOOLS_BY_SLUG[slug]) {
    const tool = TOOLS_BY_SLUG[slug];
    return {
      title: tool.title,
      description: tool.metaDescription,
      canonicalPath: tool.path,
      ogType: 'website',
      ogImage,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${tool.name} – ${siteConfig.siteName}`,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'All (Web Browser)',
          url: fullUrl,
          description: tool.metaDescription,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
            { '@type': 'ListItem', position: 2, name: 'Tools', item: `${cleanBase}/tools` },
            { '@type': 'ListItem', position: 3, name: tool.name, item: fullUrl },
          ],
        },
      ],
    };
  }

  if (path.startsWith('/blog/')) {
    const blogSlug = path.replace('/blog/', '');
    const article = BLOG_BY_SLUG[blogSlug];
    if (article) {
      return {
        title: article.title,
        description: article.metaDescription,
        canonicalPath: article.path,
        ogType: 'article',
        ogImage,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.h1,
            description: article.metaDescription,
            datePublished: article.publishedAt,
            dateModified: article.publishedAt,
            author: {
              '@type': 'Person',
              name: article.authorName,
              jobTitle: article.authorRole,
            },
            publisher: {
              '@type': 'Organization',
              name: siteConfig.siteName,
              url: `${cleanBase}/`,
            },
            mainEntityOfPage: fullUrl,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${cleanBase}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${cleanBase}/blog` },
              { '@type': 'ListItem', position: 3, name: article.h1, item: fullUrl },
            ],
          },
        ],
      };
    }
  }

  return {
    title: `Page Not Found (404) – ${siteConfig.siteName}`,
    description: 'The requested page could not be found. Explore our free browser-based image compression, resizing, and conversion utilities.',
    canonicalPath: path,
    ogType: 'website',
    ogImage: `${cleanBase}/og/404.svg`,
    jsonLd: [websiteSchema],
    is404: true,
  };
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderHeadHtml(seo: PageSEO, baseUrl: string = siteConfig.domain): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const fullUrl = `${cleanBase}${seo.canonicalPath === '/' ? '/' : seo.canonicalPath}`;
  const titleEsc = escapeHtmlAttr(seo.title);
  const descEsc = escapeHtmlAttr(seo.description);
  const urlEsc = escapeHtmlAttr(fullUrl);
  const siteEsc = escapeHtmlAttr(siteConfig.siteName);
  const ogImgEsc = escapeHtmlAttr(seo.ogImage || `${cleanBase}/og/home.svg`);

  const jsonLdScripts = seo.jsonLd
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n    ');

  return `<title>${titleEsc}</title>
    <meta name="description" content="${descEsc}" />
    <link rel="canonical" href="${urlEsc}" />
    <meta property="og:title" content="${titleEsc}" />
    <meta property="og:description" content="${descEsc}" />
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:url" content="${urlEsc}" />
    <meta property="og:site_name" content="${siteEsc}" />
    <meta property="og:image" content="${ogImgEsc}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${titleEsc}" />
    <meta name="twitter:description" content="${descEsc}" />
    <meta name="twitter:image" content="${ogImgEsc}" />
    ${jsonLdScripts}`;
}

export function generateOgImageSvg(title: string, subtitle: string): string {
  const safeTitle = escapeHtmlAttr(title.replace(/\s*–\s*Pixelo.*$/i, '').slice(0, 56));
  const safeSub = escapeHtmlAttr(subtitle.slice(0, 110));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F7F6F3"/>
  <rect x="48" y="48" width="1104" height="534" rx="20" fill="#FFFFFF" stroke="#E7E5E0" stroke-width="2"/>
  <circle cx="108" cy="116" r="10" fill="#E5542B"/>
  <text x="132" y="124" font-family="Georgia, serif" font-size="28" fill="#1A1A1A">Pixelo</text>
  <text x="96" y="290" font-family="Georgia, serif" font-size="58" fill="#1A1A1A">${safeTitle}</text>
  <text x="96" y="360" font-family="system-ui, sans-serif" font-size="24" fill="#6B6B66">${safeSub}</text>
  <text x="96" y="510" font-family="monospace" font-size="20" fill="#E5542B">100% Client-Side Browser Utility · Zero Uploads</text>
</svg>`;
}

export function generateSitemapXml(baseUrl: string = siteConfig.domain): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const routes = getAllStaticRoutes();
  const today = '2026-10-28';

  const urlsXml = routes
    .map((route) => {
      const loc = `${cleanBase}${route === '/' ? '/' : route}`;
      const priority =
        route === '/'
          ? '1.0'
          : route.startsWith('/blog/')
          ? '0.8'
          : route === '/privacy' || route === '/terms'
          ? '0.5'
          : '0.9';
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string = siteConfig.domain): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `User-agent: *
Allow: /

Sitemap: ${cleanBase}/sitemap.xml
`;
}
