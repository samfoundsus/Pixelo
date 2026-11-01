export type ToolCategory = 'Compress' | 'Convert' | 'Edit' | 'Documents';

export type ToolId =
  | 'compress-image'
  | 'resize-image'
  | 'resize-image-to-20kb'
  | 'resize-image-to-50kb'
  | 'resize-image-to-100kb'
  | 'convert-jpg-to-png'
  | 'convert-png-to-jpg'
  | 'convert-to-webp'
  | 'crop-image'
  | 'image-to-pdf'
  | 'passport-photo-maker'
  | 'rotate-flip-image'
  | 'add-watermark'
  | 'image-to-black-and-white';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolPageData {
  slug: ToolId;
  path: `/${ToolId}`;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  title: string; // Under 60 chars
  metaDescription: string; // Under 160 chars
  h1: string;
  subtitle: string;
  whatItDoesHeading: string;
  whatItDoesParagraphs: string[];
  howToHeading: string;
  steps: { title: string; detail: string }[];
  tipsHeading: string;
  tips: string[];
  formatsHeading: string;
  formatsText: string;
  privacyHeading: string;
  privacyText: string;
  faqs: ToolFAQ[];
  relatedTools: ToolId[];
}

export const TOOLS_DATA: ToolPageData[] = [
  {
    slug: 'compress-image',
    path: '/compress-image',
    name: 'Compress Image',
    category: 'Compress',
    shortDescription: 'Shrink JPG, PNG, and WebP file sizes by up to 80% with a live quality slider and batch processing.',
    title: 'Compress Image Online – Free Local Photo Optimizer | Pixelo',
    metaDescription: 'Reduce JPG, PNG, and WebP file sizes directly in your browser. Batch compress up to 10 photos at once with live size comparisons and zero server uploads.',
    h1: 'Compress Images Without Losing Sharpness',
    subtitle: 'Dial in the exact balance between visual clarity and kilobytes. Process up to 10 JPG, PNG, or WebP files at once directly on your device.',
    whatItDoesHeading: 'What This Image Compressor Does and When to Use It',
    whatItDoesParagraphs: [
      'A modern smartphone camera routinely saves a single snapshot at 4 MB to 9 MB. While that extra data helps if you plan to print a wall poster, it slows down websites, clogs email attachments, and triggers upload errors on work portals. Our browser-based image compressor strips away redundant color data and invisible metadata while keeping edges, skin tones, and text crisp to the human eye.',
      'Unlike cloud utilities that queue your photos on remote servers, this tool runs the quantization math inside your own web browser. You can drag in a single hero banner for a blog post or drop a batch of ten product photographs before updating an online store. As you move the quality slider, you immediately see the original file weight next to the new size and the exact percentage saved.',
      'Use this utility whenever you need faster page load speeds for Core Web Vitals, smaller attachments for client emails, or lighter images for Notion docs and Slack channels. Because you control the compression strength between 10% and 100%, you never have to accept a mystery output that looks blocky or washed out.'
    ],
    howToHeading: 'How to Compress Your Photos Step by Step',
    steps: [
      {
        title: 'Add up to 10 images to the workspace',
        detail: 'Drag and drop your JPG, PNG, or WebP files into the upload frame above, or click the frame to browse your device storage.'
      },
      {
        title: 'Adjust the compression quality slider',
        detail: 'Start around 75% to 82% quality. This sweet spot typically cuts file weight by 55% to 75% without introducing visible artifacts.'
      },
      {
        title: 'Choose whether to keep the original format or switch',
        detail: 'Keep your existing file extension for strict compatibility, or output to WebP if you are publishing photos on a modern website.'
      },
      {
        title: 'Inspect the before-and-after size readout',
        detail: 'Check the live kilobyte comparison card on the right panel to confirm each file meets your size goal while looking sharp.'
      },
      {
        title: 'Save your optimized files',
        detail: 'Click Download on individual photos or download each processed item immediately to your local downloads folder.'
      }
    ],
    tipsHeading: 'Practical Tips for Cleaner Compression Results',
    tips: [
      'For photographs with smooth sky gradients or studio backdrops, keep the quality slider at 78% or higher to prevent subtle color banding.',
      'If a PNG file is still heavy after compression, check whether it actually contains transparency. Photographic PNGs shrink dramatically when saved as JPG or WebP.',
      'Resize oversized dimensions before cranking compression down. Dropping a 4000-pixel photo to 1600 pixels wide at 80% quality looks far cleaner than keeping 4000 pixels at 30% quality.',
      'When preparing images for e-commerce listings, compress all product thumbnails at the same quality setting so visual texture stays consistent across your catalog.'
    ],
    formatsHeading: 'Supported File Formats and Batch Limits',
    formatsText: 'This tool accepts standard JPEG (.jpg, .jpeg), Portable Network Graphics (.png), and WebP (.webp) files. You can queue up to 10 images in a single batch. Files above 25 MB trigger a memory warning so your browser tab remains responsive, though modern desktops can often process larger camera exports. Apple HEIC files are detected automatically with instructions to export them as standard JPEG first.',
    privacyHeading: 'Your Photos Never Leave Your Device',
    privacyText: 'Every byte of compression happens locally inside your browser using the HTML5 Canvas API and native image encoders. We do not run an upload server, we cannot view your images, and nothing is cached in the cloud. You can even disconnect from Wi-Fi after loading this page and compress sensitive work documents or family photos completely offline.',
    faqs: [
      {
        question: 'Why does compressing a PNG sometimes reduce the size less than a JPG?',
        answer: 'Standard PNG is a lossless format designed for flat graphics and transparency. When you compress a complex photograph as PNG, the browser can optimize pixel data, but switching the output mode to JPG or WebP will usually cut the file size by another 60% to 80%.'
      },
      {
        question: 'What quality percentage should I pick for website blog images?',
        answer: 'Between 75% and 82% is ideal for web publishing. At that range, a 3 MB camera photo usually drops under 350 KB while remaining indistinguishable from the original on Retina and 4K screens.'
      },
      {
        question: 'Does compressing an image change its pixel width and height?',
        answer: 'No. By default, this tool keeps your exact pixel dimensions intact and only reduces the data stored per pixel. If you also want to shrink the width or height, use our Resize Image utility.'
      },
      {
        question: 'Is there a daily limit on how many batches I can run?',
        answer: 'None at all. Because your own phone or computer processor handles the work, you can run as many batches of 10 images as you need without paywalls or watermarks.'
      }
    ],
    relatedTools: ['resize-image', 'resize-image-to-100kb', 'convert-to-webp', 'convert-png-to-jpg']
  },
  {
    slug: 'resize-image',
    path: '/resize-image',
    name: 'Resize Image',
    category: 'Edit',
    shortDescription: 'Change photo dimensions by exact pixels or percentage with aspect-ratio locking and common presets.',
    title: 'Resize Image by Pixels or Percentage Online | Pixelo',
    metaDescription: 'Change image width and height by exact pixels or scale percentage in your browser. Lock aspect ratio or use presets for social media, web, and print.',
    h1: 'Resize Image Dimensions by Pixels or Percentage',
    subtitle: 'Scale photos down for faster loading or set exact width and height measurements with one-click aspect ratio locking.',
    whatItDoesHeading: 'Why Pixel Dimensions Matter and How This Resizer Works',
    whatItDoesParagraphs: [
      'File weight in kilobytes is only half the story when preparing visuals; the actual pixel grid—such as 1920 × 1080 or 800 × 600—determines how an image fits inside website layouts, email templates, and application portals. Uploading a 4032 × 3024 phone photo into a 400-pixel profile slot forces the viewer’s browser to download twelve times more pixels than it can actually display.',
      'Our image resizer gives you two straightforward ways to control dimensions. In Exact Pixels mode, you type the target width or height directly, and when Aspect Ratio Lock is active, the matching side calculates automatically so faces and products never look stretched or squashed. In Percentage mode, you can scale an entire high-resolution shoot down to 50% or 25% of its original size in seconds.',
      'We also include built-in presets for Full HD slides (1920 × 1080), standard blog headers (1200 × 630), square thumbnails (1080 × 1080), and classic web embeds (800 × 600). High-quality bicubic interpolation ensures text edges and fine details stay smooth when scaling down.'
    ],
    howToHeading: 'Step-by-Step Guide to Resizing Your Image',
    steps: [
      {
        title: 'Select your image file',
        detail: 'Drop a JPG, PNG, or WebP image into the upload zone or tap to pick one from your photo library.'
      },
      {
        title: 'Pick Pixels or Percentage mode',
        detail: 'Choose Pixels when a form or CMS requires exact measurements (like 1200 × 630 px), or choose Percentage for quick proportional scaling.'
      },
      {
        title: 'Enter dimensions or click a quick preset',
        detail: 'Type your desired width or height. Leave "Lock aspect ratio" checked if you want to prevent distortion, or uncheck it to force custom dimensions.'
      },
      {
        title: 'Verify the new dimensions and file weight',
        detail: 'Check the preview panel to see your old pixel grid compared against the new resolution and resulting file size.'
      },
      {
        title: 'Download the resized image',
        detail: 'Click the primary download button to save your freshly scaled image directly to your computer or phone.'
      }
    ],
    tipsHeading: 'Best Practices When Scaling Photos',
    tips: [
      'Avoid scaling small images upward by more than 120%. Adding pixels to a low-resolution file cannot invent missing camera detail and will make edges look soft.',
      'If an online portal asks for specific dimensions that do not match your photo’s shape (for example, turning a rectangular photo into a square), use our Crop Image tool first so the image does not stretch.',
      'For full-width website hero images, 1920 pixels wide is plenty for desktop monitors; going wider rarely improves visual quality but doubles download time.',
      'Keep output quality around 88% when resizing down so freshly resampled edges stay crisp.'
    ],
    formatsHeading: 'Supported Formats and Resolution Limits',
    formatsText: 'You can resize JPG, PNG, and WebP images up to 10,000 × 10,000 pixels depending on your device’s available RAM. Transparent backgrounds in PNG and WebP files are preserved automatically during resampling. Files larger than 25 MB display a heads-up warning before processing.',
    privacyHeading: 'Local Browser Resampling With Zero Uploads',
    privacyText: 'All dimension changes are rendered on your device hardware using your browser’s 2D canvas context with high-quality image smoothing enabled. No image data is transmitted over the internet, making this tool safe for internal company screenshots, ID scans, and unreleased product mockups.',
    faqs: [
      {
        question: 'Why does my image look stretched when I enter both width and height?',
        answer: 'Stretching happens when your new width-to-height ratio differs from the original photo. Keep "Lock aspect ratio" enabled so changing the width automatically calculates the proportional height, or crop the photo to your target shape first.'
      },
      {
        question: 'Does resizing an image also reduce its file size in KB or MB?',
        answer: 'Yes, significantly. Cutting an image’s width and height in half reduces the total number of pixels by 75% (for example, from 12 megapixels down to 3 megapixels), which naturally drops the file size.'
      },
      {
        question: 'Can I resize a transparent PNG without losing the clear background?',
        answer: 'Yes. When you upload a PNG with an alpha channel and keep PNG (or WebP) selected as the output format, the transparent areas remain completely clear.'
      },
      {
        question: 'What is the difference between resizing and cropping?',
        answer: 'Resizing keeps the entire scene intact and changes how many pixels are used to draw it. Cropping trims away outer edges of the photo to reframe the subject or change the aspect ratio.'
      }
    ],
    relatedTools: ['crop-image', 'compress-image', 'resize-image-to-50kb', 'passport-photo-maker']
  },
  {
    slug: 'resize-image-to-20kb',
    path: '/resize-image-to-20kb',
    name: 'Resize Image to 20KB',
    category: 'Compress',
    shortDescription: 'Automatically shrink signature scans, thumb impressions, and ID photos to under 20 KB for exam portals.',
    title: 'Resize Image to 20KB Online – For Signatures & Exam Forms',
    metaDescription: 'Compress signature scans, thumb impressions, and passport photos to 20KB or less for online exam and job forms. Private, accurate client-side tool.',
    h1: 'Resize Image to 20KB for Exam Forms',
    subtitle: 'Built for students and applicants uploading handwritten signatures, thumb impressions, and small ID photos to strict 10KB–20KB portal limits.',
    whatItDoesHeading: 'Why Exam Portals Demand 20KB Files and How We Hit the Target',
    whatItDoesParagraphs: [
      'If you have ever filled out a national entrance exam, civil service registration, banking recruitment form, or university admission portal at eleven o’clock at night, you know how frustrating the signature upload step can be. Most government and testing portals enforce a rigid 10 KB to 20 KB ceiling for scanned signatures and left-thumb impressions. If your phone photo is 21.4 KB, the portal rejects it immediately.',
      'Guessing with a manual quality slider wastes time because standard camera files contain thousands of extra pixels that can never fit inside 20 kilobytes on quality compression alone. Our 20KB target tool solves this automatically: it runs an iterative binary search inside your browser, testing compression levels and, when necessary, gently stepping down excessive pixel dimensions until the output lands safely at or just under 20 KB.',
      'This makes it reliable for handwritten black-or-blue ink signatures on white paper, thumbprint scans, and compact candidate photographs. You see the exact final byte count—such as 18.6 KB—before you click download, so your portal upload succeeds on the first try.'
    ],
    howToHeading: 'How to Shrink Your Signature or Photo Under 20KB',
    steps: [
      {
        title: 'Upload your signature scan or candidate photo',
        detail: 'Select the photo of your signature, thumb impression, or ID portrait from your phone or computer.'
      },
      {
        title: 'Confirm the 20 KB target ceiling',
        detail: 'The target is pre-configured to 20 KB. If your specific form requires between 10 KB and 20 KB, our solver aims right for the 15 KB–19.5 KB window.'
      },
      {
        title: 'Let the iterative solver find the cleanest settings',
        detail: 'Within a fraction of a second, the tool tests multiple JPEG encoding passes to retain maximum ink legibility while staying below 20,480 bytes.'
      },
      {
        title: 'Check readability and final kilobyte count',
        detail: 'Verify in the preview panel that your handwritten name or portrait features are clear and that the green badge confirms a size under 20 KB.'
      },
      {
        title: 'Download the portal-ready JPG file',
        detail: 'Save the resulting JPG file and upload it directly to your exam or recruitment application portal.'
      }
    ],
    tipsHeading: 'Tips for Crystal-Clear Signature and Thumb Uploads',
    tips: [
      'Sign on plain, unruled white paper using a dark blue or black ballpoint pen, and take the photo near a window in daylight so no dark phone shadow falls across the paper.',
      'Crop closely around the signature before or during upload. Removing huge margins of empty paper lets the 20 KB budget go entirely toward keeping your handwriting sharp.',
      'Always double-check whether your exam notification asks for 140 × 60 pixels. Keeping the signature box wide and short matches standard portal preview boxes.',
      'If your original file is already 12 KB, you do not need to compress it further unless the portal rejects PNG files and requires a .jpg extension.'
    ],
    formatsHeading: 'Supported Input Formats and Exam Portal Compatibility',
    formatsText: 'You can upload JPG, JPEG, PNG, or WebP files taken on any smartphone or flatbed scanner. The tool always exports a baseline standard JPEG (.jpg) file, which is the universal format required by SSC, UPSC, IBPS, state public service portals, and university admission systems.',
    privacyHeading: 'Safe for Personal Signatures and Identity Documents',
    privacyText: 'Your handwritten signature and identity photo are sensitive personal records. Unlike public websites that upload your signature to a remote cloud server, Pixelo processes every pass right inside your device memory. Your signature never leaves your phone or laptop.',
    faqs: [
      {
        question: 'My form asks for a file size between 10 KB and 20 KB. Will this tool make it too small?',
        answer: 'No. Our iterative algorithm specifically aims for the upper part of the safe zone—typically 16 KB to 19.6 KB—so your file satisfies both the minimum 10 KB floor and the maximum 20 KB ceiling.'
      },
      {
        question: 'Why did the tool slightly reduce my image pixel width to reach 20KB?',
        answer: 'A 12-megapixel camera image (4000 × 3000 pixels) cannot physically fit inside 20 KB even at 1% JPEG quality. Stepping the dimensions down to a sensible web resolution allows us to use a much higher JPEG quality so your signature stays sharp instead of blocky.'
      },
      {
        question: 'Can I upload a PNG screenshot of my signature?',
        answer: 'Yes. Upload your PNG screenshot and the tool will automatically flatten any transparent pixels onto a clean white background and convert it to a compliant 20 KB JPG.'
      },
      {
        question: 'What if the portal asks for 20 KB to 50 KB instead?',
        answer: 'If your portal allows up to 50 KB—which is common for passport-style face photographs—use our Resize Image to 50KB tool so your portrait keeps extra facial detail.'
      }
    ],
    relatedTools: ['resize-image-to-50kb', 'resize-image-to-100kb', 'passport-photo-maker', 'crop-image']
  },
  {
    slug: 'resize-image-to-50kb',
    path: '/resize-image-to-50kb',
    name: 'Resize Image to 50KB',
    category: 'Compress',
    shortDescription: 'Hit the exact 20KB–50KB sweet spot required for candidate passport photos on online application portals.',
    title: 'Resize Image to 50KB Online – Exam & Passport Photo Tool',
    metaDescription: 'Automatically compress candidate photos and ID cards to under 50KB for online registration forms, college applications, and government portals.',
    h1: 'Resize Image to 50KB for Online Portals',
    subtitle: 'Automatically tune JPEG compression and resolution so your portrait photo lands cleanly between 35 KB and 49 KB without guesswork.',
    whatItDoesHeading: 'The Standard 50KB Limit for Applicant Photographs',
    whatItDoesParagraphs: [
      'Across hundreds of university admission systems, professional licensing boards, scholarship portals, and civil recruitment websites, 50 KB is the standard maximum file size for a candidate’s face photograph. Typically, the instructions ask for a recent passport-style portrait measuring between 20 KB and 50 KB in JPG format. When you snap a portrait on a modern phone or receive a studio file via email, that file is usually 1.5 MB to 5 MB—roughly fifty times larger than allowed.',
      'Trying to hit 48 KB in a desktop image editor takes endless trial and error. Our 50KB photo resizer automates the entire calculation. When you select your portrait, the browser runs a multi-step binary search across quality parameters and resolution scales until the output file lands securely below 50 KB while preserving clear eyes, natural skin tones, and readable glasses or collar edges.',
      'Whether you are uploading an ID card photo for a campus badge, submitting a competitive exam form, or attaching a profile picture to an HR onboarding portal, this utility delivers a compliant JPG file in under two seconds.'
    ],
    howToHeading: 'How to Compress a Photo to Under 50KB',
    steps: [
      {
        title: 'Choose your portrait or document photo',
        detail: 'Drop your JPG, PNG, or WebP photograph into the upload box above, or tap to choose from your phone gallery.'
      },
      {
        title: 'Keep the target locked at 50 KB (or fine-tune if needed)',
        detail: 'The tool defaults to a strict 50 KB maximum ceiling, targeting the 40 KB to 49 KB range for maximum clarity.'
      },
      {
        title: 'Review the automatic binary-search result',
        detail: 'The tool evaluates multiple encoding passes in your browser and displays the exact output size alongside a live visual preview.'
      },
      {
        title: 'Confirm facial clarity and dimensions',
        detail: 'Make sure your face is centered and sharp in the right-hand preview pane.'
      },
      {
        title: 'Download your compliant 50KB JPG',
        detail: 'Click the download button to save the ready-to-upload .jpg image to your device.'
      }
    ],
    tipsHeading: 'Tips for Getting Accepted on Strict Registration Portals',
    tips: [
      'Frame your head and shoulders before compressing. If your photo shows you standing from the waist up, use our Passport Photo Maker or Crop Image tool first so your face fills 70% of the frame.',
      'Stand facing a window or soft room light so both ears and both sides of your face are evenly lit without harsh nose shadows.',
      'Avoid wearing tinted glasses or hats, as automated portal face-checkers often flag glare on spectacles even when the file is under 50 KB.',
      'Check the file extension required by your portal: almost all exam systems expect a lowercase .jpg file, which this tool provides automatically.'
    ],
    formatsHeading: 'Supported Formats and Output Specifications',
    formatsText: 'Input files can be JPG, PNG, or WebP up to 25 MB (with a friendly warning for larger camera RAW exports converted to PNG/JPG). The output is always a universally compatible sRGB baseline JPEG (.jpg) guaranteed not to exceed 50,000 bytes.',
    privacyHeading: 'Complete Privacy for Applicant Portraits',
    privacyText: 'Candidate photographs often include printed names and dates on the chest placard or sensitive biometric facial framing. Because all compression runs inside your own web browser via JavaScript and HTML5 Canvas, your portrait is never uploaded to any external server or database.',
    faqs: [
      {
        question: 'My form requires the photo to be between 20 KB and 50 KB. Will this work?',
        answer: 'Yes. The solver specifically targets the upper band between 38 KB and 49 KB whenever the source image has enough detail, keeping you comfortably above the 20 KB minimum and below the 50 KB ceiling.'
      },
      {
        question: 'Does this tool keep my photo in color?',
        answer: 'Yes, full 24-bit sRGB color is preserved. If your application specifically asks for a monochrome photo, you can run it through our Image to Black and White tool first.'
      },
      {
        question: 'Why did my 4 MB studio photo shrink to 47 KB without looking blurry?',
        answer: 'Studio files contain thousands of pixels meant for large paper prints. By scaling the pixel grid to standard portrait dimensions and applying smart chroma quantization, 47 KB is more than enough data for a crisp passport-sized image.'
      },
      {
        question: 'What if I also need to resize my signature to under 20 KB?',
        answer: 'We have a dedicated Resize Image to 20KB page tuned specifically for the smaller 10 KB–20 KB signature and thumbprint limits.'
      }
    ],
    relatedTools: ['resize-image-to-20kb', 'resize-image-to-100kb', 'passport-photo-maker', 'crop-image']
  },
  {
    slug: 'resize-image-to-100kb',
    path: '/resize-image-to-100kb',
    name: 'Resize Image to 100KB',
    category: 'Compress',
    shortDescription: 'Compress scanned certificates, visa portraits, and ID documents to under 100 KB while keeping text legible.',
    title: 'Resize Image to 100KB Online – For Documents & Visa Forms',
    metaDescription: 'Shrink scanned certificates, mark sheets, ID cards, and visa photos to under 100KB in your browser. Keeps small printed text sharp and readable.',
    h1: 'Resize Image to 100KB for Documents',
    subtitle: 'Keep small printed text, official stamps, and high-detail visa portraits sharp while staying strictly under the 100 KB upload limit.',
    whatItDoesHeading: 'When You Need a 100KB Image Without Blurry Text',
    whatItDoesParagraphs: [
      'While candidate face photos often cap out at 50 KB, online portals usually set a 100 KB limit for wider documents—such as scanned mark sheets, birth certificates, address proofs, category certificates, and high-resolution international visa portraits (like US DS-160 or Schengen e-visa uploads). A typical phone photo of an A4 certificate weighs 3.5 MB, which is thirty-five times too heavy for the upload field.',
      'Shrinking a document scan is trickier than shrinking a portrait because if you lower the resolution too aggressively, small serial numbers, dates, and embossed seals become unreadable. A human verifier reviewing your application will reject an illegible certificate just as quickly as an oversized file.',
      'Our 100KB target compressor prioritizes resolution retention first. It searches for the highest possible JPEG quality setting at your existing pixel dimensions, and only scales dimensions down in gentle increments if your camera file is so huge that 100 KB cannot hold it cleanly. The result is a crisp, readable document or portrait that lands right around 85 KB to 98 KB.'
    ],
    howToHeading: 'How to Compress Your Document or Photo Under 100KB',
    steps: [
      {
        title: 'Drop your scanned document or portrait into the tool',
        detail: 'Select a JPG, PNG, or WebP photo of your certificate, ID card, or visa photograph.'
      },
      {
        title: 'Verify the 100 KB target setting',
        detail: 'The target is pre-set to 100 KB so your output stays safely below the 102,400-byte limit.'
      },
      {
        title: 'Inspect fine print in the live preview',
        detail: 'Check the preview panel on the right to ensure registration numbers, dates, and signatures on your document remain sharp.'
      },
      {
        title: 'Check the final kilobyte badge',
        detail: 'Confirm the green size indicator shows a final file weight between 75 KB and 99 KB.'
      },
      {
        title: 'Download your optimized JPG',
        detail: 'Click Download to save the file locally and attach it to your application form.'
      }
    ],
    tipsHeading: 'How to Keep Scanned Certificates Readable Under 100KB',
    tips: [
      'Trim away the tabletop or bedsheet around your paper document before compressing. If 30% of the photo is wood grain around the page, those textures waste valuable kilobytes.',
      'Place the document flat on a table near natural daylight and hold your phone directly parallel to the page so the text does not warp at an angle.',
      'If a portal allows either JPG or PDF for multi-page certificates, check whether combining them in our Image to PDF tool is required for multi-page uploads.',
      'Never use camera flash on laminated certificates or glossy ID cards; glare washes out text and creates high-contrast artifacts.'
    ],
    formatsHeading: 'Supported Files and Output Standards',
    formatsText: 'Accepts JPG, JPEG, PNG, and WebP inputs. Outputs a clean, standard sRGB JPEG (.jpg) file under 100 KB. If you upload a PNG screenshot of a digital certificate, transparent regions are automatically backed with crisp white paper fill.',
    privacyHeading: 'Confidential Document Processing on Your Own Device',
    privacyText: 'Mark sheets, tax slips, driver’s licenses, and passport bio pages contain private identity numbers that should never be uploaded to third-party compression websites. Here, all encoding happens inside your browser’s local memory—nothing is ever sent over the network.',
    faqs: [
      {
        question: 'Why is the small text on my certificate still readable at 95 KB?',
        answer: 'Our algorithm keeps pixel dimensions as high as possible (typically 1200 to 1600 pixels along the longest edge) before adjusting chroma compression. Since human eyes read text primarily through brightness contrast rather than color saturation, the text stays sharp.'
      },
      {
        question: 'My form asks for 50 KB to 100 KB. Will the file be above 50 KB?',
        answer: 'For standard camera photos and scans, our binary search targets 85 KB to 98 KB, placing your file squarely inside the 50 KB–100 KB requirement.'
      },
      {
        question: 'Can I use this for web blog thumbnails too?',
        answer: 'Absolutely. Keeping blog featured images and product cards under 100 KB is a classic benchmark for fast mobile page loads and strong Lighthouse scores.'
      },
      {
        question: 'What if my portal requires a PDF under 100 KB instead of a JPG?',
        answer: 'First compress your document image here to under 85 KB, download the JPG, and then drop that compressed JPG into our Image to PDF tool to wrap it in a lightweight PDF container.'
      }
    ],
    relatedTools: ['resize-image-to-50kb', 'resize-image-to-20kb', 'image-to-pdf', 'crop-image']
  },
  {
    slug: 'convert-jpg-to-png',
    path: '/convert-jpg-to-png',
    name: 'Convert JPG to PNG',
    category: 'Convert',
    shortDescription: 'Convert JPEG images into lossless PNG files so repeated edits and overlays never add compression artifacts.',
    title: 'Convert JPG to PNG Online – Free Browser Converter | Pixelo',
    metaDescription: 'Turn JPG and JPEG files into lossless PNG images directly in your browser. Fast, private conversion with zero server uploads and batch support.',
    h1: 'Convert JPG to PNG in Your Browser',
    subtitle: 'Transform standard JPEG photos into lossless PNG files for graphic design workflows, UI mockups, and systems that require .png uploads.',
    whatItDoesHeading: 'When and Why You Should Convert a JPG File to PNG',
    whatItDoesParagraphs: [
      'JPEG and PNG were built for two very different jobs. JPEG uses lossy compression to make camera photographs compact, which means every time you open a JPG, edit it, and save it again, the image loses a little more clarity—a problem designers call generation loss. PNG (Portable Network Graphics), on the other hand, uses lossless Deflate compression: once an image is in PNG format, you can re-save it twenty times or layer crisp typography over it without introducing fuzzy mosquito noise around letters.',
      'Converting a JPG to PNG is also essential when a software platform, game asset pipeline, icon generator, or legacy corporate portal only accepts .png files. By decoding the JPEG color grid in your browser and re-encoding it into a clean 24-bit/32-bit PNG stream, you get a standards-compliant file immediately.',
      'Keep in mind what this conversion can and cannot do: converting a JPG to PNG stops any future quality loss and gives you an alpha-capable canvas for further editing, though it will not magically restore detail that was already discarded when the original JPG was taken.'
    ],
    howToHeading: 'How to Convert JPG to PNG Step by Step',
    steps: [
      {
        title: 'Select one or up to 10 JPG files',
        detail: 'Drag your .jpg or .jpeg images into the drop zone above, or click to select them from your device.'
      },
      {
        title: 'Automatic lossless PNG encoding',
        detail: 'Your browser immediately decodes the JPEG data and renders a lossless PNG version in memory.'
      },
      {
        title: 'Compare the file size change',
        detail: 'Notice that lossless PNG files are naturally larger in kilobytes than compressed JPGs because PNG stores exact pixel values without lossy shortcuts.'
      },
      {
        title: 'Download your new .png files',
        detail: 'Click the download button to save each converted PNG directly to your computer or phone.'
      }
    ],
    tipsHeading: 'Helpful Notes When Working With Converted PNGs',
    tips: [
      'Expect the file size to grow when converting a camera photo from JPG to PNG—that is normal behavior for lossless storage, not a bug.',
      'Converting a JPG with a white background to PNG does not automatically erase the white background; it creates a PNG where those pixels are still white.',
      'If you plan to add text overlays or watermarks to a JPG, convert or export as PNG when you want the newly added text edges to remain razor-sharp.',
      'Need to go the other way to save disk space? Use our Convert PNG to JPG utility instead.'
    ],
    formatsHeading: 'Supported Input Variants and Batch Capacity',
    formatsText: 'Supports all baseline and progressive JPEG files (.jpg, .jpeg, .jfif) in RGB or grayscale color spaces. You can convert up to 10 files per batch. Output files are standard lossless 32-bit RGBA PNGs.',
    privacyHeading: 'Zero-Upload Format Conversion',
    privacyText: 'All decoding and PNG stream packaging happens right inside your browser tab. Whether you are converting client logos, scanned receipts, or product photography, your files never touch an external server.',
    faqs: [
      {
        question: 'Why is my converted PNG file larger than the original JPG?',
        answer: 'JPG shrinks files by throwing away subtle color variations and grouping pixels into 8×8 blocks. PNG is lossless, meaning it records the exact color of every individual pixel. On complex photographs, lossless storage requires more kilobytes.'
      },
      {
        question: 'Does converting JPG to PNG make the background transparent?',
        answer: 'No. A JPG file has no concept of transparency—what looks like an empty background is actually solid white or gray pixels. Converting to PNG gives the file an alpha channel so you can edit transparency in a design tool, but the existing background pixels remain solid.'
      },
      {
        question: 'Will converting a blurry JPG to PNG make it sharper?',
        answer: 'No format converter can recover details that were already lost in the original file. However, converting to PNG prevents the image from getting any blurrier when you add text, crop it, or re-save it.'
      },
      {
        question: 'Can I convert multiple JPG files at the same time?',
        answer: 'Yes, you can drop up to 10 JPG images into the tool at once and download each converted PNG immediately.'
      }
    ],
    relatedTools: ['convert-png-to-jpg', 'convert-to-webp', 'compress-image', 'add-watermark']
  },
  {
    slug: 'convert-png-to-jpg',
    path: '/convert-png-to-jpg',
    name: 'Convert PNG to JPG',
    category: 'Convert',
    shortDescription: 'Turn heavy PNG screenshots and graphics into lightweight JPG files with customizable background fill.',
    title: 'Convert PNG to JPG Online – Shrink Heavy PNGs | Pixelo',
    metaDescription: 'Convert large PNG files and screenshots into compact JPG images in your browser. Choose custom background colors for transparent areas. No file uploads.',
    h1: 'Convert PNG to JPG and Reduce Size',
    subtitle: 'Turn heavy PNG screenshots and photos into compact, universally accepted JPEG files with custom background fill for transparent areas.',
    whatItDoesHeading: 'Why Converting PNG to JPG Is the Fastest Way to Shrink Screenshots',
    whatItDoesParagraphs: [
      'When you take a screenshot on macOS, Windows, iOS, or Android, or export a frame from Figma or Canva, the operating system almost always saves a PNG file. If that screenshot contains a photograph, a video frame, or a rich gradient, the resulting PNG can easily weigh 4 MB to 12 MB. Worse still, many government forms, banking portals, and legacy content management systems flatly reject .png files and demand a .jpg upload.',
      'Converting that PNG to a high-quality JPG routinely drops the file weight by 70% to 85% in a single step—turning a 5 MB desktop screenshot into a crisp 450 KB JPEG that loads in a blink and passes every upload form check.',
      'What happens if your PNG has a transparent background, like a company logo or a cut-out product photo? Because the JPEG specification does not support transparency, careless converters turn clear pixels pitch black. Our converter lets you pick the exact matte background color—clean white by default, dark charcoal, or any custom hex color—so transparent logos blend cleanly into their new background.'
    ],
    howToHeading: 'How to Convert PNG to JPG Step by Step',
    steps: [
      {
        title: 'Add your PNG images (up to 10 at once)',
        detail: 'Drag and drop your .png files into the upload area or click to browse your device.'
      },
      {
        title: 'Choose a background color for transparent areas',
        detail: 'Leave the background set to pure white (#FFFFFF) for documents and standard web pages, or pick dark/custom colors if your PNG has transparency.'
      },
      {
        title: 'Set your preferred JPEG quality level',
        detail: 'A setting of 85% to 90% preserves sharp UI text on screenshots while shedding up to four-fifths of the original PNG file weight.'
      },
      {
        title: 'Check the size savings and download',
        detail: 'Review the before-and-after kilobyte readout in the preview panel and click Download to save your new .jpg files.'
      }
    ],
    tipsHeading: 'Tips for Clean PNG-to-JPG Conversions',
    tips: [
      'If your PNG contains small interface text or spreadsheet numbers, set the JPEG quality slider to 90% or 92% so letter edges stay crisp.',
      'When converting transparent product cutouts for Amazon or e-commerce marketplaces, keep the background color set to pure white (#FFFFFF) to meet marketplace listing rules.',
      'If you want small file sizes AND you need to keep transparency intact for a modern website, use our Convert to WebP tool instead.',
      'Batch convert up to 10 macOS or iPhone screenshots at once before attaching them to a support ticket or Jira issue.'
    ],
    formatsHeading: 'Supported PNG Types and Output Format',
    formatsText: 'Supports 8-bit paletted PNG, 24-bit RGB PNG, and 32-bit RGBA PNG with full alpha transparency. Exports standard baseline sRGB JPEG (.jpg) files compatible with every browser, phone, and upload portal.',
    privacyHeading: 'Screenshots Stay Private on Your Computer',
    privacyText: 'Screenshots frequently capture browser tabs, email addresses, internal dashboards, or financial figures. Because Pixelo converts your PNGs locally inside your browser using the HTML5 Canvas API, your screenshots are never uploaded to any remote server.',
    faqs: [
      {
        question: 'Why did my transparent background turn white instead of staying clear?',
        answer: 'The JPG file format does not support transparency—every pixel in a JPG must have a solid color. Our tool fills transparent areas with clean white by default (instead of ugly black), and you can pick any custom background color in the left panel.'
      },
      {
        question: 'How much smaller will my file be after converting from PNG to JPG?',
        answer: 'For photographic PNGs and rich screenshots, converting to JPG at 85% quality typically reduces file size by 70% to 88%. Simple flat-color diagrams may shrink less because PNG is already very efficient at solid blocks of color.'
      },
      {
        question: 'Is there any difference between .jpg and .jpeg extensions?',
        answer: 'They are the exact same format. We save files with the three-letter .jpg extension because it is accepted by 100% of strict online application forms.'
      },
      {
        question: 'Can I convert PNG files on my iPhone or Android phone?',
        answer: 'Yes. Open this page in Safari or Chrome on your phone, tap the upload box to select PNG screenshots from your Photos app, and download the converted JPGs right back to your device.'
      }
    ],
    relatedTools: ['convert-jpg-to-png', 'convert-to-webp', 'compress-image', 'image-to-pdf']
  },
  {
    slug: 'convert-to-webp',
    path: '/convert-to-webp',
    name: 'Convert to WebP',
    category: 'Convert',
    shortDescription: 'Convert JPG and PNG images to modern WebP format for faster websites and better Core Web Vitals.',
    title: 'Convert Image to WebP Online – Fast Web Optimizer | Pixelo',
    metaDescription: 'Convert JPG and PNG files to modern WebP format in your browser. Cut website image weights by 30–70% while keeping alpha transparency. Free & private.',
    h1: 'Convert JPG and PNG Images to WebP',
    subtitle: 'Combine the small file sizes of JPEG with the clean transparency of PNG. Built for web developers, bloggers, and store owners.',
    whatItDoesHeading: 'Why WebP Is the Gold Standard for Modern Websites',
    whatItDoesParagraphs: [
      'For decades, web designers had to choose between two imperfect formats: JPG for photographs (small files, no transparency) and PNG for interfaces and logos (supports transparency, but often painfully heavy). WebP—developed for the modern web and now supported by over 97% of all desktop and mobile browsers including Safari, Chrome, Firefox, and Edge—solves both problems in a single container.',
      'Using predictive block coding, a WebP image is typically 25% to 35% smaller than a comparable JPG of the same visual quality, and up to 70% smaller than a photographic PNG with an alpha channel. When Google Lighthouse or PageSpeed Insights flags "Serve images in next-gen formats" on your site audit, converting your hero banners and article graphics to WebP is the exact fix it is asking for.',
      'Our browser-based WebP converter lets you drop up to 10 JPG or PNG files at once, dial in your preferred encoding quality, and immediately inspect how many kilobytes you save per asset before downloading.'
    ],
    howToHeading: 'How to Convert Your Images to WebP',
    steps: [
      {
        title: 'Drop up to 10 JPG or PNG images into the converter',
        detail: 'Drag files from your desktop folder or tap to select assets you are preparing for your website or CMS.'
      },
      {
        title: 'Choose your WebP quality setting',
        detail: 'Set the slider between 78% and 85% for general web photos, or push it to 92% for crisp UI screenshots and transparent product renders.'
      },
      {
        title: 'Verify transparency and kilobyte reduction',
        detail: 'If you uploaded a transparent PNG, check the preview to see that the clear background is preserved at a fraction of the original file weight.'
      },
      {
        title: 'Download your .webp files',
        detail: 'Click Download on individual assets to save them with the .webp extension ready for WordPress, Shopify, Webflow, or Next.js.'
      }
    ],
    tipsHeading: 'Web Performance Tips When Adopting WebP',
    tips: [
      'When replacing transparent PNG product photos on an e-commerce store, converting to WebP at 85% quality often cuts page payload by several megabytes without losing the transparent drop shadow.',
      'Keep quality around 80% for photographic blog images; going to 100% in lossy WebP mode can occasionally produce a file larger than the original JPG.',
      'Remember that while all modern web browsers display WebP effortlessly, older government exam portals still require .jpg—use our Convert PNG to JPG tool for official forms.',
      'Pair WebP conversion with proper pixel sizing in our Resize Image tool so you aren’t serving a 3000-pixel WebP inside a 600-pixel blog column.'
    ],
    formatsHeading: 'Browser Compatibility and Format Support',
    formatsText: 'Accepts JPG, JPEG, PNG, and existing WebP files up to 10 images per batch. Preserves 8-bit alpha transparency from PNG sources automatically. Exports standard .webp files supported by Chrome, Safari (iOS 14+ & macOS Big Sur+), Firefox, and Edge.',
    privacyHeading: 'Local Encoding for Client and Production Assets',
    privacyText: 'Whether you are optimizing unreleased product launch graphics or private client portfolio shots, your images are encoded into WebP locally by your own browser engine. Nothing is uploaded or stored on any server.',
    faqs: [
      {
        question: 'Does WebP keep the transparent background from my PNG file?',
        answer: 'Yes! One of WebP’s biggest advantages over JPG is that it supports full alpha channel transparency even while applying efficient lossy compression to the color channels.'
      },
      {
        question: 'Do Apple iPhones and Safari browsers support WebP images now?',
        answer: 'Yes. Apple added full WebP support in Safari 14 (iOS 14 and macOS Big Sur) back in 2020. Today, virtually every active smartphone, tablet, and desktop browser renders WebP natively.'
      },
      {
        question: 'Why did my file size increase when I set WebP quality to 100%?',
        answer: 'If your source file was already a heavily compressed JPG (say, saved at 65% quality), re-encoding it at 100% WebP instructs the encoder to spend extra bits preserving existing compression blocks. Setting the slider to 80%–85% gives you the expected size reduction.'
      },
      {
        question: 'Can I upload WebP images to WordPress and Shopify?',
        answer: 'Yes. WordPress (version 5.8+), Shopify, Webflow, Ghost, and Squarespace all support uploading .webp files directly to their media libraries.'
      }
    ],
    relatedTools: ['compress-image', 'convert-png-to-jpg', 'convert-jpg-to-png', 'resize-image']
  },
  {
    slug: 'crop-image',
    path: '/crop-image',
    name: 'Crop Image',
    category: 'Edit',
    shortDescription: 'Trim unwanted edges or reframe photos to 1:1, 4:5, 16:9, and 3:2 aspect ratios with an interactive crop frame.',
    title: 'Crop Image Online – Free Aspect Ratio & Freeform Cropper',
    metaDescription: 'Crop JPG, PNG, and WebP photos in your browser. Choose freeform cropping or preset ratios (1:1, 4:5, 16:9, 3:2) with live pixel dimensions.',
    h1: 'Crop Images With Exact Aspect Ratios',
    subtitle: 'Trim distracting backgrounds, center your subject, or lock to 1:1 square, 4:5 portrait, 16:9 widescreen, and 3:2 camera ratios.',
    whatItDoesHeading: 'Why Good Cropping Fixes Composition and Layout Fit',
    whatItDoesParagraphs: [
      'Almost every raw photo benefits from a thoughtful crop. Maybe a passerby stepped into the edge of a travel portrait, maybe your desk tabletop is visible around a scanned signature, or maybe you need a vertical phone photo to fit cleanly inside a 16:9 YouTube thumbnail or a 1:1 LinkedIn profile frame without awkward automatic cutoffs.',
      'Our interactive browser cropper lets you drag the crop handles directly over your photo or click one of our precision aspect ratio presets. As you move or resize the selection frame, a rule-of-thirds grid helps you align horizons and eyes, while a live pixel readout tells you the exact width and height of the cropped region before you commit.',
      'Because cropping trims directly from the original high-resolution image in your browser memory, there is zero unnecessary resampling inside the selected area—your cropped output keeps every pixel of sharpness from the source file.'
    ],
    howToHeading: 'How to Crop an Image Step by Step',
    steps: [
      {
        title: 'Load your photo into the crop workspace',
        detail: 'Drag a JPG, PNG, or WebP file into the drop zone or click to pick an image from your device.'
      },
      {
        title: 'Pick Freeform or a locked aspect ratio',
        detail: 'Click Free to drag each edge independently, or select 1:1 (Square), 4:5 (Social Portrait), 16:9 (Widescreen), 3:2 (Classic Photo), or 4:3.'
      },
      {
        title: 'Position and resize the crop box on the canvas',
        detail: 'Drag inside the highlighted frame to pan across your image, or drag the corner handles to tighten or widen the crop.'
      },
      {
        title: 'Check the exact cropped pixel dimensions',
        detail: 'Look at the live pixel counter in the controls panel to confirm the final width and height of your selection.'
      },
      {
        title: 'Apply and download your cropped image',
        detail: 'Click Download to save the freshly trimmed photo in JPG, PNG, or WebP format.'
      }
    ],
    tipsHeading: 'Composition and Aspect Ratio Tips',
    tips: [
      'Use 1:1 (Square) for profile avatars, marketplace product thumbnails, and team directory headshots so the platform never crops off the top of someone’s head.',
      'Use 4:5 for vertical social feeds; it takes up maximum vertical screen space on mobile phones without getting clipped.',
      'Use 16:9 for presentation slides, video thumbnails, and blog header banners.',
      'When cropping a photo of a paper document or signature, leave a narrow 3% to 5% white margin around the ink so letters do not touch the very edge of the frame.'
    ],
    formatsHeading: 'Supported Formats and Precision Controls',
    formatsText: 'Works with JPG, PNG (preserving transparency), and WebP files. Supports both mouse drag on desktop and single-finger touch dragging on smartphones and tablets.',
    privacyHeading: 'Private Local Cropping in Your Browser',
    privacyText: 'When you crop personal photos—or trim private details out of a screenshot before sharing it—the last thing you want is for the uncropped original to sit on a stranger’s cloud server. With Pixelo, the uncropped original never leaves your device.',
    faqs: [
      {
        question: 'Does cropping an image lower its quality?',
        answer: 'Cropping does not blur the pixels inside your selection, though the total pixel dimensions become smaller because you are removing the outer edges. If you crop down to a tiny fraction of the original photo and blow it up full-screen, you will see fewer total pixels.'
      },
      {
        question: 'What aspect ratio should I use for an Instagram or LinkedIn portrait post?',
        answer: 'Choose the 4:5 ratio for vertical feed portraits and 1:1 for square carousel posts or profile pictures.'
      },
      {
        question: 'What if I need exact millimeter sizes for a passport photo?',
        answer: 'For official 35×45 mm or 2×2 inch passport photos—including printable A4 sheets—use our dedicated Passport Photo Maker tool.'
      },
      {
        question: 'Can I rotate the photo before cropping it?',
        answer: 'If your photo is sideways or slightly tilted, you can straighten or rotate it in our Rotate & Flip Image tool and then crop to perfection.'
      }
    ],
    relatedTools: ['resize-image', 'passport-photo-maker', 'rotate-flip-image', 'compress-image']
  },
  {
    slug: 'image-to-pdf',
    path: '/image-to-pdf',
    name: 'Image to PDF',
    category: 'Documents',
    shortDescription: 'Combine multiple JPG or PNG photos into a single, neatly ordered PDF document with page size and margin controls.',
    title: 'Image to PDF Converter Online – Combine Photos to PDF',
    metaDescription: 'Merge one or multiple JPG and PNG images into a single PDF document directly in your browser. Choose A4, Letter, or Fit-to-Image page sizes privately.',
    h1: 'Combine Images into a Single PDF',
    subtitle: 'Turn phone photos of receipts, multi-page assignments, and ID cards into a clean, ordered PDF document without uploading files.',
    whatItDoesHeading: 'Turn Scattered Photo Scans into One Professional PDF',
    whatItDoesParagraphs: [
      'When an employer, landlord, university portal, or tax accountant asks for a multi-page document—such as a signed lease, a five-page handwritten assignment, or the front and back of an ID card—sending six separate .jpg attachments in an email looks messy and often fails on single-file upload fields. Combining those photos into a single PDF keeps every page in the right reading order and prints cleanly on standard paper.',
      'Our Image to PDF builder loads the lightweight `pdf-lib` engine directly in your browser when you open this page. You can drop in multiple JPG, PNG, or WebP images, reorder pages up or down with one click, and choose how the pages should be laid out: standard A4 paper, US Letter paper, or Fit to Image (where each PDF page matches the exact dimensions of its photo).',
      'You can also choose Portrait or Landscape orientation and add clean white page margins so printers never clip the edges of your scanned notes or receipts.'
    ],
    howToHeading: 'How to Combine Images into a PDF Step by Step',
    steps: [
      {
        title: 'Select all the images you want in your PDF',
        detail: 'Drag multiple JPG, PNG, or WebP files into the upload frame, or add more pages one by one.'
      },
      {
        title: 'Arrange the page order',
        detail: 'Use the Move Up and Move Down arrow buttons next to each thumbnail in the page list so Page 1, Page 2, and Page 3 appear in the exact sequence you want.'
      },
      {
        title: 'Select Page Size, Orientation, and Margins',
        detail: 'Pick A4 or US Letter if the recipient might print the file, or pick Fit to Image for digital viewing on screens.'
      },
      {
        title: 'Generate and download your merged PDF',
        detail: 'Click Build & Download PDF to package all pages into a single .pdf file right on your device.'
      }
    ],
    tipsHeading: 'Tips for Cleaner, Lighter PDF Documents',
    tips: [
      'If you are combining ten high-resolution phone photos and the portal has a strict 2 MB PDF limit, adjust the internal image quality slider to 75% so the entire multi-page PDF stays lightweight.',
      'Use "A4" with "Small Margin" when submitting scanned homework, invoices, or official certificates so every page shares a uniform width when opened in Adobe Acrobat or Chrome.',
      'Check that none of your phone photos are sideways before generating the PDF; if one page is upside down, fix it quickly in our Rotate & Flip Image tool.',
      'Use "Fit to Image" when packaging design mockups or slide decks of mixed dimensions so no extra white bars appear above or below your graphics.'
    ],
    formatsHeading: 'Supported Image Inputs and PDF Output Standards',
    formatsText: 'Accepts JPG, JPEG, PNG, and WebP images. Generates a standards-compliant PDF 1.7 document (.pdf) using client-side `pdf-lib` vector page assembly that opens natively on Windows, macOS, iOS, Android, and Linux.',
    privacyHeading: 'Confidential Contracts and IDs Stay on Your Device',
    privacyText: 'People most often use Image-to-PDF tools for bank statements, signed contracts, medical receipts, and government IDs. Because our PDF generator runs 100% locally in your browser tab, your sensitive documents are never transmitted to any server.',
    faqs: [
      {
        question: 'Can I combine both PNG and JPG files into the same PDF?',
        answer: 'Yes. You can mix JPG photographs, PNG screenshots, and WebP graphics in the same queue, reorder them freely, and merge them into a single PDF file.'
      },
      {
        question: 'Why do some PDF pages look different sizes when I open the file?',
        answer: 'That happens if you select "Fit to Image" and your uploaded photos have different pixel resolutions. Switch the Page Size setting to "A4" or "US Letter" and every page in the PDF will have the exact same physical width and height.'
      },
      {
        question: 'How can I make the final PDF file size smaller in kilobytes?',
        answer: 'Lower the embedded image quality slider in the left control panel to 70% or 75%. That compresses each photo before embedding it into the PDF stream, cutting the total PDF weight dramatically.'
      },
      {
        question: 'Does this tool add watermarks or page limit restrictions?',
        answer: 'Never. There are no watermarks added to your PDF pages, no sign-up forms, and no artificial page limits.'
      }
    ],
    relatedTools: ['resize-image-to-100kb', 'compress-image', 'rotate-flip-image', 'passport-photo-maker']
  },
  {
    slug: 'passport-photo-maker',
    path: '/passport-photo-maker',
    name: 'Passport Photo Maker',
    category: 'Documents',
    shortDescription: 'Create 35×45mm, 2×2 inch, or 51×51mm passport photos and printable A4 multi-copy sheets at home.',
    title: 'Passport Photo Maker Online – 35x45mm, 2x2 Inch & A4 Sheet',
    metaDescription: 'Crop portraits to official passport sizes (35x45mm, 2x2 inch, 51x51mm) in your browser. Export a single digital photo or a printable 300 DPI A4 sheet.',
    h1: 'Make Official Passport Photos at Home',
    subtitle: 'Crop portraits to standard 35×45 mm (UK/EU/India), 2×2 inch (US/Visa), or 51×51 mm specifications, and generate printable A4 multi-photo sheets.',
    whatItDoesHeading: 'How to Create Compliant Digital and Printable Passport Photos',
    whatItDoesParagraphs: [
      'Getting a passport, visa, exam admit card, or driver’s license renewal photo used to mean visiting a photo booth and paying $15 for four small prints. Today, almost every embassy and government portal accepts digital uploads or home-printed portraits—provided the dimensions, resolution, and framing follow official rules.',
      'Our Passport Photo Maker takes the math out of international photo standards. Instead of guessing how many pixels equal 35 × 45 millimeters at 300 DPI, you simply choose your country standard: 35 × 45 mm (413 × 531 px at 300 DPI, used across the UK, European Union, India, Australia, and Japan), 2 × 2 inches (600 × 600 px at 300 DPI, used for US passports and Indian OCI/visas), or 51 × 51 mm.',
      'You can pan and zoom your portrait inside the biometric head-alignment guide, enable subtle background brightening to clean up slightly gray wall lighting, and choose between two outputs: a single digital JPG for online portals, or a ready-to-print 300 DPI A4 sheet containing 8 neatly spaced copies with light scissor cut lines.'
    ],
    howToHeading: 'Step-by-Step Guide to Making Your Passport Photo',
    steps: [
      {
        title: 'Upload a well-lit front-facing portrait',
        detail: 'Stand about half a meter in front of a plain white or off-white wall, look straight into the camera lens at eye level, and load the photo here.'
      },
      {
        title: 'Choose your official size standard',
        detail: 'Select 35 × 45 mm (International/UK/EU/India), 2 × 2 inch (US Passport & Visa), or 51 × 51 mm.'
      },
      {
        title: 'Align your head and shoulders using the zoom and pan sliders',
        detail: 'Position your face centered horizontally so the crown of your head and chin sit comfortably inside the framing guide.'
      },
      {
        title: 'Choose Single Digital Photo or Printable A4 Sheet',
        detail: 'Pick Single Photo if you are uploading to an online form, or pick A4 Print Sheet (8 copies) if you plan to print on glossy photo paper.'
      },
      {
        title: 'Download your high-resolution 300 DPI JPG',
        detail: 'Click Download to save your finished passport image or print sheet immediately.'
      }
    ],
    tipsHeading: 'Rules That Prevent Passport Photo Rejection',
    tips: [
      'Have someone else hold the phone 1.5 meters away and zoom in slightly, rather than taking a close-up arm’s-length selfie. Close-up wide-angle selfies distort nose and ear proportions.',
      'Make sure there are no shadows behind your head on the wall; standing two steps forward from the wall toward a window eliminates harsh backdrop shadows.',
      'Keep a neutral expression with both eyes open, mouth closed, and hair tucked behind your ears so the full oval of your face is visible.',
      'When printing the A4 sheet at home or at a local print shop, select "Actual Size" or "100% Scale" in the print dialog so the 35×45 mm or 2×2 inch physical measurements remain exact.'
    ],
    formatsHeading: 'Output Pixel Dimensions at 300 DPI Print Standard',
    formatsText: 'Exports 300 DPI baseline JPEG (.jpg) files: 35 × 45 mm outputs at 413 × 531 px (or 826 × 1062 px HD); 2 × 2 inch outputs at 600 × 600 px; 51 × 51 mm outputs at 602 × 602 px. The A4 Print Sheet exports at full 2480 × 3508 px (300 DPI A4) with crisp cut guides.',
    privacyHeading: 'Biometric Portraits Stay 100% Private',
    privacyText: 'Your passport portrait is a primary biometric identifier. Unlike AI photo booths that upload your face to cloud servers, Pixelo crops, aligns, and lays out your print sheet entirely inside your device’s browser memory.',
    faqs: [
      {
        question: 'Which size should I choose for a US Passport or US Visa (DS-160)?',
        answer: 'Choose the 2 × 2 inch (51 × 51 mm) option, which produces the exact 600 × 600 pixel square aspect ratio required by the U.S. Department of State.'
      },
      {
        question: 'Which size is used in the UK, Europe, Australia, and India?',
        answer: 'Choose 35 × 45 mm. That is the ICAO international standard used for UK, Schengen/EU, Australian, Singaporean, and standard Indian passport and exam applications.'
      },
      {
        question: 'What does the "Brighten Light Wall Background" option do?',
        answer: 'Indoor white walls often look slightly beige or light gray in phone photos. Enabling background brightening gently lifts near-white highlights toward pure white without erasing the natural edges of your hair or shoulders.'
      },
      {
        question: 'What if my exam form requires the passport photo to be under 50 KB?',
        answer: 'First create your properly framed Single Digital Photo here, download it, and then drop it into our Resize Image to 50KB tool to lock in the exact file weight.'
      }
    ],
    relatedTools: ['resize-image-to-50kb', 'resize-image-to-20kb', 'crop-image', 'image-to-pdf']
  },
  {
    slug: 'rotate-flip-image',
    path: '/rotate-flip-image',
    name: 'Rotate & Flip Image',
    category: 'Edit',
    shortDescription: 'Fix sideways phone photos, mirror selfies horizontally, or straighten crooked horizons by exact degrees.',
    title: 'Rotate & Flip Image Online – Fix Sideways Photos | Pixelo',
    metaDescription: 'Rotate photos 90° left or right, flip horizontally or vertically, and straighten tilted horizons in your browser. permanently fixes EXIF orientation issues.',
    h1: 'Rotate, Flip, and Straighten Images Online',
    subtitle: 'Permanently fix sideways camera uploads, un-mirror front-camera selfies, or level a tilted horizon with degree-by-degree precision.',
    whatItDoesHeading: 'Why Photos Upload Sideways and How to Fix Them Permanently',
    whatItDoesParagraphs: [
      'Have you ever opened a portrait photo on your laptop where it looks completely upright, only to upload it to an exam portal or website and watch it appear sideways? That happens because smartphones often save the pixel grid sideways and merely attach an invisible EXIF orientation tag telling apps to rotate it on screen. When an older portal strips EXIF metadata during upload, your photo falls over on its side.',
      'Our Rotate & Flip utility permanently rewrites the actual pixel grid inside a fresh image canvas. When you rotate a photo 90° clockwise, 90° counter-clockwise, or 180° here and download it, every website, printer, and portal is guaranteed to display it upright.',
      'Beyond 90-degree turns, you can flip an image horizontally (handy when a front-facing webcam or selfie mirror makes text on a shirt or whiteboard read backward), flip it vertically, or use the fine-angle straighten slider (-45° to +45°) to level a slightly crooked ocean horizon or tilted document scan.'
    ],
    howToHeading: 'How to Rotate or Flip Your Photo Step by Step',
    steps: [
      {
        title: 'Upload the sideways or mirrored image',
        detail: 'Drop a JPG, PNG, or WebP file into the tool above or tap to pick from your photo library.'
      },
      {
        title: 'Click Rotate 90° Left/Right or Flip Horizontal/Vertical',
        detail: 'Use the instant action buttons in the left panel to turn the photo in 90-degree increments or mirror it across its axis.'
      },
      {
        title: 'Use the Fine Straighten slider for crooked angles (optional)',
        detail: 'If a scanned page or landscape horizon is tilted by 2 or 3 degrees, slide the fine angle control until the edges line up cleanly.'
      },
      {
        title: 'Download the permanently oriented image',
        detail: 'Click Download to save the new image with its corrected orientation baked directly into the pixels.'
      }
    ],
    tipsHeading: 'Practical Tips for Orientation and Straightening',
    tips: [
      'If text in a selfie or webcam capture looks reversed like a mirror, click "Flip Horizontal" once and every letter will read normally from left to right.',
      'When scanning a paper document on a desk, a 90° or 180° rotation here ensures that when you merge it in our Image to PDF tool, the page reads right-side up.',
      'Rotating by exact 90° or 180° steps swaps the width and height cleanly without blurring details.',
      'If you use the fine-angle straighten slider (for example, +2.5°) on a tilted document, you can follow up with our Crop Image tool to trim the angled corner wedges.'
    ],
    formatsHeading: 'Supported File Types and Output Preservation',
    formatsText: 'Supports JPG, JPEG, PNG (including full alpha transparency), and WebP files. Preserves your original image format by default or lets you export directly to JPG, PNG, or WebP.',
    privacyHeading: 'Instant Local Rotation With Zero Server Uploads',
    privacyText: 'Rotating a personal photo or a scanned tax page should not require sending the file across the internet. All matrix transformations run locally in your browser in milliseconds.',
    faqs: [
      {
        question: 'Why did my photo look upright on my phone but sideways on an online application form?',
        answer: 'Phones use an EXIF orientation flag instead of physically rotating the pixels. Many government and job portals ignore that flag. Saving your rotated image through this tool bakes the upright orientation directly into the pixel rows so it never turns sideways again.'
      },
      {
        question: 'What is the difference between Rotate 180° and Flip Vertical?',
        answer: 'Rotate 180° turns an upside-down photo right-side up while keeping left and right in their proper places. Flip Vertical creates a top-to-bottom mirror reflection (like a reflection in a lake), which also reverses left-to-right reading order.'
      },
      {
        question: 'Does rotating a PNG keep its transparent background?',
        answer: 'Yes. Transparent areas remain 100% transparent when you rotate or flip a PNG or WebP image.'
      },
      {
        question: 'Can I undo my rotations if I click too many times?',
        answer: 'Yes, just click the "Reset Orientation" button in the control panel to return to zero degrees and no flips.'
      }
    ],
    relatedTools: ['crop-image', 'resize-image', 'image-to-pdf', 'passport-photo-maker']
  },
  {
    slug: 'add-watermark',
    path: '/add-watermark',
    name: 'Add Watermark',
    category: 'Edit',
    shortDescription: 'Protect photos and ID scans with custom text watermarks, adjustable opacity, 9-point placement, or tiled overlays.',
    title: 'Add Watermark to Photo Online – Custom Text & Opacity',
    metaDescription: 'Add custom text watermarks to JPG, PNG, and WebP images in your browser. Control opacity, font size, color, corner placement, or diagonal tiling privately.',
    h1: 'Add Custom Text Watermarks to Your Images',
    subtitle: 'Protect original photography, proof sheets, and sensitive ID scans with clean, customizable text overlays—processed entirely on your device.',
    whatItDoesHeading: 'Protect Both Creative Work and Sensitive Identity Scans',
    whatItDoesParagraphs: [
      'People add watermarks to images for two main reasons. Photographers, illustrators, real estate agents, and online sellers watermark portfolio proofs and product listings so competitors cannot copy their images without attribution. Even more importantly, everyday users watermark scans of driver’s licenses, passports, and utility bills before emailing them for apartment rentals, hotel check-ins, or KYC verification.',
      'Writing a clear purpose across an ID scan—such as "FOR APARTMENT APPLICATION ONLY – OCT 2026"—is one of the most effective ways to stop a leaked document scan from being reused for identity fraud elsewhere. However, uploading your unwatermarked ID card to a random cloud watermarking website defeats the entire security purpose!',
      'Our browser-based watermark tool lets you type any custom text, adjust opacity from subtle 15% ghosting to bold 100% stamps, choose text size and color, and either place the label in one of nine anchor positions (corners, edges, or center) or repeat it diagonally across the entire image.'
    ],
    howToHeading: 'How to Watermark an Image Step by Step',
    steps: [
      {
        title: 'Load your photo or document scan',
        detail: 'Drag a JPG, PNG, or WebP file into the upload zone above, or click to select an image from your device.'
      },
      {
        title: 'Type your custom watermark text',
        detail: 'Enter your copyright line (e.g., "© Studio Name") or security note (e.g., "Valid only for Bank KYC – 2026-10-28").'
      },
      {
        title: 'Select placement or Diagonal Tile mode',
        detail: 'Pick Bottom Right or Center for a clean single signature, or select "Tiled Diagonal Grid" to repeat the watermark across the whole frame.'
      },
      {
        title: 'Tune opacity, size, and text color',
        detail: 'Set opacity around 35%–50% so the underlying photo or document text remains clearly readable while the watermark cannot be cropped out.'
      },
      {
        title: 'Download the watermarked image',
        detail: 'Click Download to save the flattened image with the watermark permanently rendered into the pixels.'
      }
    ],
    tipsHeading: 'Best Practices for Effective Watermarking',
    tips: [
      'When protecting an ID scan for KYC or rental verification, use "Tiled Diagonal Grid" at 30% opacity so the text crosses part of the card background without blocking your face or ID number.',
      'For photography portfolios, a modest Bottom Right watermark at 45% white opacity with a subtle shadow keeps the viewer focused on your art.',
      'Avoid placing a tiny watermark in the extreme corner of a photo if there is empty sky around it; anyone can crop off the bottom 5% in seconds.',
      'Once you download a watermarked file, the text is baked into the pixels—always keep your original unwatermarked file saved separately.'
    ],
    formatsHeading: 'Supported Formats and Typography Rendering',
    formatsText: 'Supports JPG, PNG, and WebP images of any resolution. Font sizing scales proportionally to your image’s pixel width so a 4000-pixel camera file and an 800-pixel web image both get properly proportioned lettering.',
    privacyHeading: 'Why Local Watermarking Matters for ID Scans',
    privacyText: 'If you are watermarking a passport scan or tax document to protect yourself from identity theft, you should never upload the raw scan to an external server. Pixelo renders your watermark locally inside your browser tab using HTML5 Canvas—your files never leave your computer or phone.',
    faqs: [
      {
        question: 'Can someone remove the watermark after I download the image?',
        answer: 'Because the watermark is flattened directly into the pixel values of the exported JPG or PNG (not stored as a separate layer), there is no layer to delete. Using the Tiled Diagonal option makes manual cloning or cropping virtually impossible.'
      },
      {
        question: 'What opacity level works best when watermarking an ID card or certificate?',
        answer: 'Between 25% and 40% opacity works best. At that strength, the verification officer can clearly read every letter on your ID underneath the watermark, yet the document cannot be reused for another purpose.'
      },
      {
        question: 'Will my watermark text stay sharp on high-resolution 4K photos?',
        answer: 'Yes. The text is rendered directly at your photo’s native pixel resolution using vector canvas typography before export.'
      },
      {
        question: 'Does this tool add any Pixelo branding to my photo?',
        answer: 'Never. Only the exact text you type in the Watermark Text box is drawn onto your image.'
      }
    ],
    relatedTools: ['image-to-pdf', 'compress-image', 'crop-image', 'resize-image-to-100kb']
  },
  {
    slug: 'image-to-black-and-white',
    path: '/image-to-black-and-white',
    name: 'Image to Black & White',
    category: 'Edit',
    shortDescription: 'Convert color photos to true luminance grayscale or high-contrast monochrome for print and editorial work.',
    title: 'Convert Image to Black and White Online – Grayscale Tool',
    metaDescription: 'Turn color JPG, PNG, and WebP photos into crisp black and white grayscale images in your browser. Adjust contrast and brightness for print or portraits.',
    h1: 'Convert Images to Black and White',
    subtitle: 'Transform color portraits and document scans into balanced luminance grayscale with fine contrast and brightness controls.',
    whatItDoesHeading: 'True Luminance Grayscale vs. Simple Desaturation',
    whatItDoesParagraphs: [
      'Simply stripping color saturation out of a photograph often produces a flat, muddy gray image. That happens because human eyes perceive green as much brighter than blue and slightly brighter than red. Our Black and White converter uses the perceptual Rec. 709 luminance formula (0.2126 Red + 0.7152 Green + 0.0722 Blue), weighting each color channel the same way the human retina does so skin tones, foliage, and architectural shadows retain natural depth.',
      'Beyond artistic monochrome portraits and street photography, converting to grayscale is a practical lifesaver for document scans and laser printing. When you photograph a black-and-white printed page under yellow indoor bulbs, the paper looks orange or dingy gray. Converting the scan to grayscale and nudging the contrast slider upward turns the paper clean white and the ink crisp black.',
      'You can pick from four instant tonal presets—Standard Luminance, High-Contrast Document/Street, Soft Portrait, or Warm Archival Sepia—and fine-tune contrast and brightness sliders with a live preview.'
    ],
    howToHeading: 'How to Convert a Photo to Black and White',
    steps: [
      {
        title: 'Drop your color photo or document scan into the tool',
        detail: 'Select any JPG, PNG, or WebP image from your computer or phone.'
      },
      {
        title: 'Choose a monochrome tonal preset',
        detail: 'Pick Standard Grayscale for natural tones, High Contrast for dramatic portraits or document scans, Soft Matte for subtle midtones, or Warm Sepia.'
      },
      {
        title: 'Fine-tune Contrast and Brightness sliders',
        detail: 'Increase contrast (+15 to +35) if you want deeper blacks and brighter whites for laser printing or photocopy clarity.'
      },
      {
        title: 'Download your monochrome image',
        detail: 'Click Download to save your converted black-and-white file in JPG, PNG, or WebP format.'
      }
    ],
    tipsHeading: 'Tips for Better Monochrome Portraits and Document Scans',
    tips: [
      'When cleaning up a phone photo of a printed page or handwritten signature, select "High Contrast" and bump Brightness to +10 so gray paper shadows disappear.',
      'For portrait photography, look for photos with strong side lighting (like window light); black-and-white conversion thrives on light-and-shadow contrast.',
      'Converting a color scan to black and white before running it through our Compress Image tool often trims an extra 15% to 25% off the file weight because chroma data is removed.',
      'If you upload a transparent PNG logo to turn it monochrome, keep PNG selected as the output format so the transparent background stays clear.'
    ],
    formatsHeading: 'Supported Formats and Tonal Processing',
    formatsText: 'Processes JPG, JPEG, PNG (preserving alpha channel transparency), and WebP images. Pixel-by-pixel luminance and contrast curve math runs in real time on your device.',
    privacyHeading: 'Local Monochrome Conversion Without Server Uploads',
    privacyText: 'All pixel math happens directly inside your browser tab via HTML5 Canvas image data arrays. Your personal portraits and document scans are never uploaded or stored anywhere.',
    faqs: [
      {
        question: 'How do I make a dull phone scan of a paper document look like a clean scanner copy?',
        answer: 'Upload the photo here, choose the "High Contrast" preset, and raise Contrast to around +30 and Brightness to +10. That pushes the dingy paper background toward pure white and darkens the text.'
      },
      {
        question: 'Does converting to black and white reduce the file size?',
        answer: 'Yes. Because neutral grayscale pixels have zero color-difference (chroma) information, JPEG and WebP encoders can compress black-and-white images roughly 15% to 30% smaller than full-color versions at the same quality.'
      },
      {
        question: 'Will a transparent PNG stay transparent after converting to grayscale?',
        answer: 'Yes. The converter only modifies the Red, Green, and Blue channels of each pixel while leaving the Alpha (transparency) value untouched.'
      },
      {
        question: 'Can I preview changes before downloading?',
        answer: 'Yes, the right-hand preview updates live as you move the contrast and brightness sliders or switch between tonal presets.'
      }
    ],
    relatedTools: ['compress-image', 'image-to-pdf', 'resize-image-to-20kb', 'crop-image']
  }
];

export const TOOLS_BY_SLUG: Record<ToolId, ToolPageData> = TOOLS_DATA.reduce(
  (acc, tool) => {
    acc[tool.slug] = tool;
    return acc;
  },
  {} as Record<ToolId, ToolPageData>
);

export const TOOL_CATEGORIES: { name: ToolCategory; description: string }[] = [
  {
    name: 'Compress',
    description: 'Shrink image kilobytes for faster web pages or hit exact 20KB, 50KB, and 100KB form limits.'
  },
  {
    name: 'Convert',
    description: 'Switch between JPG, lossless PNG, and modern WebP formats in seconds.'
  },
  {
    name: 'Edit',
    description: 'Resize dimensions, crop aspect ratios, rotate sideways photos, add watermarks, or convert to grayscale.'
  },
  {
    name: 'Documents',
    description: 'Build multi-page PDF files from images and create official 300 DPI passport and visa photos.'
  }
];
