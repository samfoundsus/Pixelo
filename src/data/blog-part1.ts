import { ToolId } from './tools';

export interface BlogSection {
  h2: string;
  paragraphs?: string[];
  subsections?: {
    h3: string;
    paragraphs: string[];
  }[];
  toolCallout?: {
    text: string;
    linkText: string;
    href: `/${ToolId}`;
  };
}

export interface BlogArticle {
  slug: string;
  path: `/blog/${string}`;
  title: string; // SEO <title> under 60 chars
  metaDescription: string; // Under 160 chars
  h1: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  publishedDateFormatted: string;
  readingTime: string;
  authorName: string;
  authorRole: string;
  introParagraphs: string[];
  sections: BlogSection[];
  conclusionParagraphs: string[];
  relatedTools: ToolId[];
}

export const BLOG_ARTICLES_PART_1: BlogArticle[] = [
  {
    slug: 'how-to-reduce-image-size-for-online-form-uploads',
    path: '/blog/how-to-reduce-image-size-for-online-form-uploads',
    title: 'How to Reduce Image Size for Online Form Uploads | Pixelo',
    metaDescription: 'Learn how to shrink passport photos, signature scans, and certificates to 20KB, 50KB, or 100KB so online exam and government portals accept them first try.',
    h1: 'How to Reduce Image Size for Online Form Uploads',
    excerpt: 'Online exam, visa, and recruitment portals reject photos that miss strict kilobyte rules by even a single byte. Here is how to prepare photos, signatures, and certificates so they pass validation on the first attempt.',
    category: 'Guides & Forms',
    publishedAt: '2026-10-14',
    publishedDateFormatted: 'October 14, 2026',
    readingTime: '6 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'Almost everyone has experienced the late-night panic of filling out an important online application—whether for a university entrance exam, a civil service recruitment test, a passport renewal, or a professional license—only to get stuck on the photo upload step. You have all your educational details typed in, your payment card is sitting on the desk, and when you select your photograph, a bright red error message appears: "File size must be between 20 KB and 50 KB."',
      'When you look at the photo you just took with your phone, it weighs 3.8 megabytes (3,800 kilobytes). That is nearly eighty times larger than the form allows. Even worse, when you photograph your handwritten signature on a sheet of paper, the portal demands a file between 10 KB and 20 KB with exact pixel dimensions like 140 × 60 pixels. Why do portals enforce such tiny limits, and how can you hit them without turning your face or handwriting into a blurry smudge?'
    ],
    sections: [
      {
        h2: 'Why Application Portals Enforce Strict Kilobyte Caps',
        paragraphs: [
          'It is easy to blame legacy government software for 20 KB and 50 KB limits, but there is a practical engineering reason behind them. A major national examination board often processes two million to five million candidate registrations over a three-week window. Once registration closes, the board has to generate printable PDF admit cards (hall tickets) and attendance rosters for thousands of testing centers.',
          'If five million candidates each uploaded a 4 MB phone portrait, the board would need to store, back up, and stream 20 terabytes of raw image data just for one exam cycle. By capping portraits at 50 KB and signatures at 20 KB, every admit card loads in milliseconds over slow rural mobile connections, and center supervisors can print 500 candidate sheets without crashing the office laser printer.'
        ]
      },
      {
        h2: 'The Three Rules Every Form Upload Validator Checks',
        paragraphs: [
          'Before you start compressing a file, read the official instruction bulletin carefully. Automated upload validators check three distinct properties of your image file, and failing any one of them triggers a rejection:'
        ],
        subsections: [
          {
            h3: '1. File Format Extension (.jpg vs .png vs .heic)',
            paragraphs: [
              'Roughly 95% of academic, banking, and government portals only accept baseline JPEG files ending in .jpg or .jpeg. If you take a screenshot on your phone, it is saved as a .png file. If you transfer a photo directly from an iPhone without converting it, it may be a .heic file. Even if a PNG or HEIC file is under 40 KB, the portal validator will reject the file extension. Always make sure your final output is a standard .jpg image.'
            ]
          },
          {
            h3: '2. Pixel Dimensions and Aspect Ratio',
            paragraphs: [
              'Pixel dimensions describe how many dots wide and tall your image grid is. A standard passport portrait on an Indian, UK, or European form usually asks for a 3.5 cm × 4.5 cm ratio (roughly 200 × 230 pixels up to 413 × 531 pixels). US visa forms ask for a square 600 × 600 pixel image. Handwritten signature boxes are almost always horizontal rectangles, such as 140 × 60 pixels or 300 × 120 pixels. If you try to squeeze a tall vertical photo into a wide signature box, the portal will stretch your handwriting horizontally until it is unreadable.'
            ]
          },
          {
            h3: '3. Minimum and Maximum File Weight in Kilobytes',
            paragraphs: [
              'Notice that most portals state both a minimum and a maximum—for example, "20 KB to 50 KB" for photographs and "10 KB to 20 KB" for signatures. The minimum floor exists to stop applicants from uploading tiny 2 KB thumbnails that look pixelated when printed on an ID badge. Your goal is to land comfortably inside the upper half of the allowed window: around 16 KB to 19 KB for a 20 KB limit, and around 38 KB to 48 KB for a 50 KB limit.'
            ]
          }
        ],
        toolCallout: {
          text: 'Need to hit an exact portal ceiling right now? Use our dedicated target solvers:',
          linkText: 'Resize Image to 50KB for Candidate Photos',
          href: '/resize-image-to-50kb'
        }
      },
      {
        h2: 'How to Prepare a Candidate Portrait Photo (20 KB – 50 KB)',
        paragraphs: [
          'Start with a clean, well-lit source photo. Stand about half a meter in front of a plain white or light cream wall during the day, facing a window so soft natural light illuminates both sides of your face evenly. Ask a friend or family member to hold the phone at your eye level about 1.5 meters away rather than taking a close-up arm’s-length selfie. Wide-angle front cameras distort facial proportions when held too close.',
          'Once you have the photo on your phone or laptop, follow a two-step workflow rather than trying to compress the full-body room shot directly:'
        ],
        subsections: [
          {
            h3: 'Step 1: Crop to Your Head and Shoulders First',
            paragraphs: [
              'A raw camera photo usually includes huge amounts of empty wall above your head, your torso down to your waist, and bookshelves or curtains on the sides. All of those extra background pixels consume kilobytes. Open the photo in a passport framing tool or cropper first and trim the frame so your head and upper shoulders fill about 70% to 75% of the height. Cropping away unneeded room background immediately cuts the data footprint in half while making your face much clearer in the small portal preview box.'
            ]
          },
          {
            h3: 'Step 2: Run Target-Size Compression to 50 KB',
            paragraphs: [
              'Take that properly framed portrait and load it into a 50 KB target compressor. Instead of dragging a quality slider back and forth ten times, an iterative compressor tests JPEG quantization levels and scales the pixel grid from 4000 pixels down to standard portrait dimensions (around 450 × 580 pixels). At those dimensions, a 45 KB JPEG retains high quality—around 82% to 88% JPEG quality—so your eyes, hair, and collar edges remain sharp.'
            ]
          }
        ],
        toolCallout: {
          text: 'Frame your portrait to official 35×45mm or 2×2 inch proportions first:',
          linkText: 'Open the Passport Photo Maker',
          href: '/passport-photo-maker'
        }
      },
      {
        h2: 'How to Prepare a Handwritten Signature Scan (10 KB – 20 KB)',
        paragraphs: [
          'Signatures fail automated portal checks even more often than face photos because people photograph a tiny signature in the middle of a full A4 sheet of lined notebook paper under a dim yellow desk lamp. The resulting image looks dark gray, shows blue notebook lines running through the letters, and wastes 95% of its file size on empty paper.',
          'To get a clean 15 KB to 19 KB signature file every single time, sign your name on plain, unruled white printer paper using a black or dark blue ballpoint pen (avoid faint pencil or bleeding felt-tip markers). Place the paper near a sunny window, hold your phone directly above the signature so no phone shadow falls across the ink, and take the shot.',
          'Next, crop tightly around the signature so there is only a small, even white border around your name—roughly a 2.5:1 or 3:1 width-to-height ratio. If the paper still looks slightly gray or warm yellow, run it through a high-contrast black-and-white filter to turn the paper pure white and the ink crisp black. Finally, drop the cropped signature into a 20 KB target tool to lock the file size right around 17 KB.'
        ],
        toolCallout: {
          text: 'Shrink your cropped signature scan to the exact 10KB–20KB window:',
          linkText: 'Use the Resize Image to 20KB Tool',
          href: '/resize-image-to-20kb'
        }
      },
      {
        h2: 'How to Shrink Scanned Certificates and Mark Sheets Under 100 KB',
        paragraphs: [
          'Many scholarship, college admission, and onboarding portals also ask you to upload a scanned copy of your birth certificate, degree mark sheet, or address proof under 100 KB (or combine multiple pages into a compact PDF). With documents, legibility is everything: a human admissions officer has to read your roll number, graduation date, and university seal.',
          'Never shrink a full-page certificate down to 300 pixels wide, or the small printed text will turn into unreadable blocks. Keep the longest edge of the document around 1200 to 1500 pixels and use a 100 KB compressor that balances chroma subsampling while preserving text luminance contrast.'
        ],
        toolCallout: {
          text: 'Preparing scanned mark sheets or ID documents for upload?',
          linkText: 'Resize Certificates to Under 100KB',
          href: '/resize-image-to-100kb'
        }
      }
    ],
    conclusionParagraphs: [
      'Preparing photos and signatures for online applications does not require expensive desktop software or risky cloud uploads. By cropping away unnecessary background first, matching the aspect ratio of the portal’s preview box, and letting a client-side binary search lock in the exact 20 KB, 50 KB, or 100 KB file weight, you can finish your form upload in under a minute while keeping your personal identity documents safely on your own device.'
    ],
    relatedTools: ['resize-image-to-20kb', 'resize-image-to-50kb', 'resize-image-to-100kb', 'passport-photo-maker']
  },
  {
    slug: 'jpg-vs-png-vs-webp-which-format-should-you-use',
    path: '/blog/jpg-vs-png-vs-webp-which-format-should-you-use',
    title: 'JPG vs PNG vs WebP: Which Image Format Should You Use?',
    metaDescription: 'Understand the real differences between JPG, PNG, and WebP. Learn which format gives the smallest file size, sharpest text, and best transparency support.',
    h1: 'JPG vs PNG vs WebP: Which Format Should You Use?',
    excerpt: 'Choosing the wrong file extension can make a website load five times slower or turn crisp interface text blurry. Here is a clear, practical breakdown of when to pick JPG, PNG, or WebP.',
    category: 'Image Formats',
    publishedAt: '2026-10-10',
    publishedDateFormatted: 'October 10, 2026',
    readingTime: '6 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'Every time you export a graphic from a design tool, save a screenshot, or prepare photographs for a website, you face a familiar dropdown menu: JPG, PNG, or WebP. On the surface, all three formats display a picture on your screen. Underneath, however, they use completely different mathematical rules to store color and brightness data.',
      'Picking the wrong format has immediate consequences. Save a camera photograph as an uncompressed PNG and a single blog post can balloon to 15 megabytes, hurting your mobile visitors and search rankings. Save a software screenshot or company logo as a low-quality JPG and you will see ugly gray smudges around every letter—and lose your transparent background entirely. Let’s look at how each format actually works and which one belongs in your workflow.'
    ],
    sections: [
      {
        h2: 'JPG (JPEG): The Universal Workhorse for Photographs',
        paragraphs: [
          'Introduced in 1992 by the Joint Photographic Experts Group, JPEG was designed specifically for real-world scenes captured by cameras: portraits, landscapes, food photography, and product shots. Real-world photographs contain millions of subtle gradients where one shade of blue sky or skin tone blends softly into the next.',
          'JPG achieves remarkably small file sizes through lossy compression based on the Discrete Cosine Transform (DCT). It divides your image into tiny 8 × 8 pixel blocks and takes advantage of a quirk in human biology: our eyes are far more sensitive to changes in brightness (luminance) than changes in exact color tint (chrominance). By discarding high-frequency color variations that your eyes would never notice anyway, a JPG set to 80% quality can shrink a 10 MB raw camera bitmap down to 400 KB with almost no visible difference.'
        ],
        subsections: [
          {
            h3: 'When to Use JPG',
            paragraphs: [
              'Use JPG whenever you are working with continuous-tone camera photographs, portraits, real estate interiors, or scanned documents required by online government and exam forms. Because every computer, smartphone, printer, and legacy portal built in the last thirty years understands .jpg natively, it is the safest format when compatibility matters most.'
            ]
          },
          {
            h3: 'When to Avoid JPG',
            paragraphs: [
              'Avoid JPG for graphics with razor-sharp edges against flat backgrounds—such as typography, line art, diagrams, and app screenshots—unless you keep quality at 90% or higher. Because JPG processes images in 8 × 8 blocks, sharp high-contrast transitions cause faint ringing artifacts ("mosquito noise") around letters. Also remember that JPG cannot store transparent pixels; any transparent area will be filled with a solid color.'
            ]
          }
        ],
        toolCallout: {
          text: 'Have a heavy PNG screenshot that needs to be a lightweight JPG?',
          linkText: 'Convert PNG to JPG in Your Browser',
          href: '/convert-png-to-jpg'
        }
      },
      {
        h2: 'PNG: Lossless Precision and Alpha Transparency',
        paragraphs: [
          'Portable Network Graphics (PNG) was created in the mid-1990s as an open, patent-free replacement for GIF. Unlike JPG, standard PNG compression is completely lossless. It uses the Deflate algorithm (the same family of math used in ZIP archives) to look for repeated patterns across pixel rows. When you open a PNG, every single pixel has the exact Red, Green, Blue, and Alpha value it had when it was saved.',
          'That lossless architecture makes PNG shine on graphics with flat areas of solid color and crisp geometry. If a chart has 50,000 consecutive pure white pixels followed by a sharp black line, PNG records that sequence in a tiny handful of bytes without ever blurring the edge between white and black.'
        ],
        subsections: [
          {
            h3: 'The Superpower of 8-Bit Alpha Transparency',
            paragraphs: [
              'PNG also supports a full 8-bit alpha channel (256 levels of opacity per pixel). Unlike old GIF files where a pixel could only be 100% solid or 100% invisible—which left jagged stair-step edges on curved logos—a PNG logo can have smooth, semi-transparent anti-aliased edges and soft drop shadows that blend naturally over any light or dark website background.'
            ]
          },
          {
            h3: 'Why You Should Avoid PNG for Camera Photos',
            paragraphs: [
              'Because real camera photos have microscopic sensor noise on every single pixel, no two adjacent pixels in a photograph are mathematically identical. When PNG tries to compress a 12-megapixel camera portrait losslessly, it cannot find repeated runs of identical pixels, resulting in a massive 6 MB to 14 MB file. Unless you are archiving an intermediate design master, never publish raw photographic PNGs directly on a web page.'
            ]
          }
        ],
        toolCallout: {
          text: 'Need a lossless PNG from a JPEG for design editing?',
          linkText: 'Convert JPG to PNG Without Uploads',
          href: '/convert-jpg-to-png'
        }
      },
      {
        h2: 'WebP: The Modern All-Rounder for the Web',
        paragraphs: [
          'For years, web developers wished for a single format that could compress photographs even better than JPG while also supporting crisp edges and smooth alpha transparency like PNG. Google introduced WebP in 2010 based on the VP8 video codec’s intra-frame prediction, and today WebP is supported by over 97% of all web browsers worldwide—including Chrome, Firefox, Edge, and Apple Safari on both iOS and macOS.',
          'How does WebP beat JPG and PNG at their own game? Before encoding an 8 × 8 or 16 × 16 block of pixels, WebP looks at the neighboring blocks it has already decoded and predicts what the next block will look like, storing only the small mathematical residual difference. It also employs adaptive block quantization, spending more bits on detailed textures (like eyes or text) and fewer bits on smooth skies.'
        ],
        subsections: [
          {
            h3: 'Real-World Size Savings With WebP',
            paragraphs: [
              'In everyday web publishing, converting a JPG photograph to WebP at an equivalent visual quality setting (around 80%–82%) cuts file weight by an additional 25% to 35%. Even more impressive is what happens to transparent PNG product cutouts: because WebP allows lossy compression on the RGB color channels while maintaining a clean alpha transparency channel, a 1.8 MB transparent PNG sneaker photo routinely drops to a 140 KB WebP file—an 90%+ reduction with no visible loss on screen.'
            ]
          },
          {
            h3: 'When WebP Is Not the Right Choice',
            paragraphs: [
              'If WebP is smaller and supports transparency, why not use it everywhere? The answer is non-browser software. While every web browser and modern CMS (WordPress, Shopify, Webflow, Next.js) loves WebP, many older desktop programs, print-shop RIP systems, and strict government exam upload forms still only accept .jpg or .png files. Use WebP for building fast websites and apps; stick to JPG for forms, email attachments, and print.'
            ]
          }
        ],
        toolCallout: {
          text: 'Building a website or online store? Speed up your pages immediately:',
          linkText: 'Convert JPG & PNG Files to WebP',
          href: '/convert-to-webp'
        }
      },
      {
        h2: 'Quick Decision Cheat Sheet',
        paragraphs: [
          'Whenever you are unsure which format to pick, ask yourself two questions: Where will this file live, and does it need a transparent background?',
          '1. Uploading to an online exam, visa, or job portal: Always use JPG (.jpg) and check the exact kilobyte ceiling (20 KB, 50 KB, or 100 KB).',
          '2. Publishing photos or transparent product cutouts on a website: Use WebP (.webp) at 80%–85% quality for the fastest page load speeds and green Core Web Vitals.',
          '3. Saving logos, UI icons, diagrams with small text, or archival graphics that will be edited again: Use PNG (.png) for zero generation loss.',
          '4. Sending everyday photos via email or preparing a 300 DPI print sheet: Use high-quality JPG (85%–92%).'
        ]
      }
    ],
    conclusionParagraphs: [
      'You do not have to lock yourself into one format forever. A smart workflow keeps original graphics in lossless PNG while editing, exports website media as lightweight WebP, and converts form uploads or print attachments to universally compatible JPG. With browser-based converters, switching between all three takes less than five seconds.'
    ],
    relatedTools: ['convert-to-webp', 'convert-png-to-jpg', 'convert-jpg-to-png', 'compress-image']
  },
  {
    slug: 'how-to-make-a-passport-size-photo-at-home',
    path: '/blog/how-to-make-a-passport-size-photo-at-home',
    title: 'How to Make a Passport Size Photo at Home (Free Guide)',
    metaDescription: 'Take, crop, and print official 35x45mm or 2x2 inch passport and visa photos at home using your smartphone. Lighting, background, and sizing rules explained.',
    h1: 'How to Make a Passport Size Photo at Home',
    excerpt: 'You do not need an expensive studio visit to get an official passport, visa, or exam ID photo. Learn how to light, frame, crop, and print compliant 35×45mm and 2×2 inch portraits with the phone in your pocket.',
    category: 'Tutorials',
    publishedAt: '2026-10-06',
    publishedDateFormatted: 'October 6, 2026',
    readingTime: '7 min read',
    authorName: 'Elena Rostova',
    authorRole: 'Imaging & Web Performance Editor',
    introParagraphs: [
      'Walk into a pharmacy or commercial photo studio for a set of passport photos and you will usually pay between $12 and $20 for a two-minute snapshot and a single sheet of prints. Worse, if you also need a digital copy under 50 KB for an online visa or exam portal, many studios charge an extra fee just to email you the JPG file.',
      'Today, the camera inside any recent smartphone has better dynamic range and higher resolution than the fixed webcams used in most retail passport booths. Government agencies around the world—including the U.S. Department of State, HM Passport Office in the UK, European Schengen consulates, and Indian passport/exam portals—explicitly allow photos taken at home, provided your image follows strict lighting, pose, and dimension rules. Here is how to get a studio-grade result in your living room.'
    ],
    sections: [
      {
        h2: 'Step 1: Set Up Shadow-Free Lighting and a Plain Wall',
        paragraphs: [
          'More home passport photos are rejected for bad lighting and wall shadows than for any other reason. When an automated biometric scanner checks your photo, it looks for uniform brightness across both cheeks and a clean, uncluttered background behind your ears and shoulders.',
          'Find a plain white, off-white, or very light cream wall in your home. If you do not have a bare white wall, taping a clean white poster board or hanging a freshly ironed white bedsheet flat against a door works well. Now follow two golden rules of portrait lighting:'
        ],
        subsections: [
          {
            h3: 'Stand Two Steps Forward From the Wall',
            paragraphs: [
              'Never lean the back of your head directly against the wall. When you stand touching the wall, your head casts a dark, sharp halo shadow right behind your ears and neck, which triggers automatic rejection on passport portals. Take one to two full steps forward (about 0.5 to 0.7 meters away from the wall) so any shadow falls down toward the floor out of frame.'
            ]
          },
          {
            h3: 'Face a Daytime Window—And Turn Off the Camera Flash',
            paragraphs: [
              'The best light source is indirect daylight coming through a window directly in front of you. Facing the window lights your left and right cheeks equally. If you stand sideways next to a window, half of your face will be bright and the other half will sit in dark shadow. Always turn your phone’s camera flash off: direct flash reflects off forehead skin, creates red-eye, and leaves harsh shadows on the wall.'
            ]
          }
        ]
      },
      {
        h2: 'Step 2: Camera Distance, Eye Level, and Why Selfies Fail',
        paragraphs: [
          'It is tempting to hold your phone at arm’s length using the front selfie camera, but passport agencies routinely reject arm’s-length selfies. Why? Because smartphone lenses are wide-angle lenses. When a wide-angle lens is held only 40 centimeters from your face, perspective distortion makes your nose look 30% larger, pulls your ears back out of sight, and makes your shoulders look narrow.',
          'Instead, ask a friend or family member to take the photo using the phone’s rear camera, or prop your phone on a shelf or tripod with a 3-second self-timer. Have the camera positioned about 1.5 meters (5 feet) away from you at exact eye level—neither tilting up toward the ceiling nor pointing down from above. Leave plenty of space around your head and chest; you will crop to exact measurements in the next step.'
        ],
        subsections: [
          {
            h3: 'Checklist for Your Pose and Clothing',
            paragraphs: [
              '• Wear everyday darker clothing (navy, charcoal, black, or rich colors) so your shoulders contrast clearly against the white background. Avoid wearing a plain white shirt against a white wall.',
              '• Take off glasses! Since 2016, the U.S. State Department and many international visa systems prohibit eyeglasses in new passport photos because even tiny green lens reflections block iris recognition.',
              '• Keep a neutral expression with both eyes open looking straight into the lens, mouth closed, and head level (not tilted).',
              '• Tuck hair behind your shoulders and make sure your eyebrows and the full oval of your face from crown to chin are unobstructed.'
            ]
          }
        ]
      },
      {
        h2: 'Step 3: Understand International Passport Sizes (35×45mm vs 2×2 Inch)',
        paragraphs: [
          'Passport photo dimensions are not universal around the globe. Before cropping your portrait, verify which of the two major standards your application requires:'
        ],
        subsections: [
          {
            h3: '35 × 45 mm (UK, European Union, India, Australia, Canada Visa, Japan)',
            paragraphs: [
              'The 35 mm wide by 45 mm tall rectangle is the ICAO international standard used by the vast majority of countries, as well as most academic and civil service exam forms. At a crisp 300 DPI print resolution, 35 × 45 mm equals 413 × 531 pixels (or 826 × 1062 pixels at 600 DPI). Inside that 45 mm height, your head (from the bottom of your chin to the top of your skull) should measure between 29 mm and 34 mm—roughly 70% of the vertical frame.'
            ]
          },
          {
            h3: '2 × 2 Inches / 51 × 51 mm (United States Passport, US DS-160 Visa, Indian OCI)',
            paragraphs: [
              'The United States, along with Indian Visa and OCI applications, uses a square 2 × 2 inch (51 × 51 mm) format. At 300 DPI, a 2 × 2 inch photo measures exactly 600 × 600 pixels. Your head height should sit between 1 inch and 1.375 inches (50% to 69% of the square’s total height), with your eyes positioned roughly one-third of the way down from the top edge.'
            ]
          }
        ],
        toolCallout: {
          text: 'Crop your portrait to 35×45mm or 2×2 inch with a built-in head alignment guide:',
          linkText: 'Launch the Free Passport Photo Maker',
          href: '/passport-photo-maker'
        }
      },
      {
        h2: 'Step 4: Creating a Digital File vs. Printing an A4 Sheet',
        paragraphs: [
          'Once you load your portrait into a passport framing tool, align your face inside the oval guide and check whether your indoor wall looks slightly dim. A subtle white-balance or background brightening adjustment can lift a slightly beige living-room wall to clean studio white without giving your hair an artificial cutout border.',
          'From there, decide how you will submit the photo:'
        ],
        subsections: [
          {
            h3: 'For Online Portals (Digital Upload)',
            paragraphs: [
              'Export the "Single Photo" option. That gives you a single, properly proportioned 300 DPI JPG image. If your online portal also specifies a strict file weight ceiling—such as "must be under 50 KB" or "between 20 KB and 50 KB"—run that exported single photo through a 50 KB compressor so the byte count matches the portal’s rules.'
            ]
          },
          {
            h3: 'For Paper Applications (Printing at Home or a Print Shop)',
            paragraphs: [
              'Never print a single 35 × 45 mm image directly from your operating system’s default photo viewer, because default print dialogs often select "Fit to Page" and blow your tiny passport photo up to cover the entire sheet of paper! Instead, choose the "A4 Print Sheet (8 Copies)" option in our Passport Photo Maker. That creates a full 2480 × 3508 pixel (300 DPI A4) canvas with eight accurately sized passport photos arranged in a neat grid with light scissor guide lines.',
              'When you print that A4 sheet on glossy inkjet photo paper at home—or take the JPG on a USB drive to a local print shop for $0.50—simply choose A4 paper and set scaling to "100% / Actual Size." Cut along the thin gray guide lines with scissors or a paper trimmer, and you have eight official passport prints ready for your application.'
            ]
          }
        ],
        toolCallout: {
          text: 'Need your finished digital passport photo under 50 KB for an online portal?',
          linkText: 'Compress Your Passport Photo to 50KB',
          href: '/resize-image-to-50kb'
        }
      }
    ],
    conclusionParagraphs: [
      'Taking your own passport photo at home gives you all the time you need to get a portrait you actually like, saves a trip across town, and keeps your biometric face data on your own device. Just remember the fundamentals: stand two steps away from a plain light wall, face natural window light, have someone take the shot from 1.5 meters away at eye level, and use a 300 DPI template so your physical and digital dimensions are exact.'
    ],
    relatedTools: ['passport-photo-maker', 'resize-image-to-50kb', 'crop-image', 'rotate-flip-image']
  }
];
