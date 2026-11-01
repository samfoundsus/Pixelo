import { BlogArticle } from './blog-part1';

export const BLOG_ARTICLES_PART_2: BlogArticle[] = [
  {
    slug: 'why-your-photos-are-so-large-and-how-to-shrink-them-safely',
    path: '/blog/why-your-photos-are-so-large-and-how-to-shrink-them-safely',
    title: 'Why Your Photos Are So Large and How to Shrink Them Safely',
    metaDescription: 'Find out why modern phone photos take up 5MB to 15MB and learn how to shrink file sizes by 80% without losing visible detail.',
    h1: 'Why Your Photos Are So Large and How to Shrink Them Safely',
    excerpt: 'Ten years ago, a typical smartphone photo weighed 800 KB. Today, a casual snapshot of your lunch or a paper receipt can easily hit 6 MB to 12 MB. Here is what is hiding inside those megabytes and how to trim them safely.',
    category: 'Performance',
    publishedAt: '2026-09-29',
    publishedDateFormatted: 'September 29, 2026',
    readingTime: '6 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'If you have ever tried to attach five photos to a work email and hit the 25 MB attachment ceiling—or watched your cloud storage bar turn red after a single weekend trip—you have probably wondered why everyday snapshots have grown so massive. A decade ago, an 8-megapixel phone photo usually sat around 1.2 megabytes. Today, a single frame from a current iPhone, Samsung Galaxy, or Google Pixel regularly lands between 5 MB and 15 MB, and exported PNG screenshots can be even heavier.',
      'Are our screens really ten times sharper than they were a decade ago? Not quite. Several hardware and software changes inside modern cameras conspire to bloat image files far beyond what any laptop monitor or mobile screen can actually display. Understanding where those megabytes come from makes it easy to shrink your photos by 70% to 85% without sacrificing a shred of visible sharpness.'
    ],
    sections: [
      {
        h2: 'The Four Culprits Behind Multi-Megabyte Photos',
        paragraphs: [
          'When you tap the shutter button on a modern smartphone or mirrorless camera, the file saved to your storage contains much more than a basic grid of colors. Four distinct factors push that byte count skyward:'
        ],
        subsections: [
          {
            h3: '1. 24MP and 48MP High-Resolution Sensors',
            paragraphs: [
              'For years, smartphones standardized on 12-megapixel images (4032 × 3024 pixels, or roughly 12.2 million pixels). Recently, flagship and mid-range phones shifted to 24-megapixel (5712 × 4284) or full 48-megapixel (8064 × 6048) defaults. Doubling both the width and height of an image does not just double the pixel count—it quadruples it! Even when you view that photo on a high-end 4K monitor, the screen only has about 8.3 million pixels total, and a typical blog column or email preview displays less than 1 million pixels.'
            ]
          },
          {
            h3: '2. Computational Photography Noise and Micro-Contrast',
            paragraphs: [
              'Modern phones merge eight to twelve rapid exposures into a single HDR photograph, boosting shadow detail and sharpening individual blades of grass, fabric weave, and brick textures. While that local tone-mapping looks punchy on your phone screen, image encoders like JPEG and PNG hate high-frequency micro-contrast. Smooth areas like a soft out-of-focus background compress down to almost nothing, whereas artificially sharpened textures across every square inch of the frame force the encoder to use three times as many bits.'
            ]
          },
          {
            h3: '3. Conservative Camera Encoder Quality Defaults',
            paragraphs: [
              'When your phone’s processor saves a JPEG right as you take a picture, its top priority is speed and battery life—it has to clear the camera buffer in a few milliseconds so you can take the next shot. Because fast hardware encoding cannot spend extra time optimizing Huffman tables, the camera simply saves the file at a very high quality setting (often 94% to 97% JPEG quality). Dropping from 95% down to 82% in a dedicated compressor cuts the file size in half while producing zero difference to the naked eye.'
            ]
          },
          {
            h3: '4. Accidental Photographic PNGs and Embedded Metadata',
            paragraphs: [
              'Whenever you take a screenshot of a photo on a Retina MacBook or high-DPI phone—or export a slide from a presentation tool—the system defaults to lossless PNG. Because a retina screenshot of a photograph contains millions of unique noisy pixels at 2× or 3× pixel density, a single screenshot can balloon to 9 MB. On top of that, camera files often embed color profiles, thumbnail previews, and EXIF headers.'
            ]
          }
        ]
      },
      {
        h2: 'The Safe Three-Step Formula to Shrink Photos by 80%',
        paragraphs: [
          'How do you reduce a 7 MB photo down to 350 KB without making faces look waxy or text look blocky? Professional web editors follow a strict order of operations: right-size the dimensions first, pick the right container second, and apply smart quantization third.'
        ],
        subsections: [
          {
            h3: 'Step 1: Match Pixel Dimensions to the Real Display Size',
            paragraphs: [
              'Ask yourself how the recipient will actually view the image. If you are embedding a photo inside a blog article, newsletter, or Notion page where the content column is 800 pixels wide, scaling a 5712-pixel camera file down to 1600 pixels wide (which covers 2× Retina displays cleanly) immediately eliminates 92% of the raw pixels before you even touch compression quality.'
            ]
          },
          {
            h3: 'Step 2: Switch Photographic PNGs to JPG or WebP',
            paragraphs: [
              'Check the file extension. If you have a .png file that shows a real-world scene, a portrait, or a video frame—and it does not require a transparent background—convert it to JPG (for email, print, and forms) or WebP (for websites). That single format change regularly turns an 8 MB file into an 800 KB file on the spot.'
            ]
          },
          {
            h3: 'Step 3: Use the 76%–82% Quality Sweet Spot',
            paragraphs: [
              'In JPEG and WebP compression, the quality scale from 1% to 100% is not linear. Going from 80% quality up to 100% quality frequently triples the file weight while improving visual fidelity by less than 2%. Conversely, dropping below 60% starts revealing faint 8 × 8 block boundaries in smooth skies. Staying right in the 76% to 82% range gives you the steepest drop in kilobytes with practically invisible compression.'
            ]
          }
        ],
        toolCallout: {
          text: 'Test the 80% quality sweet spot on your own photos with live before/after metrics:',
          linkText: 'Open the Batch Image Compressor',
          href: '/compress-image'
        }
      },
      {
        h2: 'When You Should Keep the Original Uncompressed File',
        paragraphs: [
          'While shrinking photos is the right move for websites, emails, messaging apps, and online portals, there are three situations where you should archive your original multi-megabyte file in a backup folder first:',
          '• Large-format physical printing: If you plan to print a framed 20 × 30 inch wall poster or wedding album spread, keep every original megapixel.',
          '• Heavy color grading: If you plan to open the photo in Lightroom or Photoshop later to pull up dark night shadows, compress only after you finish editing.',
          '• Archival family milestones: Keep the master camera file on an external drive, and create lightweight compressed copies whenever you share or upload.'
        ],
        toolCallout: {
          text: 'Need to scale down a 4000-pixel photo to sensible web dimensions first?',
          linkText: 'Use the Pixel & Percentage Image Resizer',
          href: '/resize-image'
        }
      }
    ],
    conclusionParagraphs: [
      'Large photo files are a byproduct of modern high-megapixel sensors and fast in-camera saving, not a requirement for crisp viewing. By scaling oversized dimensions down to what screens actually render and applying 80% compression in your browser, you can make every webpage, email, and document upload fast and lightweight.'
    ],
    relatedTools: ['compress-image', 'resize-image', 'convert-png-to-jpg', 'convert-to-webp']
  },
  {
    slug: 'image-resolution-dpi-and-pixels-explained-simply',
    path: '/blog/image-resolution-dpi-and-pixels-explained-simply',
    title: 'Image Resolution, DPI, and Pixels Explained Simply | Pixelo',
    metaDescription: 'Confused by 72 DPI vs 300 DPI, megapixels, and pixel dimensions? Learn what resolution actually means for screens, web design, and paper printing.',
    h1: 'Image Resolution, DPI, and Pixels Explained Simply',
    excerpt: 'Why does a client ask for a "300 DPI logo for a website," and why does changing DPI from 72 to 300 often make zero difference on screen? Let’s clear up the most misunderstood terms in digital imaging.',
    category: 'Fundamentals',
    publishedAt: '2026-09-21',
    publishedDateFormatted: 'September 21, 2026',
    readingTime: '7 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'Few topics in digital design cause more confusion than the relationship between pixels, inches, and DPI (Dots Per Inch). You might receive an email from a conference organizer asking for a "high-resolution 300 DPI headshot," or read an online exam instruction sheet asking for a "200 DPI scan measuring 3.5 cm by 4.5 cm." Yet when you open your photo on your laptop or phone, the file properties only list pixel numbers like 1920 × 1080.',
      'Even seasoned marketers and students get tripped up by myths—like the stubborn myth that web images must be saved at "72 DPI" to load fast. Once you see how pixels and physical inches connect through a single multiplication formula, you will never second-guess an image specification again.'
    ],
    sections: [
      {
        h2: 'What Is a Pixel? (The Only Thing Screens Actually Care About)',
        paragraphs: [
          'A digital image has no physical size in inches or millimeters of its own. At its core, a digital image is simply a rectangular spreadsheet of colored squares called pixels (short for "picture elements"). When we say a photo has dimensions of 1200 × 800 pixels, we mean the grid is 1,200 squares wide and 800 squares tall. Multiply those two numbers together (1,200 × 800 = 960,000) and you have roughly 0.96 megapixels.',
          'Here is the most important rule in digital imaging: when an image is displayed on a screen—whether inside a web browser, an email, or a mobile app—only the pixel dimensions matter. A 1200 × 800 pixel JPG exported at "72 DPI" and a 1200 × 800 pixel JPG exported at "300 DPI" have the exact same pixel grid, look 100% identical in Chrome or Safari, and have the exact same file weight in kilobytes.'
        ]
      },
      {
        h2: 'Then What Are DPI and PPI, and When Do They Matter?',
        paragraphs: [
          'If screens only care about pixel counts, where does DPI come in? DPI stands for Dots Per Inch (and its close cousin PPI stands for Pixels Per Inch). A printer cannot print "a pixel" because a pixel has no physical size; the printer needs to know how tightly to pack those pixels onto a physical sheet of paper.',
          'Think of DPI as a ruler instruction attached to your file that tells a physical printer: "Spread out this many pixels across every one inch of paper." The entire relationship boils down to one simple equation:',
          'Physical Print Size (in inches) = Pixel Dimensions ÷ DPI',
          'Or flipped around when you know the paper size you want to print:',
          'Required Pixels = Physical Print Size (in inches) × DPI'
        ],
        subsections: [
          {
            h3: 'Concrete Example: Printing a 2 × 2 Inch Passport Photo',
            paragraphs: [
              'Suppose you need to print a standard US passport photo that measures 2 inches wide by 2 inches tall on glossy photo paper. Why is 300 DPI the universal standard for close-up photo printing? Because at a normal reading distance of about 12 inches (30 cm), the human eye cannot distinguish individual ink dots smaller than 1/300th of an inch. At 300 DPI, pixels blend into continuous, lifelike photographic tone.',
              'Plug our 2 × 2 inch photo at 300 DPI into the formula: 2 inches × 300 pixels per inch = 600 pixels wide by 600 pixels tall. That means if your digital image is 600 × 600 pixels, it has enough detail to print a razor-sharp 2 × 2 inch passport photo at 300 DPI! What if you tried to print that same 600 × 600 pixel image as a 10 × 10 inch wall frame? Now you only have 60 pixels per inch (600 ÷ 10 = 60 DPI), so every pixel will look like a blurry Lego block on the wall.'
            ]
          },
          {
            h3: 'Converting Millimeters to Pixels (35 × 45 mm at 300 DPI)',
            paragraphs: [
              'What if your country or exam form specifies millimeters instead of inches, such as a 35 × 45 mm passport photo? There are 25.4 millimeters in one inch. Divide the millimeters by 25.4 to get inches, then multiply by 300 DPI:',
              '• Width: (35 mm ÷ 25.4) × 300 DPI = 413 pixels',
              '• Height: (45 mm ÷ 25.4) × 300 DPI = 531 pixels',
              'That is why an international 35 × 45 mm passport photo at 300 DPI always measures 413 × 531 pixels (or 826 × 1062 pixels if rendered at 600 DPI).'
            ]
          }
        ],
        toolCallout: {
          text: 'Skip the millimeter-to-pixel calculator and crop directly to 300 DPI templates:',
          linkText: 'Use the 300 DPI Passport Photo Maker',
          href: '/passport-photo-maker'
        }
      },
      {
        h2: 'Debunking the "72 DPI for the Web" Myth',
        paragraphs: [
          'Why do so many tutorials from the 1990s tell people to save web images at 72 PPI/DPI? Back in 1984, the original Apple Macintosh had a 9-inch CRT monitor whose physical glass screen happened to display 72 pixels per linear inch (matching the 72 points per inch used in traditional metal typesetting). Over the next forty years, display hardware changed completely: modern laptops pack 220 to 254 pixels into every inch, and modern smartphones pack 400 to 500 pixels into every inch.',
          'Meanwhile, the DPI number stored inside a JPG or PNG file is just a tiny 2-byte metadata tag in the file header. Web browsers completely ignore that tag when drawing an `<img>` element on a webpage—they simply look at the image’s pixel width and height and fit it into your CSS layout.',
          'So if a web designer or client asks you for a "high-res 300 DPI photo for our website hero banner," what they actually need is an image with enough pixel dimensions—such as 1920 × 1080 pixels or 2400 × 1350 pixels—so it looks sharp across wide desktop monitors.'
        ],
        toolCallout: {
          text: 'Need to set exact pixel widths like 1920×1080 or 1200×630 for a website?',
          linkText: 'Open the Exact Pixel Image Resizer',
          href: '/resize-image'
        }
      },
      {
        h2: 'Practical Reference Table: How Many Pixels Do You Actually Need?',
        paragraphs: [
          'Use these real-world pixel benchmarks whenever you are preparing files for web or print:',
          '• Handwritten Signature for Exam Portals: 140 × 60 px to 300 × 120 px (10 KB – 20 KB)',
          '• International Passport Photo (35 × 45 mm @ 300 DPI): 413 × 531 px',
          '• US Passport / Visa Photo (2 × 2 inch @ 300 DPI): 600 × 600 px',
          '• OpenGraph / Blog Social Share Card: 1200 × 630 px',
          '• Instagram / LinkedIn Vertical Feed Post (4:5 ratio): 1080 × 1350 px',
          '• Full-Width Desktop Website Hero Banner: 1920 × 1080 px',
          '• Standard 4 × 6 Inch Postcard Print (@ 300 DPI): 1200 × 1800 px',
          '• Full A4 Page Document or Print Sheet (@ 300 DPI): 2480 × 3508 px'
        ]
      }
    ],
    conclusionParagraphs: [
      'Remember this simple rule of thumb: if an image is staying on a screen, look only at its pixel dimensions (width × height) and file weight in kilobytes. If an image is going to be printed on physical paper, multiply the paper inches by 300 to find the pixel dimensions you need. Once you focus on pixels first, every resizing and cropping job becomes crystal clear.'
    ],
    relatedTools: ['resize-image', 'passport-photo-maker', 'crop-image', 'compress-image']
  },
  {
    slug: 'how-to-send-photos-without-losing-quality',
    path: '/blog/how-to-send-photos-without-losing-quality',
    title: 'How to Send Photos Without Losing Quality (Phone & Desktop)',
    metaDescription: 'Stop messaging apps and email clients from turning your sharp photos blurry. Learn the best ways to send high-quality photos and documents across devices.',
    h1: 'How to Send Photos Without Losing Quality',
    excerpt: 'You take a tack-sharp portrait or document scan on your phone, send it to a friend or to your own laptop via a chat app, and suddenly the text is fuzzy and the colors look washed out. Here is why chat apps crush your photos and how to prevent it.',
    category: 'Workflows',
    publishedAt: '2026-09-12',
    publishedDateFormatted: 'September 12, 2026',
    readingTime: '6 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'We have all seen it happen: someone takes a gorgeous group photo at a wedding or snaps a crystal-clear scan of a printed certificate, sends it over WhatsApp, Messenger, or SMS, and by the time you save it on your computer, it looks like it was filmed with a potato from 2006. Zoom in even slightly and faces turn into blocky squares while small text on a document becomes completely illegible.',
      'Why does a 12-megapixel smartphone photo arrive as a blurry 90 KB thumbnail? And more importantly, how can you send photos from your phone to your computer—or to clients, family, and application portals—while keeping full clarity?'
    ],
    sections: [
      {
        h2: 'Why Messaging Apps Automatically Ruin Photo Quality',
        paragraphs: [
          'Instant messaging platforms handle billions of media messages every single day. To make photos pop up in a chat bubble in less than a second—even when someone is riding a subway with one bar of cellular reception—messaging apps aggressively resize and re-compress every image you send in standard photo mode.',
          'By default, standard chat compression strips up to 90% of the pixels out of your image (often capping the longest edge at 1280 or 1600 pixels) and applies heavy lossy JPEG compression around 55% to 65% quality. Worse, if person A forwards that compressed image to person B, the app often re-compresses the already degraded file a second time.'
        ]
      },
      {
        h2: 'Five Reliable Ways to Transfer Photos With Full Sharpness',
        paragraphs: [
          'Whether you are sending a single signature scan from your phone to your laptop to fill out an exam form, or sharing fifty event photographs with a colleague, here are the most dependable ways to prevent surprise compression:'
        ],
        subsections: [
          {
            h3: '1. Send as a "Document" or "File" Inside Chat Apps',
            paragraphs: [
              'If you use WhatsApp or Telegram to move a photo from your phone to your computer, do not tap the "Photos / Gallery" icon. Instead, tap the Paperclip / "+" attachment icon, choose "Document" (or "Send as File"), and browse to your photo file. When you attach an image as a Document, the messaging app treats it like a ZIP or PDF archive and transmits the exact, untouched original bytes without resizing a single pixel.'
            ]
          },
          {
            h3: '2. Package Multiple Scans Into a Clean PDF First',
            paragraphs: [
              'When you need to send scanned receipts, signed agreements, or ID cards over email or chat, messaging apps never re-compress PDF files. By dropping your high-resolution JPG or PNG photos into a browser-based Image to PDF tool first, you lock the images inside a single document container that arrives on the recipient’s screen with the exact clarity you chose.'
            ]
          },
          {
            h3: '3. Compress on Your Own Terms Before Emailing',
            paragraphs: [
              'Email clients like Gmail, Outlook, and Apple Mail have a hard 20 MB to 25 MB limit per message. Even worse, when you paste photos inline into an email body on a phone, the mail app often asks to resize them to "Small" or "Medium," which blindly slashes the pixel resolution to 640 pixels wide!',
              'Instead of letting an email app butcher your resolution, optimize the files yourself before attaching them. Running a 6 MB camera photo through a controlled compressor at 82% quality keeps the full high-resolution pixel grid intact while dropping the file weight to ~650 KB. Now you can attach twenty full-resolution photos to a single email without hitting the 25 MB wall.'
            ]
          },
          {
            h3: '4. Fix Sideways EXIF Orientation Before Sharing',
            paragraphs: [
              'Sometimes quality isn’t the only casualty when transferring photos from a phone to a Windows PC—the photo also arrives rotated 90 degrees on its side because the receiving program ignores smartphone EXIF orientation tags. Rotating the photo in a browser tool that permanently rewrites the pixel rows guarantees it opens upright on every device.'
            ]
          },
          {
            h3: '5. Handle Apple HEIC Files Properly',
            paragraphs: [
              'By default, iPhones capture photos in Apple’s HEIC (High Efficiency Image Container) format. While HEIC is great for saving space on your iPhone, Windows PCs, Android devices, and almost all online upload portals cannot open .heic files directly. To stop your iPhone from shooting HEIC, open Settings → Camera → Formats and choose "Most Compatible" (which saves standard .jpg files), or export your photo as a JPG before moving it to your laptop.'
            ]
          }
        ],
        toolCallout: {
          text: 'Want to shrink 6MB camera files for email while keeping full pixel dimensions?',
          linkText: 'Optimize Photos With Our Controlled Image Compressor',
          href: '/compress-image'
        }
      },
      {
        h2: 'How to Share Sensitive IDs and Proofs Safely',
        paragraphs: [
          'Sometimes the photo you are sending is not a holiday landscape—it is a scan of your passport, driver’s license, or tax card requested by a landlord, hotel, or HR department. In those cases, you face two competing goals: the text on the card must be 100% crisp and legible, and the image should be protected against unauthorized reuse.',
          'Before emailing or messaging an identity scan, add a subtle, semi-transparent text watermark across the image stating the exact purpose and date (for example, "FOR RENTAL VERIFICATION ONLY – OCT 2026"), and then export it as a high-quality JPG or PDF. Because browser-based watermarking and PDF tools run locally on your device, your ID scan stays private while remaining sharp enough for verification.'
        ],
        toolCallout: {
          text: 'Combine multiple document photos into one tamper-free PDF before sending:',
          linkText: 'Open the Browser Image to PDF Converter',
          href: '/image-to-pdf'
        }
      }
    ],
    conclusionParagraphs: [
      'You never have to settle for blurry, blocky photos after transferring files between devices. Avoid standard chat gallery compression by sending files as documents, package multi-page scans into a single PDF, or pre-compress your photos at a high 80%–85% quality setting yourself so you stay in complete control of both file weight and visual sharpness.'
    ],
    relatedTools: ['compress-image', 'image-to-pdf', 'add-watermark', 'rotate-flip-image']
  }
];
