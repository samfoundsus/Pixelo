export interface ProcessedImageResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
  mimeType: string;
  timedOut?: boolean;
  timeoutMessage?: string;
}

export interface IngestedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  originalBlob: Blob | null;
  workingCanvas: HTMLCanvasElement | null;
  width: number; // Working width (longest side <= 2560)
  height: number; // Working height (longest side <= 2560)
  originalWidth: number; // Original natural width
  originalHeight: number; // Original natural height
  previewUrl: string;
  thumbnailUrl: string;
  warning?: string;
  error?: string;
  errorStage?: 'read' | 'decode' | 'canvas' | 'process';
  errorDetails?: string;
}

export type WatermarkPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center'
  | 'tiled';

const MAX_WARNING_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_WORKING_DIMENSION = 2560;
const SAFETY_TIMEOUT_MS = 10000;

export const ERROR_MSG_READ_BLOCKED =
  'Your phone blocked access to this photo. Tap Choose photos again and pick it from Gallery or Files';
export const ERROR_MSG_UNSUPPORTED_FORMAT = "This format isn't supported";
export const ERROR_MSG_HEIC_FAILED =
  "This HEIC photo can't be read in your browser. Change your camera format to JPG, or share it as a JPG from your gallery.";
export const ERROR_MSG_CANVAS_BLOCKED =
  'Your browser is blocking canvas access. Turn off Shields for this site or try Chrome.';

export class ImageProcessError extends Error {
  details: string;
  stage: 'read' | 'decode' | 'canvas' | 'process';

  constructor(
    friendlyMessage: string,
    details: string,
    stage: 'read' | 'decode' | 'canvas' | 'process' = 'process'
  ) {
    super(friendlyMessage);
    this.name = 'ImageProcessError';
    this.details = details;
    this.stage = stage;
  }
}

export function getDeviceCapabilitiesSummary(): string {
  if (typeof window === 'undefined') return 'env=ssr';
  const hasOffscreen = typeof OffscreenCanvas !== 'undefined';
  const hasBitmap = typeof createImageBitmap === 'function';
  const hasWorker = typeof Worker !== 'undefined';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  return `OffscreenCanvas=${hasOffscreen}, createImageBitmap=${hasBitmap}, Worker=${hasWorker}, UA=${ua}`;
}

export function buildDiagnosticDetails(
  err: unknown,
  meta?: { name?: string; type?: string; size?: number; stage?: string; extra?: string }
): string {
  const errText =
    err instanceof ImageProcessError && err.details
      ? err.details
      : err instanceof Error
      ? `${err.name || 'Error'}: ${err.message || 'Unknown error'}`
      : typeof err === 'string'
      ? err
      : String(err);

  const lines = [
    `Error: ${errText}`,
    meta?.stage ? `Stage: ${meta.stage}` : null,
    meta?.name ? `File: ${meta.name}` : null,
    meta ? `MIME: ${meta.type || '(empty)'} | Size: ${meta.size ?? 0} bytes` : null,
    meta?.extra ? `Steps: ${meta.extra}` : null,
    `Capabilities: ${getDeviceCapabilitiesSummary()}`,
  ].filter(Boolean);

  return lines.join('\n');
}

export function formatErrorDetails(err: unknown): string {
  if (err instanceof ImageProcessError && err.details) {
    return err.details;
  }
  return buildDiagnosticDetails(err);
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${kb < 100 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Inspects magic bytes and filename extension to guess the accurate MIME type
 * when Android / Gallery / Files provides an empty or generic file.type.
 */
export function guessMimeType(
  fileName: string,
  declaredType?: string,
  buffer?: ArrayBuffer | null
): string {
  if (buffer && buffer.byteLength >= 12) {
    const b = new Uint8Array(buffer, 0, 12);
    // JPEG: FF D8 FF
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
      return 'image/jpeg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
      return 'image/png';
    }
    // GIF: 47 49 46 38
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
      return 'image/gif';
    }
    // WebP: RIFF....WEBP
    if (
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50
    ) {
      return 'image/webp';
    }
    // BMP: 42 4D
    if (b[0] === 0x42 && b[1] === 0x4d) {
      return 'image/bmp';
    }
    // ISO Base Media File Format (ftyp at offset 4..7): AVIF or HEIC/HEIF
    if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
      const brand = String.fromCharCode(b[8], b[9], b[10], b[11]).toLowerCase();
      if (brand === 'avif' || brand === 'avis') {
        return 'image/avif';
      }
      if (
        brand === 'heic' ||
        brand === 'heix' ||
        brand === 'hevc' ||
        brand === 'hevx' ||
        brand === 'mif1' ||
        brand === 'msf1'
      ) {
        return 'image/heic';
      }
    }
  }

  const cleanDeclared = (declaredType || '').trim().toLowerCase();
  if (cleanDeclared && cleanDeclared.startsWith('image/') && cleanDeclared !== 'image/*') {
    if (cleanDeclared === 'image/jpg') return 'image/jpeg';
    return cleanDeclared;
  }

  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.jfif')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';

  return 'image/jpeg';
}

export function isHeicMimeOrName(fileName: string, mimeType: string, buffer?: ArrayBuffer | null): boolean {
  const guessed = guessMimeType(fileName, mimeType, buffer);
  const lower = (fileName || '').toLowerCase();
  const typeLower = (mimeType || '').toLowerCase();
  return (
    guessed === 'image/heic' ||
    guessed === 'image/heif' ||
    lower.endsWith('.heic') ||
    lower.endsWith('.heif') ||
    typeLower.includes('heic') ||
    typeLower.includes('heif')
  );
}

/**
 * Awaits a single animation frame (or macrotask in background tabs) so main-thread
 * fallback loops keep the UI responsive and never freeze.
 */
export function waitNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads a File/Blob into an ArrayBuffer immediately, with a FileReader fallback
 * and an automatic 1x retry after 250ms before failing with a read error.
 */
async function readArrayBufferOnce(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return await blob.arrayBuffer();
  }
  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return an ArrayBuffer.'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('FileReader failed to read ArrayBuffer.'));
    };
    reader.readAsArrayBuffer(blob);
  });
}

async function readArrayBufferWithRetry(file: File, retryDelayMs = 250): Promise<ArrayBuffer> {
  try {
    const buf = await readArrayBufferOnce(file);
    if (!buf || buf.byteLength === 0) {
      throw new Error('NotReadableError: File buffer returned 0 bytes.');
    }
    return buf;
  } catch (firstErr) {
    console.warn('[ingestFiles] First arrayBuffer() read failed, retrying in 250ms...', firstErr);
    await delayMs(retryDelayMs);
    const buf = await readArrayBufferOnce(file);
    if (!buf || buf.byteLength === 0) {
      throw new Error('NotReadableError: File buffer returned 0 bytes on retry.');
    }
    return buf;
  }
}

/**
 * Detects if Brave Shields (strict fingerprinting protection) or another privacy blocker
 * has blocked canvas readback or zeroed out canvas pixel data.
 */
function verifyCanvasNotBlocked(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  try {
    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;

    // Sample a 5x5 grid across the canvas
    const points: Array<[number, number]> = [
      [Math.floor(w * 0.5), Math.floor(h * 0.5)],
      [Math.floor(w * 0.25), Math.floor(h * 0.25)],
      [Math.floor(w * 0.75), Math.floor(h * 0.25)],
      [Math.floor(w * 0.25), Math.floor(h * 0.75)],
      [Math.floor(w * 0.75), Math.floor(h * 0.75)],
      [Math.floor(w * 0.1), Math.floor(h * 0.9)],
      [Math.floor(w * 0.9), Math.floor(h * 0.1)],
    ];

    let allTransparentZero = true;
    for (const [px, py] of points) {
      const data = ctx.getImageData(
        Math.max(0, Math.min(w - 1, px)),
        Math.max(0, Math.min(h - 1, py)),
        1,
        1
      ).data;
      if (data[0] !== 0 || data[1] !== 0 || data[2] !== 0 || data[3] !== 0) {
        allTransparentZero = false;
        break;
      }
    }

    if (allTransparentZero) {
      // Double-check a horizontal strip across the middle
      const stripW = Math.min(64, w);
      const strip = ctx.getImageData(0, Math.floor(h / 2), stripW, 1).data;
      let anyNonZero = false;
      for (let i = 0; i < strip.length; i++) {
        if (strip[i] !== 0) {
          anyNonZero = true;
          break;
        }
      }
      if (!anyNonZero) {
        throw new ImageProcessError(
          ERROR_MSG_CANVAS_BLOCKED,
          'CanvasReadbackBlocked: Drawn canvas returned all-zero transparent pixels across sample regions.',
          'canvas'
        );
      }
    }
  } catch (err) {
    if (err instanceof ImageProcessError) {
      throw err;
    }
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      `CanvasSecurityError: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`,
      'canvas'
    );
  }
}

function drawDecodedSourceToWorkingCanvas(
  source: HTMLImageElement | ImageBitmap,
  origW: number,
  origH: number,
  maxLongestSide: number = MAX_WORKING_DIMENSION
): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
} {
  const scale = Math.min(1, maxLongestSide / Math.max(origW, origH));
  const width = Math.max(1, Math.round(origW * scale));
  const height = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize 2D canvas context on main thread.',
      'canvas'
    );
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  verifyCanvasNotBlocked(canvas, ctx);

  return {
    canvas,
    ctx,
    width,
    height,
    originalWidth: origW,
    originalHeight: origH,
  };
}

async function decodeWithObjectUrl(blob: Blob, maxLongestSide: number) {
  const img = new Image();
  img.decoding = 'async';
  try {
    (img.style as unknown as Record<string, string>).imageOrientation = 'from-image';
  } catch {}

  const objectUrl = URL.createObjectURL(blob);
  try {
    img.src = objectUrl;
    await img.decode();
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;
    if (!origW || !origH) {
      throw new Error('Image decoded with zero dimensions (0x0).');
    }
    const drawn = drawDecodedSourceToWorkingCanvas(img, origW, origH, maxLongestSide);
    return drawn;
  } finally {
    // Only revoke AFTER the draw is finished
    URL.revokeObjectURL(objectUrl);
    img.src = '';
  }
}

async function decodeWithDataUrl(blob: Blob, maxLongestSide: number) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.length > 0) {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader returned empty Data URL.'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('FileReader failed to read blob as Data URL.'));
    };
    reader.readAsDataURL(blob);
  });

  const img = new Image();
  img.decoding = 'async';
  try {
    (img.style as unknown as Record<string, string>).imageOrientation = 'from-image';
  } catch {}

  try {
    img.src = dataUrl;
    await img.decode();
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;
    if (!origW || !origH) {
      throw new Error('Data URL image decoded with zero dimensions (0x0).');
    }
    return drawDecodedSourceToWorkingCanvas(img, origW, origH, maxLongestSide);
  } finally {
    img.src = '';
  }
}

async function decodeWithBitmap(blob: Blob, maxLongestSide: number) {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap is not supported in this browser.');
  }
  let bitmap: ImageBitmap | null = null;
  try {
    try {
      bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    } catch {
      bitmap = await createImageBitmap(blob);
    }
    const origW = bitmap.width;
    const origH = bitmap.height;
    if (!origW || !origH) {
      throw new Error('ImageBitmap decoded with zero dimensions (0x0).');
    }
    return drawDecodedSourceToWorkingCanvas(bitmap, origW, origH, maxLongestSide);
  } finally {
    if (bitmap) {
      try {
        bitmap.close();
      } catch {}
    }
  }
}

/**
 * Lazy-loads heic2any ONLY when a HEIC/HEIF photo cannot be decoded natively by the browser.
 */
async function convertHeicBlobInMemory(heicBlob: Blob): Promise<Blob> {
  const mod = await import('heic2any');
  const heic2anyFn = (mod.default || mod) as (options: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;

  const converted = await heic2anyFn({
    blob: heicBlob,
    toType: 'image/jpeg',
    quality: 0.92,
  });

  return Array.isArray(converted) ? converted[0] : converted;
}

/**
 * Generates previewUrl (from workingCanvas) and a small 320px thumbnailUrl once during intake.
 */
async function createPreviewAndThumbnailFromCanvas(
  workingCanvas: HTMLCanvasElement,
  maxThumbEdge: number = 320
): Promise<{ previewUrl: string; thumbnailUrl: string }> {
  const previewBlob = await canvasToBlob(workingCanvas, 'image/jpeg', 0.88);
  const previewUrl = URL.createObjectURL(previewBlob);

  const w = workingCanvas.width;
  const h = workingCanvas.height;
  const scale = Math.min(1, maxThumbEdge / Math.max(w, h));
  const thumbW = Math.max(1, Math.round(w * scale));
  const thumbH = Math.max(1, Math.round(h * scale));

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const tCtx = thumbCanvas.getContext('2d');
  if (!tCtx) {
    return { previewUrl, thumbnailUrl: previewUrl };
  }

  tCtx.fillStyle = '#FFFFFF';
  tCtx.fillRect(0, 0, thumbW, thumbH);
  tCtx.imageSmoothingEnabled = true;
  tCtx.imageSmoothingQuality = 'medium';
  tCtx.drawImage(workingCanvas, 0, 0, thumbW, thumbH);

  const thumbBlob = await canvasToBlob(thumbCanvas, 'image/jpeg', 0.82);
  thumbCanvas.width = 0;
  thumbCanvas.height = 0;

  return {
    previewUrl,
    thumbnailUrl: URL.createObjectURL(thumbBlob),
  };
}

/**
 * Releases all URLs and zeroes out the workingCanvas dimensions when a file is removed
 * or the tool is reset so mobile memory stays low.
 */
export function releaseIngestedItem(
  item: Pick<IngestedFileItem, 'previewUrl' | 'thumbnailUrl' | 'workingCanvas'> & {
    result?: ProcessedImageResult;
  }
): void {
  if (item.thumbnailUrl) {
    try {
      URL.revokeObjectURL(item.thumbnailUrl);
    } catch {}
  }
  if (item.previewUrl && item.previewUrl !== item.thumbnailUrl) {
    try {
      URL.revokeObjectURL(item.previewUrl);
    } catch {}
  }
  if (item.result?.url) {
    try {
      URL.revokeObjectURL(item.result.url);
    } catch {}
  }
  if (item.workingCanvas) {
    try {
      item.workingCanvas.width = 0;
      item.workingCanvas.height = 0;
    } catch {}
  }
}

/**
 * ONE SHARED INTAKE FUNCTION: ingestFiles(fileList)
 * Every file input, drop zone, paste handler, and "Add more" button in every tool
 * (including Image to PDF) calls ONLY this function. No tool reads a File object on its own.
 *
 * Captures everything at the moment of selection:
 * 1) Copies Array.from(fileList) synchronously.
 * 2) Processes files one at a time in order:
 *    - Immediately starts createImageBitmap(file) and, in parallel, reads file.arrayBuffer()
 *      (with a 250ms auto-retry before failing as a read error).
 *    - Builds an in-memory originalBlob from the ArrayBuffer with the guessed MIME type.
 *    - If createImageBitmap failed, tries <img> with URL.createObjectURL and await img.decode(),
 *      then FileReader.readAsDataURL and await img.decode().
 *    - If the file is HEIC/HEIF and native decode fails, lazy-loads heic2any in memory.
 *    - Draws the first successful result once onto workingCanvas (longest side <= 2560px).
 * 3) Returns IngestedFileItem[] with { id, name, size, type, originalBlob, workingCanvas, width, height, ... }.
 *    Never stores the transient File reference.
 */
export async function ingestFiles(
  fileList: FileList | File[],
  options?: {
    maxFiles?: number;
    onProgress?: (current: number, total: number, fileName: string) => void;
    isCancelled?: () => boolean;
  }
): Promise<IngestedFileItem[]> {
  // 2a) Copy the list synchronously at the very start
  const allFiles = Array.from(fileList || []);
  const limit = options?.maxFiles ? Math.max(1, options.maxFiles) : allFiles.length;
  const files = allFiles.slice(0, limit);
  const results: IngestedFileItem[] = [];

  // 2b) Process files one at a time in order
  for (let i = 0; i < files.length; i++) {
    if (options?.isCancelled?.()) {
      break;
    }

    const file = files[i];
    const fileName = file.name || `photo-${i + 1}.jpg`;
    const declaredType = file.type || '';
    const declaredSize = file.size || 0;
    const id = `${fileName}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;

    options?.onProgress?.(i + 1, files.length, fileName);

    const stepLogs: string[] = [];

    // Start immediate parallel capture: createImageBitmap(file) + file.arrayBuffer() (with 250ms retry)
    const immediateBitmapPromise: Promise<ImageBitmap | null> =
      typeof createImageBitmap === 'function'
        ? (async () => {
            try {
              return await createImageBitmap(file, {
                imageOrientation: 'from-image',
              } as ImageBitmapOptions);
            } catch {
              return await createImageBitmap(file);
            }
          })().catch((err) => {
            stepLogs.push(`Immediate createImageBitmap(file) failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
            return null;
          })
        : Promise.resolve(null);

    const arrayBufferPromise: Promise<{ buffer: ArrayBuffer | null; error?: unknown }> =
      readArrayBufferWithRetry(file, 250)
        .then((buffer) => ({ buffer }))
        .catch((err) => {
          stepLogs.push(`arrayBuffer(file) with 250ms retry failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
          return { buffer: null, error: err };
        });

    const [immediateBitmap, bufferResult] = await Promise.all([
      immediateBitmapPromise,
      arrayBufferPromise,
    ]);

    const buffer = bufferResult.buffer;

    // If BOTH arrayBuffer read AND immediate bitmap failed, check if Android blocked access to the file handle
    if (!buffer && !immediateBitmap) {
      console.error('[ingestFiles] Read failure on file:', fileName, bufferResult.error);
      results.push({
        id,
        name: fileName,
        size: declaredSize,
        type: declaredType || guessMimeType(fileName, declaredType, null),
        originalBlob: null,
        workingCanvas: null,
        width: 0,
        height: 0,
        originalWidth: 0,
        originalHeight: 0,
        previewUrl: '',
        thumbnailUrl: '',
        error: ERROR_MSG_READ_BLOCKED,
        errorStage: 'read',
        errorDetails: buildDiagnosticDetails(bufferResult.error || new Error('NotReadableError'), {
          name: fileName,
          type: declaredType,
          size: declaredSize,
          stage: 'read (file.arrayBuffer + 250ms retry)',
          extra: stepLogs.join(' | '),
        }),
      });
      continue;
    }

    const mimeType = guessMimeType(fileName, declaredType, buffer);
    const actualSize = buffer ? buffer.byteLength : declaredSize;
    let originalBlob: Blob | null = buffer ? new Blob([buffer], { type: mimeType }) : null;

    const warning =
      actualSize > MAX_WARNING_BYTES
        ? `"${fileName}" is ${formatBytes(actualSize)} (over 25 MB). Processing at a memory-safe resolution.`
        : undefined;

    let drawn: {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      originalWidth: number;
      originalHeight: number;
    } | null = null;

    let canvasBlockedError: ImageProcessError | null = null;

    // 1. If immediate createImageBitmap(file) succeeded, draw it once onto workingCanvas
    if (immediateBitmap) {
      try {
        const origW = immediateBitmap.width;
        const origH = immediateBitmap.height;
        if (!origW || !origH) {
          throw new Error('Immediate ImageBitmap had 0x0 dimensions.');
        }
        drawn = drawDecodedSourceToWorkingCanvas(
          immediateBitmap,
          origW,
          origH,
          MAX_WORKING_DIMENSION
        );
      } catch (err) {
        if (err instanceof ImageProcessError && err.stage === 'canvas') {
          canvasBlockedError = err;
        }
        stepLogs.push(`Draw from immediate ImageBitmap failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        try {
          immediateBitmap.close();
        } catch {}
      }
    }

    // If originalBlob wasn't created because arrayBuffer failed while immediateBitmap succeeded,
    // build originalBlob from the drawn workingCanvas so originalBlob is always available in memory.
    if (!originalBlob && drawn) {
      try {
        originalBlob = await canvasToBlob(
          drawn.canvas,
          mimeType === 'image/png' || mimeType === 'image/webp' ? mimeType : 'image/jpeg',
          0.92
        );
      } catch {}
    }

    const isHeic = isHeicMimeOrName(fileName, declaredType, buffer);

    // 2. Fallback chain using the in-memory originalBlob (or file if blob wasn't built)
    const decodeSourceBlob: Blob = originalBlob || file;

    if (!drawn && !canvasBlockedError) {
      // Try <img> with URL.createObjectURL and await img.decode()
      try {
        drawn = await decodeWithObjectUrl(decodeSourceBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        if (err instanceof ImageProcessError && err.stage === 'canvas') {
          canvasBlockedError = err;
        } else {
          stepLogs.push(`URL.createObjectURL + img.decode failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
          console.error('[ingestFiles] objectURL decode failed:', err);
        }
      }
    }

    if (!drawn && !canvasBlockedError) {
      // Try FileReader.readAsDataURL and decode that
      try {
        drawn = await decodeWithDataUrl(decodeSourceBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        if (err instanceof ImageProcessError && err.stage === 'canvas') {
          canvasBlockedError = err;
        } else {
          stepLogs.push(`FileReader.readAsDataURL + img.decode failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
          console.error('[ingestFiles] dataURL decode failed:', err);
        }
      }
    }

    if (!drawn && !canvasBlockedError && originalBlob) {
      // Try createImageBitmap on the in-memory originalBlob with normalized MIME type
      try {
        drawn = await decodeWithBitmap(originalBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        if (err instanceof ImageProcessError && err.stage === 'canvas') {
          canvasBlockedError = err;
        } else {
          stepLogs.push(`createImageBitmap(originalBlob) failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
        }
      }
    }

    // 3. If the file is HEIC/HEIF and the browser could not decode it natively, lazy-load heic2any
    let heicConversionFailed = false;
    if (!drawn && !canvasBlockedError && isHeic && originalBlob) {
      try {
        const convertedJpgBlob = await convertHeicBlobInMemory(originalBlob);
        originalBlob = convertedJpgBlob;
        drawn = await decodeWithObjectUrl(convertedJpgBlob, MAX_WORKING_DIMENSION);
      } catch (heicErr) {
        if (heicErr instanceof ImageProcessError && heicErr.stage === 'canvas') {
          canvasBlockedError = heicErr;
        } else {
          heicConversionFailed = true;
          stepLogs.push(`heic2any conversion failed: ${heicErr instanceof Error ? `${heicErr.name}: ${heicErr.message}` : String(heicErr)}`);
          console.error('[ingestFiles] heic2any fallback failed:', heicErr);
        }
      }
    }

    if (canvasBlockedError) {
      results.push({
        id,
        name: fileName,
        size: actualSize,
        type: mimeType,
        originalBlob: null,
        workingCanvas: null,
        width: 0,
        height: 0,
        originalWidth: 0,
        originalHeight: 0,
        previewUrl: '',
        thumbnailUrl: '',
        warning,
        error: ERROR_MSG_CANVAS_BLOCKED,
        errorStage: 'canvas',
        errorDetails: buildDiagnosticDetails(canvasBlockedError, {
          name: fileName,
          type: mimeType,
          size: actualSize,
          stage: 'canvas (Brave Shields / fingerprint check)',
          extra: stepLogs.join(' | '),
        }),
      });
      continue;
    }

    if (!drawn) {
      const friendlyMsg = isHeic || heicConversionFailed ? ERROR_MSG_HEIC_FAILED : ERROR_MSG_UNSUPPORTED_FORMAT;
      results.push({
        id,
        name: fileName,
        size: actualSize,
        type: mimeType,
        originalBlob: null,
        workingCanvas: null,
        width: 0,
        height: 0,
        originalWidth: 0,
        originalHeight: 0,
        previewUrl: '',
        thumbnailUrl: '',
        warning,
        error: friendlyMsg,
        errorStage: 'decode',
        errorDetails: buildDiagnosticDetails(new Error(friendlyMsg), {
          name: fileName,
          type: mimeType,
          size: actualSize,
          stage: isHeic ? 'decode (HEIC/HEIF)' : 'decode (all decoders failed)',
          extra: stepLogs.join(' | '),
        }),
      });
      continue;
    }

    // Create preview & thumbnail URLs once from the in-memory workingCanvas
    let previewUrl = '';
    let thumbnailUrl = '';
    try {
      const urls = await createPreviewAndThumbnailFromCanvas(drawn.canvas);
      previewUrl = urls.previewUrl;
      thumbnailUrl = urls.thumbnailUrl;
    } catch (thumbErr) {
      console.warn('[ingestFiles] Could not create preview blob URL:', thumbErr);
    }

    results.push({
      id,
      name: fileName,
      size: actualSize,
      type: isHeic ? 'image/jpeg' : mimeType,
      originalBlob,
      workingCanvas: drawn.canvas,
      width: drawn.width,
      height: drawn.height,
      originalWidth: drawn.originalWidth,
      originalHeight: drawn.originalHeight,
      previewUrl,
      thumbnailUrl,
      warning,
    });
  }

  return results;
}

/**
 * Ensures we have a live workingCanvas for an IngestedFileItem.
 * Uses item.workingCanvas directly; if it was ever released, re-decodes from item.originalBlob in memory.
 * Never touches a File object.
 */
async function ensureWorkingCanvas(
  item: IngestedFileItem
): Promise<{
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}> {
  if (
    item.workingCanvas &&
    item.workingCanvas.width > 0 &&
    item.workingCanvas.height > 0
  ) {
    return {
      canvas: item.workingCanvas,
      width: item.workingCanvas.width,
      height: item.workingCanvas.height,
      originalWidth: item.originalWidth || item.workingCanvas.width,
      originalHeight: item.originalHeight || item.workingCanvas.height,
    };
  }

  if (item.originalBlob) {
    const decoded = await decodeWithObjectUrl(item.originalBlob, MAX_WORKING_DIMENSION);
    item.workingCanvas = decoded.canvas;
    item.width = decoded.width;
    item.height = decoded.height;
    return {
      canvas: decoded.canvas,
      width: decoded.width,
      height: decoded.height,
      originalWidth: item.originalWidth || decoded.originalWidth,
      originalHeight: item.originalHeight || decoded.originalHeight,
    };
  }

  throw new ImageProcessError(
    ERROR_MSG_READ_BLOCKED,
    'MissingInMemoryData: Neither workingCanvas nor originalBlob is available in memory.',
    'process'
  );
}

export function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  const normalizedQuality =
    mimeType === 'image/png'
      ? undefined
      : typeof quality === 'number'
      ? Math.max(0.05, Math.min(1, quality))
      : undefined;

  if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({
      type: mimeType,
      quality: normalizedQuality,
    });
  }

  return new Promise((resolve, reject) => {
    try {
      (canvas as HTMLCanvasElement).toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`EncodingError: Browser returned null Blob for ${mimeType}.`));
            return;
          }
          resolve(blob);
        },
        mimeType,
        normalizedQuality
      );
    } catch (err) {
      reject(err);
    }
  });
}

export function getOutputFilename(
  originalName: string,
  suffix: string,
  targetMimeType: string
): string {
  const base = (originalName || 'image').replace(/\.[^/.]+$/, '') || 'image';
  let ext = 'jpg';
  if (targetMimeType === 'image/png') ext = 'png';
  else if (targetMimeType === 'image/webp') ext = 'webp';
  else if (targetMimeType === 'application/pdf') ext = 'pdf';
  return `${base}${suffix ? `-${suffix}` : ''}.${ext}`;
}

/**
 * Web Worker script that ONLY receives already-decoded, downscaled pixels (ImageData buffer)
 * and runs the encode loop on OffscreenCanvas. Never touches File objects.
 */
const WORKER_ENCODE_SCRIPT = `
self.onmessage = async (event) => {
  const { jobId, mode, width, height, pixelsBuffer, mimeType, quality, targetBytes } = event.data;
  try {
    if (typeof OffscreenCanvas === 'undefined') {
      throw new Error('OffscreenCanvas is not available in this Web Worker');
    }

    const clamped = new Uint8ClampedArray(pixelsBuffer);
    const imgData = new ImageData(clamped, width, height);
    const baseCanvas = new OffscreenCanvas(width, height);
    const baseCtx = baseCanvas.getContext('2d');
    if (!baseCtx) {
      throw new Error('Could not acquire 2D context on OffscreenCanvas');
    }
    baseCtx.putImageData(imgData, 0, 0);

    if (mode === 'encodeSingle') {
      const q = mimeType === 'image/png' ? undefined : Math.max(0.05, Math.min(1, quality));
      const blob = await baseCanvas.convertToBlob({ type: mimeType, quality: q });
      self.postMessage({
        jobId,
        status: 'done',
        blob,
        width,
        height,
        mimeType,
      });
      return;
    }

    if (mode === 'encodeTargetKB') {
      let curW = width;
      let curH = height;
      let bestBlob = null;
      let bestW = curW;
      let bestH = curH;

      for (let round = 0; round < 4; round++) {
        let roundCanvas = baseCanvas;
        if (round > 0) {
          curW = Math.max(48, Math.round(curW * 0.85));
          curH = Math.max(48, Math.round(curH * 0.85));
          roundCanvas = new OffscreenCanvas(curW, curH);
          const rCtx = roundCanvas.getContext('2d');
          rCtx.imageSmoothingEnabled = true;
          rCtx.imageSmoothingQuality = 'high';
          rCtx.fillStyle = '#FFFFFF';
          rCtx.fillRect(0, 0, curW, curH);
          rCtx.drawImage(baseCanvas, 0, 0, curW, curH);
        }

        let low = 0.3;
        let high = 0.92;
        let hit90To100 = false;

        for (let iter = 0; iter < 7; iter++) {
          const mid = iter === 0 ? 0.3 : (low + high) / 2;
          const testBlob = await roundCanvas.convertToBlob({ type: 'image/jpeg', quality: mid });

          const isBetter =
            !bestBlob ||
            (bestBlob.size > targetBytes && testBlob.size < bestBlob.size) ||
            (testBlob.size <= targetBytes &&
              (bestBlob.size > targetBytes || testBlob.size > bestBlob.size));

          if (isBetter) {
            bestBlob = testBlob;
            bestW = curW;
            bestH = curH;
            self.postMessage({
              jobId,
              status: 'candidate',
              blob: bestBlob,
              width: bestW,
              height: bestH,
              mimeType: 'image/jpeg',
            });
          }

          if (testBlob.size >= targetBytes * 0.9 && testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            bestW = curW;
            bestH = curH;
            hit90To100 = true;
            break;
          }

          if (iter === 0 && testBlob.size > targetBytes) {
            break;
          }

          if (testBlob.size <= targetBytes) {
            low = mid;
          } else {
            high = mid;
          }
        }

        if (hit90To100 || (bestBlob && bestBlob.size <= targetBytes)) {
          break;
        }
      }

      if (bestBlob && bestBlob.size > targetBytes) {
        const scale = Math.max(0.25, Math.sqrt(targetBytes / bestBlob.size) * 0.88);
        const finalW = Math.max(40, Math.round(bestW * scale));
        const finalH = Math.max(40, Math.round(bestH * scale));
        const finalCanvas = new OffscreenCanvas(finalW, finalH);
        const fCtx = finalCanvas.getContext('2d');
        fCtx.fillStyle = '#FFFFFF';
        fCtx.fillRect(0, 0, finalW, finalH);
        fCtx.drawImage(baseCanvas, 0, 0, finalW, finalH);
        const finalBlob = await finalCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.5 });
        if (finalBlob.size <= bestBlob.size) {
          bestBlob = finalBlob;
          bestW = finalW;
          bestH = finalH;
        }
      }

      self.postMessage({
        jobId,
        status: 'done',
        blob: bestBlob,
        width: bestW,
        height: bestH,
        mimeType: 'image/jpeg',
      });
      return;
    }
  } catch (err) {
    self.postMessage({
      jobId,
      status: 'error',
      error: err && err.message ? err.name + ': ' + err.message : String(err),
    });
  }
};
`;

let sharedWorker: Worker | null = null;
let sharedWorkerUrl: string | null = null;
let workerJobSeq = 0;

function getOrCreateEncodeWorker(): Worker | null {
  if (
    typeof window === 'undefined' ||
    typeof Worker === 'undefined' ||
    typeof OffscreenCanvas === 'undefined'
  ) {
    return null;
  }
  if (!sharedWorker) {
    try {
      const blob = new Blob([WORKER_ENCODE_SCRIPT], { type: 'application/javascript' });
      sharedWorkerUrl = URL.createObjectURL(blob);
      sharedWorker = new Worker(sharedWorkerUrl);
    } catch (err) {
      console.error('[worker]', 'Failed to create encode worker, falling back to main thread', err);
      sharedWorker = null;
    }
  }
  return sharedWorker;
}

export function resetImageWorker(): void {
  if (sharedWorker) {
    try {
      sharedWorker.terminate();
    } catch {}
    sharedWorker = null;
  }
  if (sharedWorkerUrl) {
    try {
      URL.revokeObjectURL(sharedWorkerUrl);
    } catch {}
    sharedWorkerUrl = null;
  }
}

/**
 * Transfers ONLY the downscaled ImageData pixels from a main-thread canvas to the Web Worker
 * for encoding. If the worker fails to start or throws for any reason (or forceMainThread is true),
 * automatically falls back to encoding on the main thread in small async steps.
 */
async function encodeCanvasWithWorkerOrFallback(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  mimeType: string,
  quality: number | undefined,
  filename: string,
  forceMainThread: boolean = false
): Promise<ProcessedImageResult> {
  const width = canvas.width;
  const height = canvas.height;

  verifyCanvasNotBlocked(canvas, ctx);

  const mainThreadEncode = async (): Promise<ProcessedImageResult> => {
    await waitNextFrame();
    const blob = await canvasToBlob(canvas, mimeType, quality);
    return {
      blob,
      url: URL.createObjectURL(blob),
      width,
      height,
      sizeBytes: blob.size,
      filename,
      mimeType,
    };
  };

  if (forceMainThread) {
    return mainThreadEncode();
  }

  const worker = getOrCreateEncodeWorker();
  if (!worker) {
    return mainThreadEncode();
  }

  let pixelsBuffer: ArrayBuffer;
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    pixelsBuffer = imgData.data.buffer.slice(0);
  } catch (err) {
    console.error('[worker]', 'Could not extract ImageData for worker transfer, using main thread', err);
    return mainThreadEncode();
  }

  const jobId = ++workerJobSeq;

  return new Promise<ProcessedImageResult>((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resetImageWorker();
      mainThreadEncode().then(resolve).catch(reject);
    }, SAFETY_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.jobId !== jobId || settled) return;

      if (data.status === 'done' && data.blob) {
        settled = true;
        cleanup();
        resolve({
          blob: data.blob,
          url: URL.createObjectURL(data.blob),
          width: data.width,
          height: data.height,
          sizeBytes: data.blob.size,
          filename,
          mimeType: data.mimeType,
        });
        return;
      }

      if (data.status === 'error') {
        settled = true;
        cleanup();
        console.error('[worker]', 'Worker encode error, running main-thread fallback:', data.error);
        mainThreadEncode().then(resolve).catch(reject);
      }
    };

    const onError = (err: ErrorEvent) => {
      if (settled) return;
      settled = true;
      cleanup();
      console.error('[worker]', 'Worker error event, running main-thread fallback:', err);
      resetImageWorker();
      mainThreadEncode().then(resolve).catch(reject);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    try {
      worker.postMessage(
        {
          jobId,
          mode: 'encodeSingle',
          width,
          height,
          pixelsBuffer,
          mimeType,
          quality: quality ?? 0.9,
        },
        [pixelsBuffer]
      );
    } catch (postErr) {
      settled = true;
      cleanup();
      console.error('[worker]', 'postMessage failed, running main-thread fallback:', postErr);
      mainThreadEncode().then(resolve).catch(reject);
    }
  });
}

export async function compressOrConvertImage(
  item: IngestedFileItem,
  options: {
    quality: number;
    outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
    backgroundColor?: string;
    suffix?: string;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const filename = getOutputFilename(
    item.name,
    options.suffix ?? 'optimized',
    options.outputMimeType
  );

  const loaded = await ensureWorkingCanvas(item);
  const { width, height } = loaded;

  const workCanvas = document.createElement('canvas');
  workCanvas.width = width;
  workCanvas.height = height;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!workCtx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not create working 2D context.',
      'canvas'
    );
  }

  if (options.outputMimeType === 'image/jpeg') {
    workCtx.fillStyle = options.backgroundColor || '#FFFFFF';
    workCtx.fillRect(0, 0, width, height);
  }

  workCtx.imageSmoothingEnabled = true;
  workCtx.imageSmoothingQuality = 'high';
  workCtx.drawImage(loaded.canvas, 0, 0, width, height);

  if (options.outputMimeType === 'image/png' && options.quality < 95) {
    await waitNextFrame();
    const levels = Math.max(8, Math.round((options.quality / 100) * 64));
    const step = 255 / (levels - 1);
    const imgData = workCtx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round(Math.round(d[i] / step) * step);
      d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step);
      d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step);
    }
    workCtx.putImageData(imgData, 0, 0);
  }

  const normalizedQuality =
    options.outputMimeType === 'image/png'
      ? undefined
      : Math.max(0.05, Math.min(1, options.quality / 100));

  return encodeCanvasWithWorkerOrFallback(
    workCanvas,
    workCtx,
    options.outputMimeType,
    normalizedQuality,
    filename,
    options.forceMainThread
  );
}

export async function compressToTargetKB(
  item: IngestedFileItem,
  targetKB: number,
  forceMainThread: boolean = false
): Promise<ProcessedImageResult> {
  const filename = getOutputFilename(item.name, `${targetKB}kb`, 'image/jpeg');
  const targetBytes = targetKB * 1024;

  // Estimate needed pixel dimensions from target bytes: sqrt(targetBytes * 40) on the long side
  const estimatedLongSide = Math.max(120, Math.round(Math.sqrt(targetBytes * 40)));

  const loaded = await ensureWorkingCanvas(item);

  const scale = Math.min(1, estimatedLongSide / Math.max(loaded.width, loaded.height));
  const startW = Math.max(48, Math.round(loaded.width * scale));
  const startH = Math.max(48, Math.round(loaded.height * scale));

  const startCanvas = document.createElement('canvas');
  startCanvas.width = startW;
  startCanvas.height = startH;
  const startCtx = startCanvas.getContext('2d', { willReadFrequently: true });
  if (!startCtx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize target-KB working canvas.',
      'canvas'
    );
  }

  startCtx.fillStyle = '#FFFFFF';
  startCtx.fillRect(0, 0, startW, startH);
  startCtx.imageSmoothingEnabled = true;
  startCtx.imageSmoothingQuality = 'high';
  startCtx.drawImage(loaded.canvas, 0, 0, startW, startH);

  verifyCanvasNotBlocked(startCanvas, startCtx);

  // Main-thread responsive async fallback loop (yields a frame between each iteration)
  const runMainThreadTargetKBLoop = async (): Promise<ProcessedImageResult> => {
    let curW = startW;
    let curH = startH;
    let bestBlob: Blob | null = null;
    let bestW = curW;
    let bestH = curH;
    const startTime = Date.now();

    for (let round = 0; round < 4; round++) {
      let roundCanvas = startCanvas;
      if (round > 0) {
        curW = Math.max(48, Math.round(curW * 0.85));
        curH = Math.max(48, Math.round(curH * 0.85));
        roundCanvas = document.createElement('canvas');
        roundCanvas.width = curW;
        roundCanvas.height = curH;
        const rCtx = roundCanvas.getContext('2d')!;
        rCtx.imageSmoothingEnabled = true;
        rCtx.imageSmoothingQuality = 'high';
        rCtx.fillStyle = '#FFFFFF';
        rCtx.fillRect(0, 0, curW, curH);
        rCtx.drawImage(startCanvas, 0, 0, curW, curH);
      }

      let low = 0.3;
      let high = 0.92;
      let hit90To100 = false;

      for (let iter = 0; iter < 7; iter++) {
        await waitNextFrame();
        const mid = iter === 0 ? 0.3 : (low + high) / 2;
        const testBlob = await canvasToBlob(roundCanvas, 'image/jpeg', mid);

        const isBetter =
          !bestBlob ||
          (bestBlob.size > targetBytes && testBlob.size < bestBlob.size) ||
          (testBlob.size <= targetBytes &&
            (bestBlob.size > targetBytes || testBlob.size > bestBlob.size));

        if (isBetter) {
          bestBlob = testBlob;
          bestW = curW;
          bestH = curH;
        }

        if (testBlob.size >= targetBytes * 0.9 && testBlob.size <= targetBytes) {
          bestBlob = testBlob;
          bestW = curW;
          bestH = curH;
          hit90To100 = true;
          break;
        }

        if (Date.now() - startTime > SAFETY_TIMEOUT_MS && bestBlob) {
          return {
            blob: bestBlob,
            url: URL.createObjectURL(bestBlob),
            width: bestW,
            height: bestH,
            sizeBytes: bestBlob.size,
            filename,
            mimeType: 'image/jpeg',
            timedOut: true,
            timeoutMessage: 'Returned the best result found within 10 seconds.',
          };
        }

        if (iter === 0 && testBlob.size > targetBytes) {
          break;
        }

        if (testBlob.size <= targetBytes) {
          low = mid;
        } else {
          high = mid;
        }
      }

      if (hit90To100 || (bestBlob && bestBlob.size <= targetBytes)) {
        break;
      }
    }

    if (bestBlob && bestBlob.size > targetBytes) {
      await waitNextFrame();
      const s = Math.max(0.25, Math.sqrt(targetBytes / bestBlob.size) * 0.88);
      const finalW = Math.max(40, Math.round(bestW * s));
      const finalH = Math.max(40, Math.round(bestH * s));
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = finalW;
      finalCanvas.height = finalH;
      const fCtx = finalCanvas.getContext('2d')!;
      fCtx.fillStyle = '#FFFFFF';
      fCtx.fillRect(0, 0, finalW, finalH);
      fCtx.drawImage(startCanvas, 0, 0, finalW, finalH);
      const finalBlob = await canvasToBlob(finalCanvas, 'image/jpeg', 0.5);
      if (finalBlob.size <= bestBlob.size) {
        bestBlob = finalBlob;
        bestW = finalW;
        bestH = finalH;
      }
    }

    if (!bestBlob) {
      bestBlob = await canvasToBlob(startCanvas, 'image/jpeg', 0.5);
    }

    return {
      blob: bestBlob,
      url: URL.createObjectURL(bestBlob),
      width: bestW,
      height: bestH,
      sizeBytes: bestBlob.size,
      filename,
      mimeType: 'image/jpeg',
    };
  };

  if (forceMainThread) {
    return runMainThreadTargetKBLoop();
  }

  const worker = getOrCreateEncodeWorker();
  if (!worker) {
    return runMainThreadTargetKBLoop();
  }

  let pixelsBuffer: ArrayBuffer;
  try {
    const imgData = startCtx.getImageData(0, 0, startW, startH);
    pixelsBuffer = imgData.data.buffer.slice(0);
  } catch (err) {
    console.error('[worker]', 'Could not get ImageData for targetKB worker, falling back to main thread', err);
    return runMainThreadTargetKBLoop();
  }

  const jobId = ++workerJobSeq;

  return new Promise<ProcessedImageResult>((resolve, reject) => {
    let settled = false;
    let latestCandidate: { blob: Blob; width: number; height: number } | null = null;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resetImageWorker();
      if (latestCandidate) {
        resolve({
          blob: latestCandidate.blob,
          url: URL.createObjectURL(latestCandidate.blob),
          width: latestCandidate.width,
          height: latestCandidate.height,
          sizeBytes: latestCandidate.blob.size,
          filename,
          mimeType: 'image/jpeg',
          timedOut: true,
          timeoutMessage: 'Returned the best result found within 10 seconds.',
        });
      } else {
        runMainThreadTargetKBLoop().then(resolve).catch(reject);
      }
    }, SAFETY_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.jobId !== jobId || settled) return;

      if (data.status === 'candidate' && data.blob) {
        latestCandidate = {
          blob: data.blob,
          width: data.width,
          height: data.height,
        };
        return;
      }

      if (data.status === 'done' && data.blob) {
        settled = true;
        cleanup();
        resolve({
          blob: data.blob,
          url: URL.createObjectURL(data.blob),
          width: data.width,
          height: data.height,
          sizeBytes: data.blob.size,
          filename,
          mimeType: 'image/jpeg',
        });
        return;
      }

      if (data.status === 'error') {
        settled = true;
        cleanup();
        console.error('[worker]', 'Worker targetKB error, falling back to main thread:', data.error);
        runMainThreadTargetKBLoop().then(resolve).catch(reject);
      }
    };

    const onError = (err: ErrorEvent) => {
      if (settled) return;
      settled = true;
      cleanup();
      console.error('[worker]', 'Worker error during targetKB, falling back to main thread:', err);
      resetImageWorker();
      runMainThreadTargetKBLoop().then(resolve).catch(reject);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    try {
      worker.postMessage(
        {
          jobId,
          mode: 'encodeTargetKB',
          width: startW,
          height: startH,
          pixelsBuffer,
          targetBytes,
        },
        [pixelsBuffer]
      );
    } catch (postErr) {
      settled = true;
      cleanup();
      console.error('[worker]', 'postMessage failed for targetKB, falling back to main thread:', postErr);
      runMainThreadTargetKBLoop().then(resolve).catch(reject);
    }
  });
}

export async function resizeImageFile(
  item: IngestedFileItem,
  options: {
    width: number;
    height: number;
    quality: number;
    outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const w = Math.max(1, Math.min(4096, Math.round(options.width)));
  const h = Math.max(1, Math.min(4096, Math.round(options.height)));
  const filename = getOutputFilename(item.name, `${w}x${h}`, options.outputMimeType);

  const loaded = await ensureWorkingCanvas(item);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize resize canvas.',
      'canvas'
    );
  }

  if (options.outputMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(loaded.canvas, 0, 0, w, h);

  const q = options.outputMimeType === 'image/png' ? undefined : options.quality / 100;
  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    options.outputMimeType,
    q,
    filename,
    options.forceMainThread
  );
}

export async function cropImageFile(
  item: IngestedFileItem,
  cropNorm: { x: number; y: number; width: number; height: number },
  outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  forceMainThread: boolean = false
): Promise<ProcessedImageResult> {
  const filename = getOutputFilename(item.name, 'cropped', outputMimeType);
  const loaded = await ensureWorkingCanvas(item);

  const sx = Math.max(0, Math.round(cropNorm.x * loaded.width));
  const sy = Math.max(0, Math.round(cropNorm.y * loaded.height));
  const sw = Math.max(1, Math.min(loaded.width - sx, Math.round(cropNorm.width * loaded.width)));
  const sh = Math.max(1, Math.min(loaded.height - sy, Math.round(cropNorm.height * loaded.height)));

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize crop canvas.',
      'canvas'
    );
  }

  if (outputMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sw, sh);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(loaded.canvas, sx, sy, sw, sh, 0, 0, sw, sh);

  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    outputMimeType,
    0.92,
    filename,
    forceMainThread
  );
}

export async function generatePassportPhoto(
  item: IngestedFileItem,
  options: {
    sizePreset: '35x45mm' | '2x2in' | '51x51mm';
    zoom: number;
    panX: number;
    panY: number;
    brightenBackground: boolean;
    outputLayout: 'single' | 'a4-sheet';
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const label =
    options.sizePreset === '35x45mm'
      ? '35x45mm'
      : options.sizePreset === '2x2in'
      ? '2x2in'
      : '51x51mm';
  const suffix =
    options.outputLayout === 'single' ? `passport-${label}` : `passport-a4-sheet-${label}`;
  const filename = getOutputFilename(item.name, suffix, 'image/jpeg');

  const loaded = await ensureWorkingCanvas(item);

  const spec =
    options.sizePreset === '35x45mm'
      ? { w: 413, h: 531 }
      : options.sizePreset === '2x2in'
      ? { w: 600, h: 600 }
      : { w: 602, h: 602 };

  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = spec.w;
  singleCanvas.height = spec.h;
  const ctx = singleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize passport photo canvas.',
      'canvas'
    );
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, spec.w, spec.h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const targetAspect = spec.w / spec.h;
  const imgAspect = loaded.width / loaded.height;
  let baseCropW = loaded.width;
  let baseCropH = loaded.height;
  if (imgAspect > targetAspect) {
    baseCropW = loaded.height * targetAspect;
  } else {
    baseCropH = loaded.width / targetAspect;
  }

  const cropW = baseCropW / options.zoom;
  const cropH = baseCropH / options.zoom;
  const maxOffsetX = (loaded.width - cropW) / 2;
  const maxOffsetY = (loaded.height - cropH) / 2;

  const centerX =
    loaded.width / 2 - (options.panX / 50) * Math.max(maxOffsetX, loaded.width * 0.25);
  const centerY =
    loaded.height / 2 - (options.panY / 50) * Math.max(maxOffsetY, loaded.height * 0.25);

  const sx = Math.max(0, Math.min(loaded.width - cropW, centerX - cropW / 2));
  const sy = Math.max(0, Math.min(loaded.height - cropH, centerY - cropH / 2));

  ctx.drawImage(loaded.canvas, sx, sy, cropW, cropH, 0, 0, spec.w, spec.h);

  if (options.brightenBackground) {
    const imgData = ctx.getImageData(0, 0, spec.w, spec.h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      if (lum > 185 && sat < 38) {
        const boost = Math.min(1, (lum - 185) / 55);
        d[i] = Math.min(255, Math.round(r + (255 - r) * boost * 0.85));
        d[i + 1] = Math.min(255, Math.round(g + (255 - g) * boost * 0.85));
        d[i + 2] = Math.min(255, Math.round(b + (255 - b) * boost * 0.85));
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  if (options.outputLayout === 'single') {
    return encodeCanvasWithWorkerOrFallback(
      singleCanvas,
      ctx,
      'image/jpeg',
      0.94,
      filename,
      options.forceMainThread
    );
  }

  const a4W = 1654; // 200 DPI A4 sheet for fast, crisp printing and low memory footprint
  const a4H = 2339;
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = a4W;
  sheetCanvas.height = a4H;
  const sCtx = sheetCanvas.getContext('2d', { willReadFrequently: true })!;
  sCtx.fillStyle = '#FFFFFF';
  sCtx.fillRect(0, 0, a4W, a4H);

  const scaleSheet = 200 / 300;
  const cellW = Math.round(spec.w * scaleSheet);
  const cellH = Math.round(spec.h * scaleSheet);
  const cols = 3;
  const rows = 3;
  const gap = 48;
  const gridW = cols * cellW + (cols - 1) * gap;
  const startX = Math.round((a4W - gridW) / 2);
  const startY = 160;

  sCtx.strokeStyle = '#D4D4D8';
  sCtx.lineWidth = 1.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cellW + gap);
      const y = startY + r * (cellH + gap);
      sCtx.drawImage(singleCanvas, 0, 0, spec.w, spec.h, x, y, cellW, cellH);
      sCtx.strokeRect(x - 1, y - 1, cellW + 2, cellH + 2);
    }
  }

  return encodeCanvasWithWorkerOrFallback(
    sheetCanvas,
    sCtx,
    'image/jpeg',
    0.92,
    filename,
    options.forceMainThread
  );
}

export async function rotateFlipImageFile(
  item: IngestedFileItem,
  options: {
    rotateDegrees: number;
    straightenAngle: number;
    flipH: boolean;
    flipV: boolean;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const outMime =
    item.type === 'image/png'
      ? 'image/png'
      : item.type === 'image/webp'
      ? 'image/webp'
      : 'image/jpeg';
  const filename = getOutputFilename(item.name, 'rotated', outMime);

  const loaded = await ensureWorkingCanvas(item);
  const normRot = ((options.rotateDegrees % 360) + 360) % 360;
  const swapDims = normRot === 90 || normRot === 270;
  const w = swapDims ? loaded.height : loaded.width;
  const h = swapDims ? loaded.width : loaded.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (outMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.save();
  ctx.translate(w / 2, h / 2);
  const totalRad = ((normRot + options.straightenAngle) * Math.PI) / 180;
  ctx.rotate(totalRad);
  ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  ctx.drawImage(loaded.canvas, -loaded.width / 2, -loaded.height / 2);
  ctx.restore();

  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    outMime,
    outMime === 'image/png' ? undefined : 0.92,
    filename,
    options.forceMainThread
  );
}

export async function addWatermarkToImage(
  item: IngestedFileItem,
  options: {
    text: string;
    opacity: number;
    fontSizePercent: number;
    color: string;
    position: WatermarkPosition;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const outMime =
    item.type === 'image/png'
      ? 'image/png'
      : item.type === 'image/webp'
      ? 'image/webp'
      : 'image/jpeg';
  const filename = getOutputFilename(item.name, 'watermarked', outMime);

  const loaded = await ensureWorkingCanvas(item);
  const w = loaded.width;
  const h = loaded.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (outMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(loaded.canvas, 0, 0, w, h);

  const label = (options.text || '© Pixelo').trim();
  if (label) {
    const pxSize = Math.max(14, Math.round((w * options.fontSizePercent) / 100));
    ctx.save();
    ctx.font = `600 ${pxSize}px sans-serif`;
    ctx.fillStyle = options.color;
    ctx.globalAlpha = Math.max(0.05, Math.min(1, options.opacity / 100));
    ctx.shadowColor =
      options.color === '#111111' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = Math.max(2, Math.round(pxSize * 0.12));

    const pad = Math.max(20, Math.round(w * 0.035));

    if (options.position === 'tiled') {
      ctx.translate(w / 2, h / 2);
      ctx.rotate((-28 * Math.PI) / 180);
      const stepX = Math.max(pxSize * 7, Math.round(ctx.measureText(label).width * 1.45));
      const stepY = Math.max(pxSize * 3.5, 90);
      const diag = Math.hypot(w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let y = -diag; y <= diag; y += stepY) {
        for (let x = -diag; x <= diag; x += stepX) {
          ctx.fillText(label, x, y);
        }
      }
    } else {
      if (options.position === 'center') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, w / 2, h / 2);
      } else if (options.position === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, w - pad, h - pad);
      } else if (options.position === 'bottom-left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, pad, h - pad);
      } else if (options.position === 'top-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(label, w - pad, pad);
      } else if (options.position === 'top-left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, pad, pad);
      }
    }
    ctx.restore();
  }

  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    outMime,
    outMime === 'image/png' ? undefined : 0.92,
    filename,
    options.forceMainThread
  );
}

export async function convertToBlackAndWhite(
  item: IngestedFileItem,
  options: {
    preset: 'standard' | 'high-contrast' | 'soft' | 'sepia';
    contrast: number;
    brightness: number;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const outMime =
    item.type === 'image/png'
      ? 'image/png'
      : item.type === 'image/webp'
      ? 'image/webp'
      : 'image/jpeg';
  const filename = getOutputFilename(item.name, 'bw', outMime);

  const loaded = await ensureWorkingCanvas(item);
  const w = loaded.width;
  const h = loaded.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (outMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(loaded.canvas, 0, 0, w, h);

  await waitNextFrame();
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const presetContrast =
    options.preset === 'high-contrast' ? 28 : options.preset === 'soft' ? -10 : 0;
  const totalContrast = Math.max(-80, Math.min(80, options.contrast + presetContrast));
  const factor = (259 * (totalContrast + 255)) / (255 * (259 - totalContrast));
  const brightOffset = (options.brightness / 100) * 140;

  for (let i = 0; i < d.length; i += 4) {
    let lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    lum = factor * (lum - 128) + 128 + brightOffset;
    if (options.preset === 'soft') {
      lum = 12 + lum * 0.9;
    }
    const clamped = Math.max(0, Math.min(255, Math.round(lum)));

    if (options.preset === 'sepia') {
      d[i] = Math.min(255, Math.round(clamped * 1.07));
      d[i + 1] = Math.round(clamped * 0.98);
      d[i + 2] = Math.round(clamped * 0.84);
    } else {
      d[i] = clamped;
      d[i + 1] = clamped;
      d[i + 2] = clamped;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    outMime,
    outMime === 'image/png' ? undefined : 0.9,
    filename,
    options.forceMainThread
  );
}

/**
 * Adds images to the PDF one at a time in a queue from the already-captured workingCanvas.
 * Never reads a File object.
 */
export async function buildPdfFromImages(
  items: IngestedFileItem[],
  options: {
    pageSize: 'a4' | 'letter' | 'fit';
    orientation: 'portrait' | 'landscape';
    marginPt: number;
    quality: number;
    forceMainThread?: boolean;
  },
  onProgress?: (current: number, total: number) => void,
  isCancelled?: () => boolean
): Promise<ProcessedImageResult> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < items.length; i++) {
    if (isCancelled?.()) {
      throw new Error('Cancelled');
    }
    onProgress?.(i + 1, items.length);
    const item = items[i];

    const loaded = await ensureWorkingCanvas(item);
    const maxPageSide = 1600;
    const scale = Math.min(1, maxPageSide / Math.max(loaded.width, loaded.height));
    const pageImgW = Math.max(1, Math.round(loaded.width * scale));
    const pageImgH = Math.max(1, Math.round(loaded.height * scale));

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = pageImgW;
    pageCanvas.height = pageImgH;
    const pCtx = pageCanvas.getContext('2d', { willReadFrequently: true })!;
    pCtx.fillStyle = '#FFFFFF';
    pCtx.fillRect(0, 0, pageImgW, pageImgH);
    pCtx.imageSmoothingEnabled = true;
    pCtx.imageSmoothingQuality = 'high';
    pCtx.drawImage(loaded.canvas, 0, 0, pageImgW, pageImgH);

    const encodedPage = await encodeCanvasWithWorkerOrFallback(
      pageCanvas,
      pCtx,
      'image/jpeg',
      options.quality / 100,
      'page.jpg',
      options.forceMainThread
    );

    pageCanvas.width = 0;
    pageCanvas.height = 0;

    URL.revokeObjectURL(encodedPage.url);
    const jpgBytes = await encodedPage.blob.arrayBuffer();
    const embeddedJpg = await pdfDoc.embedJpg(jpgBytes);

    if (options.pageSize === 'fit') {
      const page = pdfDoc.addPage([embeddedJpg.width, embeddedJpg.height]);
      page.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: embeddedJpg.width,
        height: embeddedJpg.height,
      });
    } else {
      const baseDims = options.pageSize === 'a4' ? [595.28, 841.89] : [612, 792];
      const pageW = options.orientation === 'portrait' ? baseDims[0] : baseDims[1];
      const pageH = options.orientation === 'portrait' ? baseDims[1] : baseDims[0];

      const page = pdfDoc.addPage([pageW, pageH]);
      const availW = Math.max(50, pageW - options.marginPt * 2);
      const availH = Math.max(50, pageH - options.marginPt * 2);

      const fitScale = Math.min(availW / embeddedJpg.width, availH / embeddedJpg.height);
      const drawW = embeddedJpg.width * fitScale;
      const drawH = embeddedJpg.height * fitScale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      page.drawImage(embeddedJpg, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }

    await waitNextFrame();
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const firstBase = items[0]?.name || 'document.jpg';
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: items.length,
    height: 1,
    sizeBytes: blob.size,
    filename: getOutputFilename(
      firstBase,
      items.length > 1 ? `merged-${items.length}p` : 'document',
      'application/pdf'
    ),
    mimeType: 'application/pdf',
  };
}
