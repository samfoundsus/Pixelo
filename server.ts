import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { renderPageHtml } from './src/entry-server';
import { generateSitemapXml, generateRobotsTxt } from './src/lib/seo';
import { siteConfig } from './config/site';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.APP_URL || siteConfig.domain;

  app.get('/ads.txt', (_req, res) => {
    res.type('text/plain').send('');
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(generateRobotsTxt(baseUrl));
  });

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').send(generateSitemapXml(baseUrl));
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Let Vite handle asset or module requests
      if (
        url.startsWith('/src/') ||
        url.startsWith('/@') ||
        url.startsWith('/node_modules/') ||
        url.includes('.')
      ) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const { html, status } = renderPageHtml(url, template, baseUrl);
        res.status(status).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.use('*', (req, res) => {
      const templatePath = path.join(distPath, 'index.html');
      const template = fs.readFileSync(templatePath, 'utf-8');
      const { html, status } = renderPageHtml(req.originalUrl, template, baseUrl);
      res.status(status).set({ 'Content-Type': 'text/html' }).end(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pixelo SSR & Static Server running at http://localhost:${PORT}`);
  });
}

startServer();
