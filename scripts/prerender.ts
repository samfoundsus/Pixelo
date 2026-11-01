import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderPageHtml } from '../src/entry-server';
import {
  getAllStaticRoutes,
  generateSitemapXml,
  generateRobotsTxt,
  getPageSEO,
  getOgImageSlug,
  generateOgImageSvg,
} from '../src/lib/seo';
import { siteConfig } from '../config/site';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

async function runPrerender() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const baseUrl = process.env.APP_URL || siteConfig.domain;
  const routes = getAllStaticRoutes();

  const distOgDir = path.join(distDir, 'og');
  const publicDir = path.resolve(__dirname, '../public');
  const publicOgDir = path.join(publicDir, 'og');
  fs.mkdirSync(distOgDir, { recursive: true });
  fs.mkdirSync(publicOgDir, { recursive: true });

  for (const route of routes) {
    const { html } = renderPageHtml(route, templateHtml, baseUrl);
    if (route === '/') {
      fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8');
    } else {
      const routeDir = path.join(distDir, route.slice(1));
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf-8');
    }

    const seo = getPageSEO(route, baseUrl);
    const ogSlug = getOgImageSlug(route);
    const ogSvg = generateOgImageSvg(seo.title, seo.description);
    fs.writeFileSync(path.join(distOgDir, `${ogSlug}.svg`), ogSvg, 'utf-8');
    fs.writeFileSync(path.join(publicOgDir, `${ogSlug}.svg`), ogSvg, 'utf-8');
  }

  // Also pre-render 404.html for Cloudflare Pages & Vercel static hosting
  const { html: html404 } = renderPageHtml('/404', templateHtml, baseUrl);
  fs.writeFileSync(path.join(distDir, '404.html'), html404, 'utf-8');
  const seo404 = getPageSEO('/404', baseUrl);
  const og404 = generateOgImageSvg(seo404.title, seo404.description);
  fs.writeFileSync(path.join(distOgDir, '404.svg'), og404, 'utf-8');
  fs.writeFileSync(path.join(publicOgDir, '404.svg'), og404, 'utf-8');

  // Generate sitemap.xml, robots.txt, and empty ads.txt in dist/ and public/
  const sitemapXml = generateSitemapXml(baseUrl);
  const robotsTxt = generateRobotsTxt(baseUrl);

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'ads.txt'), '', 'utf-8');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'ads.txt'), '', 'utf-8');

  console.log(`Pre-rendered ${routes.length} static routes + 404.html + per-page OG images + sitemap.xml + robots.txt + ads.txt`);
}

runPrerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
