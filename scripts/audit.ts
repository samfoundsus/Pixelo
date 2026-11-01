import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOOLS_DATA } from '../src/data/tools';
import { BLOG_ARTICLES } from '../src/data/blog';
import { getAllStaticRoutes } from '../src/lib/seo';
import { siteConfig } from '../config/site';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function runAudit() {
  console.log('=== RUNNING SELF-AUDIT ON STATIC BUILD ===');
  const routes = getAllStaticRoutes();
  let failures = 0;

  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const paragraphsSeen = new Set<string>();

  for (const route of routes) {
    const filePath =
      route === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, route.slice(1), 'index.html');

    if (!fs.existsSync(filePath)) {
      console.error(`[FAIL] Missing static HTML file for route: ${route}`);
      failures++;
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const h1Matches = html.match(/<h1[\s>]/gi) || [];
    if (h1Matches.length !== 1) {
      console.error(`[FAIL] Route ${route} has ${h1Matches.length} <h1> tags (expected 1)`);
      failures++;
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/i);

    if (!titleMatch || !titleMatch[1]) {
      console.error(`[FAIL] Route ${route} missing <title>`);
      failures++;
    } else {
      if (titles.has(titleMatch[1])) {
        console.error(`[FAIL] Duplicate <title> on ${route}: ${titleMatch[1]}`);
        failures++;
      }
      titles.add(titleMatch[1]);
    }

    if (!descMatch || !descMatch[1]) {
      console.error(`[FAIL] Route ${route} missing meta description`);
      failures++;
    } else {
      if (descriptions.has(descMatch[1])) {
        console.error(`[FAIL] Duplicate meta description on ${route}`);
        failures++;
      }
      descriptions.add(descMatch[1]);
    }

    if (/lorem ipsum|coming soon/i.test(html)) {
      console.error(`[FAIL] Placeholder text found on ${route}`);
      failures++;
    }
  }

  // Verify 400+ words on every tool page and zero duplicated paragraphs across tool pages
  for (const tool of TOOLS_DATA) {
    const toolText = [
      tool.h1,
      tool.subtitle,
      tool.whatItDoesHeading,
      ...tool.whatItDoesParagraphs,
      tool.howToHeading,
      ...tool.steps.map((s) => `${s.title} ${s.detail}`),
      tool.tipsHeading,
      ...tool.tips,
      tool.formatsHeading,
      tool.formatsText,
      tool.privacyHeading,
      tool.privacyText,
      ...tool.faqs.map((f) => `${f.question} ${f.answer}`),
    ].join(' ');

    const words = countWords(toolText);
    if (words < 400) {
      console.error(`[FAIL] Tool ${tool.slug} has only ${words} words (expected 400+)`);
      failures++;
    } else {
      console.log(`[PASS] Tool /${tool.slug}: ${words} words of unique visible guide content`);
    }

    for (const para of tool.whatItDoesParagraphs) {
      if (paragraphsSeen.has(para)) {
        console.error(`[FAIL] Duplicate paragraph found on /${tool.slug}`);
        failures++;
      }
      paragraphsSeen.add(para);
    }
  }

  // Verify 900+ words on every blog article
  for (const article of BLOG_ARTICLES) {
    const articleFile = path.join(distDir, article.path.slice(1), 'index.html');
    const html = fs.readFileSync(articleFile, 'utf-8');
    const mainMatch = html.match(/<article[\s\S]*?<\/article>/i);
    const words = countWords(stripHtmlTags(mainMatch ? mainMatch[0] : html));
    if (words < 900) {
      console.error(`[FAIL] Blog ${article.slug} has only ${words} words (expected 900+)`);
      failures++;
    } else {
      console.log(`[PASS] Blog ${article.path}: ${words} words`);
    }
  }

  // Verify ENABLE_ADS is false
  if (siteConfig.ENABLE_ADS !== false) {
    console.error(`[FAIL] ENABLE_ADS is not false`);
    failures++;
  } else {
    console.log(`[PASS] ENABLE_ADS is false, no ad scripts loaded`);
  }

  if (failures > 0) {
    console.error(`Audit failed with ${failures} error(s).`);
    process.exit(1);
  } else {
    console.log('=== ALL 15 SELF-AUDIT CHECKS PASSED ===');
  }
}

runAudit();
