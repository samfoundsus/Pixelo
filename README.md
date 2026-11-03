# Pixelo

Free image tools that run entirely in your browser. Compress, resize, convert, crop, and merge photos into a PDF without uploading anything to a server.

Pixelo has no backend, no accounts, and no file uploads. Every image is processed on the visitor's own device.

---

## Why it exists

Most online image tools upload your photos to someone else's server. That is slow on a weak connection, and it is a bad idea for ID cards, signatures, and documents. Pixelo does the work locally instead, so it is faster, private by design, and works even on a poor network once the page has loaded.

A lot of its tools are built around a specific everyday need in India: getting a photo or signature under a strict size limit (20 KB, 50 KB, 100 KB) for exam and job application forms.

## Tools

| Group | Tool |
| --- | --- |
| Compress | Compress Image |
| Compress | Resize Image to 20 KB |
| Compress | Resize Image to 50 KB |
| Compress | Resize Image to 100 KB |
| Convert | Convert JPG to PNG |
| Convert | Convert PNG to JPG |
| Convert | Convert to WebP |
| Edit | Resize Image |
| Edit | Crop Image |
| Edit | Rotate & Flip Image |
| Edit | Add Watermark |
| Edit | Image to Black & White |
| Documents | Image to PDF |
| Documents | Passport Photo Maker |

Each tool has its own URL and its own written guide, FAQ, and related-tool links, so every page is useful on its own.

## Features

- Fully client-side processing using the Canvas API. Images never leave the device.
- Before/after comparison slider on tools where it makes sense.
- Live size readout showing original size, new size, and percentage saved.
- Exact-size targeting for the 20/50/100 KB tools using an iterative quality and dimension search.
- Batch processing on supported tools.
- Photo intake that works with files picked from the gallery, recents, Google Photos, the camera folder, or taken live with the camera.
- Detection of browser privacy settings (such as Brave Shields) that block canvas access, with a clear message on how to fix it.
- Command search (Cmd/Ctrl+K) to jump between tools.
- Light and dark mode.
- Mobile-first layout with a single menu pattern on all screen sizes.
- Respects `prefers-reduced-motion`.

## Tech stack

- React and TypeScript
- Vite
- Tailwind CSS
- Motion (animation)
- Radix UI and Base UI primitives, in the shadcn/ui style
- Sonner (toasts)
- `pdf-lib` for PDF generation
- A prerender step that outputs a static HTML file for every route, so page text is visible without JavaScript

> Update this list if your `package.json` differs.

## Getting started

### Requirements

- Node.js 20 or newer
- npm (or pnpm / yarn)

### Install

```bash
git clone <your-repo-url>
cd pixelo
npm install
```

### Run locally

```bash
npm run dev
```

Open the local address printed in the terminal.

### Build for production

```bash
npm run build
```

This runs the Vite build and then the prerender script. The finished site is written to the `dist` folder.

### Preview the production build

```bash
npm run preview
```

If your project does not define a `preview` script, serve the `dist` folder with any static server.

## Project structure

The exact layout may differ slightly. This is the general shape:

```
.
├── public/              Static files: favicon, OG images, robots.txt, ads.txt
├── scripts/
│   └── prerender.ts     Generates static HTML for every route
├── src/
│   ├── components/      Shared UI and tool components
│   │   └── ui/          Base components (slider, accordion, toggle group, etc.)
│   ├── lib/
│   │   ├── image-processing.ts   Shared decode, resize, and encode logic
│   │   ├── ingest.ts             File intake (copies files into memory on selection)
│   │   └── canvas-check.ts       Detects blocked or altered canvas access
│   ├── content/         Tool page copy, FAQs, and blog articles
│   ├── pages/           Route components
│   └── config/          Site name, domain, contact email
└── package.json
```

## How it works

1. **Intake.** When a file is chosen, it is copied into memory immediately and the original file handle is never read again. This avoids a common Android problem where photos picked from recents or cloud-backed apps become unreadable a moment later.
2. **Decode.** The image is decoded once and drawn to a working canvas, downscaled to a sensible maximum size to keep memory use low on phones.
3. **Process.** Heavy work (resize, compress, convert, watermark) runs off the main thread where possible, with a main-thread fallback so a tool never dead-ends.
4. **Size targeting.** For the 20/50/100 KB tools, the encoder estimates starting dimensions, binary-searches JPEG quality within a fixed number of iterations, and shrinks dimensions if the target is still missed.
5. **Output.** The result is built as a Blob, previewed, and offered for download. Nothing is sent over the network.

## Content and SEO

The site is meant to be useful to people and readable by search engines.

- Every tool and article has its own URL.
- All page text is present in the prerendered HTML, including FAQ answers.
- Each page has a unique title, meta description, canonical URL, and a single H1.
- Structured data (JSON-LD) is included for the site, tools, FAQs, articles, and breadcrumbs.
- `sitemap.xml` and `robots.txt` are generated at build time.

When you add or edit pages, write original text. Thin or duplicated pages hurt both search ranking and ad approval.

## Adding a new tool

1. Add the tool's processing logic or reuse the shared helpers in `src/lib`.
2. Create the tool page using the shared tool layout.
3. Add its content: a short intro, how-to steps, tips, supported formats, and four or five real FAQs.
4. Register it in the tools list so it appears in the menu, home grid, footer, search, and sitemap.
5. Run `npm run build` and confirm the new page appears in the prerendered output with its full text.

## Adding an article

1. Add the article file to the content folder with its title, description, date, and slug.
2. Write at least 900 words in your own voice and link to relevant tools inside the text.
3. Rebuild and check that the article is in the sitemap.

## Configuration

Site-wide settings live in one config file:

- Site name
- Domain
- Contact email
- Author name
- Accent color
- `ENABLE_ADS` flag (off by default)

## Deployment

Pixelo is a static site, so any static host works.

### Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Deploy, then add your custom domain in the project settings.

### Cloudflare Pages

Use the same build command and output directory. Cloudflare Pages allows commercial sites on its free plan, which makes it a safer long-term home if you turn on ads. Check the current terms of whichever host you choose.

### After deploying

- Open a tool page and use View Source to confirm the page text is in the HTML.
- Submit `sitemap.xml` in Google Search Console.
- Test every tool on a real phone, using photos from the gallery, recents, and the camera.

## Ads

Ads are off by default. The `AdSlot` component renders nothing until `ENABLE_ADS` is set to `true`. Only turn ads on after your site has been approved by the ad network, and keep ads off pages with little content, such as legal pages and the 404 page.

An empty `public/ads.txt` is included. Fill it in once you have your publisher ID.

## Browser support

Works in current versions of Chrome, Edge, Firefox, Safari, Samsung Internet, and Brave.

**Brave users:** Brave Shields can alter or block canvas data, which stops the tools from reading photos. Pixelo detects this and shows a notice. Turning Shields off for the site fixes it.

HEIC photos cannot be decoded by every browser. If a HEIC file fails, set the phone camera to save JPG, or share the photo as a JPG.

## Performance and accessibility

- Heavy components load lazily.
- No layout shift on tool pages.
- Text meets AA contrast in light and dark mode.
- Controls are keyboard accessible and show visible focus states.
- Animations are disabled when the user prefers reduced motion.

## Privacy

Photos are processed in the browser and are never uploaded, stored, or shared. The privacy policy page describes cookies, analytics, and advertising practices. Keep it accurate if you add analytics or ads.

## Known limitations

- Very large photos (above about 25 MB) can be slow on low-end phones.
- Photos still syncing from a cloud gallery may open incomplete. Open the photo in the gallery app first so it finishes downloading.
- Browser privacy extensions that randomize canvas output can reduce image quality or block processing.

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first to discuss the idea. Keep changes small and focused, and check that the production build still prerenders every page.

## License

Add your license here (for example, MIT) and include a `LICENSE` file in the repository root.

## Acknowledgements

Built with help from open-source projects including React, Vite, Tailwind CSS, Radix UI, Base UI, shadcn/ui, Magic UI, Aceternity UI, Motion, Sonner, and pdf-lib. Check each project's license before redistributing its code.
