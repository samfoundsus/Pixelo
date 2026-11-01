# Pixelo – Private Browser-Based Image Tools

Pixelo is a multi-route, static-generated and server-rendered image utilities website where every tool runs 100% locally in the user's browser using the HTML5 Canvas API and `pdf-lib`. No user images are ever uploaded to a server.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server (Port 3000)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Every route (`/compress-image`, `/resize-image-to-20kb`, `/blog/how-to-reduce-image-size-for-online-form-uploads`, `/privacy`, etc.) is server-rendered on initial request with full HTML content, `<title>`, `<meta name="description">`, OpenGraph tags, and Schema.org JSON-LD.

### 3. Build Static HTML for All Routes

```bash
npm run build
```

This runs `vite build` followed by `tsx scripts/prerender.ts`, which statically generates individual `.html` files for every tool, blog article, legal page, `404.html`, `sitemap.xml`, `robots.txt`, and `ads.txt` inside the `dist/` directory.

### 4. Run the Self-Audit Verification

```bash
npm run audit
```

---

## Deploying to Vercel & Cloudflare Pages

Because `npm run build` outputs pre-rendered static HTML files for every route into `dist/`, you can deploy for free on either **Vercel** or **Cloudflare Pages** without a backend:

### Vercel Deployment Steps
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In the Vercel dashboard, click **Add New → Project** and import your repository.
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Click **Deploy**. Vercel automatically serves the pre-rendered static `<route>/index.html` files, `/sitemap.xml`, `/robots.txt`, `/ads.txt`, and `/404.html`.

### Cloudflare Pages Deployment Steps
1. In the Cloudflare dashboard, go to **Workers & Pages → Create Application → Pages → Connect to Git**.
2. Set **Build command** to `npm run build` and **Build output directory** to `dist`.
3. Click **Save and Deploy**.

---

## How to Add a New Tool Page

1. Open `/src/data/tools.ts` and add your new tool slug to the `ToolId` union type.
2. Append a new `ToolPageData` object to the `TOOLS_DATA` array with:
   - Unique `slug`, `path`, `name`, `category`, `title` (< 60 chars), `metaDescription` (< 160 chars), and `h1`.
   - 450–600 words of original guide content (`whatItDoesParagraphs`, `steps`, `tips`, `formatsText`, `privacyText`, `faqs`, `relatedTools`).
3. Add the client-side processing controls in `/src/components/ToolWorkspace.tsx` and `/src/lib/image-processing.ts`.
4. Run `npm run build && npm run audit`—the static pre-renderer (`scripts/prerender.ts`), `sitemap.xml`, Header dropdown, Footer links, and `/tools` index page automatically include your new tool!

---

## How to Add a New Blog Article

1. Open `/src/data/blog-part2.ts` (or `/src/data/blog.ts`) and append a new `BlogArticle` object with:
   - `slug` and `path` (`/blog/your-slug`)
   - `title` (< 60 chars), `metaDescription` (< 160 chars), `h1`, `excerpt`, `publishedAt`, `readingTime`
   - 900+ words of original content structured into `introParagraphs`, `sections` (with `h2`, `paragraphs`, `subsections`, and `toolCallout` internal links), and `conclusionParagraphs`.
2. Run `npm run build && npm run audit`—the static pre-renderer and `sitemap.xml` will automatically generate `/blog/your-slug/index.html` with `Article` and `BreadcrumbList` JSON-LD.
