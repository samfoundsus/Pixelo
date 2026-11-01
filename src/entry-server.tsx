import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { getPageSEO, renderHeadHtml, normalizePathname } from './lib/seo';
import { siteConfig } from '../config/site';

export function renderPageHtml(
  urlPath: string,
  templateHtml: string,
  baseUrl: string = process.env.APP_URL || siteConfig.domain
): { html: string; status: number } {
  const cleanPath = normalizePathname(urlPath);
  const seo = getPageSEO(cleanPath, baseUrl);
  const headHtml = renderHeadHtml(seo, baseUrl);
  const appHtml = renderToString(<App initialPath={cleanPath} />);

  const withHead = templateHtml.replace(
    /<!--SEO_HEAD_START-->[\s\S]*?<!--SEO_HEAD_END-->/,
    `<!--SEO_HEAD_START-->\n    ${headHtml}\n    <!--SEO_HEAD_END-->`
  );

  const finalHtml = withHead.replace('<!--SSR_OUTLET-->', appHtml);

  return {
    html: finalHtml,
    status: seo.is404 ? 404 : 200,
  };
}
