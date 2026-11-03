import { getLastTamperReport } from './canvas-check';

export type OutputFormatLabel = 'JPG' | 'PNG' | 'WebP' | 'PDF';

export interface ProcessedImageResult {
  blob: Blob;
  url: string;
  previewUrl: string;
  originalBytes: number;
  newBytes: number;
  sizeBytes: number;
  qualityUsed: number | null;
  format: OutputFormatLabel;
  width: number;
  height: number;
  jobId: number;
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
  previewUrl: string; // Downscaled preview (longest side <= 1600)
  thumbnailUrl: string; // File-list thumbnail (longest side <= 256)
  warning?: string;
  error?: string;
  errorStage?: 'read' | 'decode' | 'process' | 'encode';
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
export const MAX_PREVIEW_DIMENSION = 1600;
export const MAX_THUMB_DIMENSION = 256;
const SAFETY_TIMEOUT_MS = 10000;

export const ERROR_MSG_READ_BLOCKED =
  'Your phone blocked access to this photo. Tap Choose photos again and pick it from Gallery or Files.';
export const ERROR_MSG_UNSUPPORTED_FORMAT =
  "This image couldn't be decoded. It may be corrupted or in an unsupported encoding.";
export const ERROR_MSG_HEIC_FAILED =
  "This HEIC photo can't be read in your browser. Change your camera format to JPG, or share it as a JPG from your gallery.";
export const ERROR_MSG_CANVAS_BLOCKED =
  'Your browser blocked canvas pixel access while processing this image.';

export class ImageProcessError extends Error {
  details: string;
  stage: 'read' | 'decode' | 'process' | 'encode';

  constructor(
    friendlyMessage: string,
    details: string,
    stage: 'read' | 'decode' | 'process' | 'encode' = 'process'
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
  meta?: {
    name?: string;
    type?: string;
    size?: number;
    dimensions?: string;
    stage?: 'read' | 'decode' | 'process' | 'encode' | string;
    tamperReport?: string;
    extra?: string;
  }
): string {
  const errNameAndMsg =
    err instanceof ImageProcessError
      ? `${err.name}: ${err.message}${err.details ? ` (${err.details})` : ''}`
      : err instanceof Error
      ? `${err.name || 'Error'}: ${err.message || 'Unknown error'}`
      : typeof err === 'string'
      ? err
      : String(err);

  const stageVal =
    meta?.stage || (err instanceof ImageProcessError ? err.stage : 'process');
  const tamperText = meta?.tamperReport || getLastTamperReport() || 'not-run';

  const lines = [
    `Stage: ${stageVal}`,
    `Error: ${errNameAndMsg}`,
    `File: ${meta?.name || 'unknown'}`,
    `MIME Type: ${meta?.type || '(empty)'}`,
    `Size: ${meta?.size ?? 0} bytes (${formatBytes(meta?.size ?? 0)})`,
    `Dimensions: ${meta?.dimensions || 'unknown'}`,
    `Tamper Check: ${tamperText}`,
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

/**
 * Shared byte formatter used everywhere (file row, result line, summary card, and Number Ticker):
 * - KB with one decimal under 1000 KB
 * - MB with two decimals at or above 1000 KB
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 KB';
  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function getFormattedSizeParts(bytes: number): {
  value: number;
  decimals: number;
  unit: 'KB' | 'MB';
  formatted: string;
} {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return { value: 0, decimals: 1, unit: 'KB', formatted: '0.0 KB' };
  }
  const kb = bytes / 1024;
  if (kb < 1000) {
    const val = Number(kb.toFixed(1));
    return {
      value: val,
      decimals: 1,
      unit: 'KB',
      formatted: `${val.toFixed(1)} KB`,
    };
  }
  const mb = kb / 1024;
  const val = Number(mb.toFixed(2));
  return {
    value: val,
    decimals: 2,
    unit: 'MB',
    formatted: `${val.toFixed(2)} MB`,
  };
}

export function mimeToFormatLabel(mimeType: string): OutputFormatLabel {
  const clean = (mimeType || '').toLowerCase();
  if (clean === 'image/png') return 'PNG';
  if (clean === 'image/webp') return 'WebP';
  if (clean === 'application/pdf') return 'PDF';
  return 'JPG';
}

export function normalizeOutputMimeType(
  mimeType: string
): 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' {
  const clean = (mimeType || '').trim().toLowerCase();
  if (clean === 'image/png') return 'image/png';
  if (clean === 'image/webp') return 'image/webp';
  if (clean === 'application/pdf') return 'application/pdf';
  return 'image/jpeg';
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

export function isHeicMimeOrName(
  fileName: string,
  mimeType: string,
  buffer?: ArrayBuffer | null
): boolean {
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
      'decode'
    );
  }

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

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
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('HTMLImageElement onerror fired for object URL.'));
      img.src = objectUrl;
    });
    if (typeof img.decode === 'function') {
      try {
        await img.decode();
      } catch {}
    }
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;
    if (!origW || !origH) {
      throw new Error('Image decoded with zero dimensions (0x0).');
    }

    // If createImageBitmap with resize options is available and image is huge, try hardware-assisted resize with EXIF orientation
    if (
      typeof createImageBitmap === 'function' &&
      Math.max(origW, origH) > maxLongestSide
    ) {
      const scale = maxLongestSide / Math.max(origW, origH);
      const targetW = Math.max(1, Math.round(origW * scale));
      const targetH = Math.max(1, Math.round(origH * scale));
      try {
        const resizedBmp = await createImageBitmap(blob, {
          resizeWidth: targetW,
          resizeHeight: targetH,
          resizeQuality: 'high',
          imageOrientation: 'from-image',
        } as ImageBitmapOptions);
        try {
          const drawn = drawDecodedSourceToWorkingCanvas(
            resizedBmp,
            origW,
            origH,
            maxLongestSide
          );
          return drawn;
        } finally {
          resizedBmp.close();
        }
      } catch {}
    }

    return drawDecodedSourceToWorkingCanvas(img, origW, origH, maxLongestSide);
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
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('HTMLImageElement onerror fired for Data URL.'));
      img.src = dataUrl;
    });
    if (typeof img.decode === 'function') {
      try {
        await img.decode();
      } catch {}
    }
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
      bitmap = await createImageBitmap(blob, {
        imageOrientation: 'from-image',
      } as ImageBitmapOptions);
    } catch {
      bitmap = await createImageBitmap(blob);
    }
    const origW = bitmap.width;
    const origH = bitmap.height;
    if (!origW || !origH) {
      throw new Error('ImageBitmap decoded with zero dimensions (0x0).');
    }

    if (Math.max(origW, origH) > maxLongestSide) {
      const scale = maxLongestSide / Math.max(origW, origH);
      const targetW = Math.max(1, Math.round(origW * scale));
      const targetH = Math.max(1, Math.round(origH * scale));
      try {
        const resized = await createImageBitmap(blob, {
          resizeWidth: targetW,
          resizeHeight: targetH,
          resizeQuality: 'high',
          imageOrientation: 'from-image',
        } as ImageBitmapOptions);
        bitmap.close();
        bitmap = resized;
      } catch {}
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

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('Invalid Data URL generated from canvas.');
  }
  const header = parts[0];
  const base64 = parts[1];
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  const normalizedMime = normalizeOutputMimeType(mimeType);
  const normalizedQuality =
    normalizedMime === 'image/png'
      ? undefined
      : typeof quality === 'number'
      ? Math.max(0.05, Math.min(1, quality))
      : undefined;

  if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
    try {
      const blob = await canvas.convertToBlob({
        type: normalizedMime,
        quality: normalizedQuality,
      });
      if (blob && blob.size > 0) return blob;
    } catch (err) {
      if (!('toDataURL' in canvas)) throw err;
    }
  }

  if ('toBlob' in canvas && typeof canvas.toBlob === 'function') {
    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(
          (b) => resolve(b),
          normalizedMime,
          normalizedQuality
        );
      } catch {
        resolve(null);
      }
    });
    if (blob && blob.size > 0) {
      return blob;
    }
  }

  // Fallback if toBlob returns null (e.g. certain palette/alpha PNGs or mobile WebViews)
  if ('toDataURL' in canvas && typeof canvas.toDataURL === 'function') {
    try {
      const dataUrl = canvas.toDataURL(normalizedMime, normalizedQuality);
      const fallbackBlob = dataUrlToBlob(dataUrl);
      if (fallbackBlob.size > 0) {
        return fallbackBlob;
      }
    } catch (fallbackErr) {
      throw new ImageProcessError(
        'Could not encode output image.',
        `toBlob returned null and toDataURL fallback failed: ${
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
        }`,
        'encode'
      );
    }
  }

  throw new ImageProcessError(
    'Could not encode output image.',
    `Browser returned null Blob for ${normalizedMime}.`,
    'encode'
  );
}

/**
 * Builds a downscaled preview URL (longest side <= 1600px) from a source canvas
 * so full-resolution images are never placed into an <img>.
 */
async function buildPreviewUrlFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const scale = Math.min(1, MAX_PREVIEW_DIMENSION / Math.max(w, h));
  const prevW = Math.max(1, Math.round(w * scale));
  const prevH = Math.max(1, Math.round(h * scale));

  const prevCanvas = document.createElement('canvas');
  prevCanvas.width = prevW;
  prevCanvas.height = prevH;
  const pCtx = prevCanvas.getContext('2d');
  if (!pCtx) {
    const fallbackBlob = await canvasToBlob(sourceCanvas, 'image/jpeg', 0.88);
    return URL.createObjectURL(fallbackBlob);
  }

  // Fill white behind transparent PNGs when previewing as JPEG, or keep PNG/WebP transparency if source is PNG
  const previewMime = mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  if (previewMime === 'image/jpeg') {
    pCtx.fillStyle = '#FFFFFF';
    pCtx.fillRect(0, 0, prevW, prevH);
  }

  pCtx.imageSmoothingEnabled = true;
  pCtx.imageSmoothingQuality = 'high';
  pCtx.drawImage(sourceCanvas, 0, 0, prevW, prevH);

  const previewBlob = await canvasToBlob(
    prevCanvas,
    previewMime,
    previewMime === 'image/png' ? undefined : 0.88
  );
  prevCanvas.width = 0;
  prevCanvas.height = 0;

  return URL.createObjectURL(previewBlob);
}

/**
 * Generates previewUrl (longest side max 1600px) and thumbnailUrl (longest side max 256px)
 * once from workingCanvas during intake.
 */
async function createPreviewAndThumbnailFromCanvas(
  workingCanvas: HTMLCanvasElement,
  sourceMimeType: string = 'image/jpeg',
  maxThumbEdge: number = MAX_THUMB_DIMENSION
): Promise<{ previewUrl: string; thumbnailUrl: string }> {
  const previewUrl = await buildPreviewUrlFromCanvas(workingCanvas, sourceMimeType);

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

export function releaseProcessedResultUrls(result?: ProcessedImageResult | null): void {
  if (!result) return;
  if (result.previewUrl && result.previewUrl !== result.url) {
    try {
      URL.revokeObjectURL(result.previewUrl);
    } catch {}
  }
  if (result.url) {
    try {
      URL.revokeObjectURL(result.url);
    } catch {}
  }
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
  if (item.result) {
    releaseProcessedResultUrls(item.result);
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
            stepLogs.push(
              `Immediate createImageBitmap(file) failed: ${
                err instanceof Error ? `${err.name}: ${err.message}` : String(err)
              }`
            );
            return null;
          })
        : Promise.resolve(null);

    const arrayBufferPromise: Promise<{ buffer: ArrayBuffer | null; error?: unknown }> =
      readArrayBufferWithRetry(file, 250)
        .then((buffer) => ({ buffer }))
        .catch((err) => {
          stepLogs.push(
            `arrayBuffer(file) with 250ms retry failed: ${
              err instanceof Error ? `${err.name}: ${err.message}` : String(err)
            }`
          );
          return { buffer: null, error: err };
        });

    const [immediateBitmap, bufferResult] = await Promise.all([
      immediateBitmapPromise,
      arrayBufferPromise,
    ]);

    const buffer = bufferResult.buffer;

    // If BOTH arrayBuffer read AND immediate bitmap failed, Android blocked access to the file handle
    if (!buffer && !immediateBitmap) {
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
          dimensions: '0 × 0 px',
          stage: 'read',
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

    // 1. If immediate createImageBitmap(file) succeeded, draw it once onto workingCanvas
    if (immediateBitmap) {
      try {
        const origW = immediateBitmap.width;
        const origH = immediateBitmap.height;
        if (!origW || !origH) {
          throw new Error('Immediate ImageBitmap had 0x0 dimensions.');
        }

        // If large camera photo (>2560px) and originalBlob is ready, try resize options with imageOrientation: 'from-image'
        if (Math.max(origW, origH) > MAX_WORKING_DIMENSION && originalBlob) {
          const scale = MAX_WORKING_DIMENSION / Math.max(origW, origH);
          const targetW = Math.max(1, Math.round(origW * scale));
          const targetH = Math.max(1, Math.round(origH * scale));
          try {
            const resizedBmp = await createImageBitmap(originalBlob, {
              resizeWidth: targetW,
              resizeHeight: targetH,
              resizeQuality: 'high',
              imageOrientation: 'from-image',
            } as ImageBitmapOptions);
            try {
              drawn = drawDecodedSourceToWorkingCanvas(
                resizedBmp,
                origW,
                origH,
                MAX_WORKING_DIMENSION
              );
            } finally {
              resizedBmp.close();
            }
          } catch {}
        }

        if (!drawn) {
          drawn = drawDecodedSourceToWorkingCanvas(
            immediateBitmap,
            origW,
            origH,
            MAX_WORKING_DIMENSION
          );
        }
      } catch (err) {
        stepLogs.push(
          `Draw from immediate ImageBitmap failed: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`
        );
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

    if (!drawn) {
      try {
        drawn = await decodeWithObjectUrl(decodeSourceBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        stepLogs.push(
          `URL.createObjectURL + img.decode failed: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`
        );
      }
    }

    if (!drawn) {
      try {
        drawn = await decodeWithDataUrl(decodeSourceBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        stepLogs.push(
          `FileReader.readAsDataURL + img.decode failed: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`
        );
      }
    }

    if (!drawn && originalBlob) {
      try {
        drawn = await decodeWithBitmap(originalBlob, MAX_WORKING_DIMENSION);
      } catch (err) {
        stepLogs.push(
          `createImageBitmap(originalBlob) failed: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`
        );
      }
    }

    // 3. If the file is HEIC/HEIF and the browser could not decode it natively, lazy-load heic2any
    let heicConversionFailed = false;
    if (!drawn && isHeic && originalBlob) {
      try {
        const convertedJpgBlob = await convertHeicBlobInMemory(originalBlob);
        originalBlob = convertedJpgBlob;
        drawn = await decodeWithObjectUrl(convertedJpgBlob, MAX_WORKING_DIMENSION);
      } catch (heicErr) {
        heicConversionFailed = true;
        stepLogs.push(
          `heic2any conversion failed: ${
            heicErr instanceof Error ? `${heicErr.name}: ${heicErr.message}` : String(heicErr)
          }`
        );
      }
    }

    if (!drawn) {
      const friendlyMsg =
        isHeic || heicConversionFailed ? ERROR_MSG_HEIC_FAILED : ERROR_MSG_UNSUPPORTED_FORMAT;
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
          dimensions: '0 × 0 px',
          stage: 'decode',
          extra: stepLogs.join(' | '),
        }),
      });
      continue;
    }

    // Create downscaled previewUrl (max 1600px) & thumbnailUrl (max 256px) once from workingCanvas
    let previewUrl = '';
    let thumbnailUrl = '';
    try {
      const urls = await createPreviewAndThumbnailFromCanvas(
        drawn.canvas,
        isHeic ? 'image/jpeg' : mimeType,
        MAX_THUMB_DIMENSION
      );
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
    'read'
  );
}

export function getOutputFilename(
  originalName: string,
  suffix: string,
  targetMimeType: string
): string {
  const base = (originalName || 'image').replace(/\.[^/.]+$/, '') || 'image';
  const normalized = normalizeOutputMimeType(targetMimeType);
  let ext = 'jpg';
  if (normalized === 'image/png') ext = 'png';
  else if (normalized === 'image/webp') ext = 'webp';
  else if (normalized === 'application/pdf') ext = 'pdf';
  return `${base}${suffix ? `-${suffix}` : ''}.${ext}`;
}

/**
 * Web Worker script that ONLY receives already-decoded, downscaled pixels (ImageData buffer)
 * and runs the encode loop on OffscreenCanvas.
 * When encoding to JPEG, composites any transparent pixels over solid white (#FFFFFF).
 */
const WORKER_ENCODE_SCRIPT = `
self.onmessage = async (event) => {
  const { jobId, mode, width, height, pixelsBuffer, mimeType, quality, targetBytes } = event.data;
  try {
    if (typeof OffscreenCanvas === 'undefined') {
      throw new Error('OffscreenCanvas is not available in this Web Worker');
    }

    const clamped = new Uint8ClampedArray(pixelsBuffer);
    if (mimeType === 'image/jpeg' || mode === 'encodeTargetKB') {
      for (let i = 0; i < clamped.length; i += 4) {
        const a = clamped[i + 3];
        if (a < 255) {
          const alpha = a / 255;
          clamped[i] = Math.round(clamped[i] * alpha + 255 * (1 - alpha));
          clamped[i + 1] = Math.round(clamped[i + 1] * alpha + 255 * (1 - alpha));
          clamped[i + 2] = Math.round(clamped[i + 2] * alpha + 255 * (1 - alpha));
          clamped[i + 3] = 255;
        }
      }
    }

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
        qualityUsed: mimeType === 'image/png' ? null : Math.round((q ?? 0.9) * 100),
      });
      return;
    }

    if (mode === 'encodeTargetKB') {
      let curW = width;
      let curH = height;
      let bestBlob = null;
      let bestW = curW;
      let bestH = curH;
      let bestQuality = 75;

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
            bestQuality = Math.round(mid * 100);
            self.postMessage({
              jobId,
              status: 'candidate',
              blob: bestBlob,
              width: bestW,
              height: bestH,
              qualityUsed: bestQuality,
              mimeType: 'image/jpeg',
            });
          }

          if (testBlob.size >= targetBytes * 0.9 && testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            bestW = curW;
            bestH = curH;
            bestQuality = Math.round(mid * 100);
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
          bestQuality = 50;
        }
      }

      self.postMessage({
        jobId,
        status: 'done',
        blob: bestBlob,
        width: bestW,
        height: bestH,
        qualityUsed: bestQuality,
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

async function buildProcessedResult(params: {
  blob: Blob;
  sourceCanvas: HTMLCanvasElement;
  originalBytes: number;
  width: number;
  height: number;
  qualityUsed: number | null;
  jobId: number;
  filename: string;
  mimeType: string;
  timedOut?: boolean;
  timeoutMessage?: string;
}): Promise<ProcessedImageResult> {
  const normalizedMime = normalizeOutputMimeType(params.mimeType);
  const url = URL.createObjectURL(params.blob);

  // Never put >1600px images in an <img>: if the output is larger than 1600px on its longest side,
  // build a downscaled previewUrl (longest side max 1600px) from the output canvas.
  let previewUrl = url;
  if (
    normalizedMime !== 'application/pdf' &&
    Math.max(params.width, params.height) > MAX_PREVIEW_DIMENSION
  ) {
    try {
      previewUrl = await buildPreviewUrlFromCanvas(params.sourceCanvas, normalizedMime);
    } catch {
      previewUrl = url;
    }
  }

  return {
    blob: params.blob,
    url,
    previewUrl,
    originalBytes: params.originalBytes,
    newBytes: params.blob.size,
    sizeBytes: params.blob.size,
    qualityUsed: normalizedMime === 'image/png' ? null : params.qualityUsed,
    format: mimeToFormatLabel(normalizedMime),
    width: params.width,
    height: params.height,
    jobId: params.jobId,
    filename: params.filename,
    mimeType: normalizedMime,
    timedOut: params.timedOut,
    timeoutMessage: params.timeoutMessage,
  };
}

/**
 * Transfers ONLY the downscaled ImageData pixels from a main-thread canvas to the Web Worker
 * for encoding. If the worker fails or forceMainThread is true, falls back to the main thread.
 */
async function encodeCanvasWithWorkerOrFallback(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  mimeType: string,
  quality: number | undefined,
  filename: string,
  originalBytes: number,
  callerJobId: number = 0,
  forceMainThread: boolean = false
): Promise<ProcessedImageResult> {
  const width = canvas.width;
  const height = canvas.height;
  const normalizedMime = normalizeOutputMimeType(mimeType);
  const qualityPercent =
    normalizedMime === 'image/png'
      ? null
      : Math.round((typeof quality === 'number' ? quality : 0.9) * 100);

  const mainThreadEncode = async (): Promise<ProcessedImageResult> => {
    await waitNextFrame();
    const blob = await canvasToBlob(canvas, normalizedMime, quality);
    return buildProcessedResult({
      blob,
      sourceCanvas: canvas,
      originalBytes,
      width,
      height,
      qualityUsed: qualityPercent,
      jobId: callerJobId,
      filename,
      mimeType: normalizedMime,
    });
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
    console.warn('[worker]', 'Could not extract ImageData for worker transfer, using main thread', err);
    return mainThreadEncode();
  }

  const workerSeqId = ++workerJobSeq;

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
      if (!data || data.jobId !== workerSeqId || settled) return;

      if (data.status === 'done' && data.blob) {
        settled = true;
        cleanup();
        buildProcessedResult({
          blob: data.blob,
          sourceCanvas: canvas,
          originalBytes,
          width: data.width,
          height: data.height,
          qualityUsed: data.qualityUsed ?? qualityPercent,
          jobId: callerJobId,
          filename,
          mimeType: data.mimeType || normalizedMime,
        })
          .then(resolve)
          .catch(reject);
        return;
      }

      if (data.status === 'error') {
        settled = true;
        cleanup();
        mainThreadEncode().then(resolve).catch(reject);
      }
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resetImageWorker();
      mainThreadEncode().then(resolve).catch(reject);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    try {
      worker.postMessage(
        {
          jobId: workerSeqId,
          mode: 'encodeSingle',
          width,
          height,
          pixelsBuffer,
          mimeType: normalizedMime,
          quality: quality ?? 0.9,
        },
        [pixelsBuffer]
      );
    } catch {
      settled = true;
      cleanup();
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
    jobId?: number;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const normalizedMime = normalizeOutputMimeType(options.outputMimeType) as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp';
  const filename = getOutputFilename(
    item.name,
    options.suffix ?? 'optimized',
    normalizedMime
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
      'process'
    );
  }

  // Always fill with white (or chosen backgroundColor) when output is JPG so transparent PNGs never turn black
  if (normalizedMime === 'image/jpeg') {
    workCtx.fillStyle = options.backgroundColor || '#FFFFFF';
    workCtx.fillRect(0, 0, width, height);
  } else {
    workCtx.clearRect(0, 0, width, height);
  }

  workCtx.imageSmoothingEnabled = true;
  workCtx.imageSmoothingQuality = 'high';
  workCtx.drawImage(loaded.canvas, 0, 0, width, height);

  const normalizedQuality =
    normalizedMime === 'image/png'
      ? undefined
      : Math.max(0.05, Math.min(1, options.quality / 100));

  return encodeCanvasWithWorkerOrFallback(
    workCanvas,
    workCtx,
    normalizedMime,
    normalizedQuality,
    filename,
    item.size,
    options.jobId ?? 0,
    options.forceMainThread
  );
}

export async function compressToTargetKB(
  item: IngestedFileItem,
  targetKB: number,
  forceMainThread: boolean = false,
  callerJobId: number = 0
): Promise<ProcessedImageResult> {
  const filename = getOutputFilename(item.name, `${targetKB}kb`, 'image/jpeg');
  const targetBytes = targetKB * 1024;

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
      'process'
    );
  }

  startCtx.fillStyle = '#FFFFFF';
  startCtx.fillRect(0, 0, startW, startH);
  startCtx.imageSmoothingEnabled = true;
  startCtx.imageSmoothingQuality = 'high';
  startCtx.drawImage(loaded.canvas, 0, 0, startW, startH);

  const runMainThreadTargetKBLoop = async (): Promise<ProcessedImageResult> => {
    let curW = startW;
    let curH = startH;
    let bestBlob: Blob | null = null;
    let bestW = curW;
    let bestH = curH;
    let bestQuality = 75;
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
          bestQuality = Math.round(mid * 100);
        }

        if (testBlob.size >= targetBytes * 0.9 && testBlob.size <= targetBytes) {
          bestBlob = testBlob;
          bestW = curW;
          bestH = curH;
          bestQuality = Math.round(mid * 100);
          hit90To100 = true;
          break;
        }

        if (Date.now() - startTime > SAFETY_TIMEOUT_MS && bestBlob) {
          return buildProcessedResult({
            blob: bestBlob,
            sourceCanvas: startCanvas,
            originalBytes: item.size,
            width: bestW,
            height: bestH,
            qualityUsed: bestQuality,
            jobId: callerJobId,
            filename,
            mimeType: 'image/jpeg',
            timedOut: true,
            timeoutMessage: 'Returned the best result found within 10 seconds.',
          });
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
        bestQuality = 50;
      }
    }

    if (!bestBlob) {
      bestBlob = await canvasToBlob(startCanvas, 'image/jpeg', 0.5);
      bestQuality = 50;
    }

    return buildProcessedResult({
      blob: bestBlob,
      sourceCanvas: startCanvas,
      originalBytes: item.size,
      width: bestW,
      height: bestH,
      qualityUsed: bestQuality,
      jobId: callerJobId,
      filename,
      mimeType: 'image/jpeg',
    });
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
  } catch {
    return runMainThreadTargetKBLoop();
  }

  const workerSeqId = ++workerJobSeq;

  return new Promise<ProcessedImageResult>((resolve, reject) => {
    let settled = false;
    let latestCandidate: { blob: Blob; width: number; height: number; qualityUsed: number } | null =
      null;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resetImageWorker();
      if (latestCandidate) {
        buildProcessedResult({
          blob: latestCandidate.blob,
          sourceCanvas: startCanvas,
          originalBytes: item.size,
          width: latestCandidate.width,
          height: latestCandidate.height,
          qualityUsed: latestCandidate.qualityUsed,
          jobId: callerJobId,
          filename,
          mimeType: 'image/jpeg',
          timedOut: true,
          timeoutMessage: 'Returned the best result found within 10 seconds.',
        })
          .then(resolve)
          .catch(reject);
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
      if (!data || data.jobId !== workerSeqId || settled) return;

      if (data.status === 'candidate' && data.blob) {
        latestCandidate = {
          blob: data.blob,
          width: data.width,
          height: data.height,
          qualityUsed: data.qualityUsed ?? 75,
        };
        return;
      }

      if (data.status === 'done' && data.blob) {
        settled = true;
        cleanup();
        buildProcessedResult({
          blob: data.blob,
          sourceCanvas: startCanvas,
          originalBytes: item.size,
          width: data.width,
          height: data.height,
          qualityUsed: data.qualityUsed ?? 75,
          jobId: callerJobId,
          filename,
          mimeType: 'image/jpeg',
        })
          .then(resolve)
          .catch(reject);
        return;
      }

      if (data.status === 'error') {
        settled = true;
        cleanup();
        runMainThreadTargetKBLoop().then(resolve).catch(reject);
      }
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resetImageWorker();
      runMainThreadTargetKBLoop().then(resolve).catch(reject);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    try {
      worker.postMessage(
        {
          jobId: workerSeqId,
          mode: 'encodeTargetKB',
          width: startW,
          height: startH,
          pixelsBuffer,
          targetBytes,
        },
        [pixelsBuffer]
      );
    } catch {
      settled = true;
      cleanup();
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
    jobId?: number;
    forceMainThread?: boolean;
  }
): Promise<ProcessedImageResult> {
  const w = Math.max(1, Math.min(4096, Math.round(options.width)));
  const h = Math.max(1, Math.min(4096, Math.round(options.height)));
  const normalizedMime = normalizeOutputMimeType(options.outputMimeType) as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp';
  const filename = getOutputFilename(item.name, `${w}x${h}`, normalizedMime);

  const loaded = await ensureWorkingCanvas(item);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessError(
      ERROR_MSG_CANVAS_BLOCKED,
      'CanvasContextError: Could not initialize resize canvas.',
      'process'
    );
  }

  if (normalizedMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(loaded.canvas, 0, 0, w, h);

  const q = normalizedMime === 'image/png' ? undefined : options.quality / 100;
  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    normalizedMime,
    q,
    filename,
    item.size,
    options.jobId ?? 0,
    options.forceMainThread
  );
}

export async function cropImageFile(
  item: IngestedFileItem,
  cropNorm: { x: number; y: number; width: number; height: number },
  outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  forceMainThread: boolean = false,
  callerJobId: number = 0
): Promise<ProcessedImageResult> {
  const normalizedMime = normalizeOutputMimeType(outputMimeType) as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp';
  const filename = getOutputFilename(item.name, 'cropped', normalizedMime);
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
      'process'
    );
  }

  if (normalizedMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sw, sh);
  } else {
    ctx.clearRect(0, 0, sw, sh);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(loaded.canvas, sx, sy, sw, sh, 0, 0, sw, sh);

  return encodeCanvasWithWorkerOrFallback(
    canvas,
    ctx,
    normalizedMime,
    normalizedMime === 'image/png' ? undefined : 0.92,
    filename,
    item.size,
    callerJobId,
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
    jobId?: number;
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
      'process'
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
      item.size,
      options.jobId ?? 0,
      options.forceMainThread
    );
  }

  const a4W = 1654;
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
    item.size,
    options.jobId ?? 0,
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
    jobId?: number;
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
  } else {
    ctx.clearRect(0, 0, w, h);
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
    item.size,
    options.jobId ?? 0,
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
    jobId?: number;
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
  } else {
    ctx.clearRect(0, 0, w, h);
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
    item.size,
    options.jobId ?? 0,
    options.forceMainThread
  );
}

export async function convertToBlackAndWhite(
  item: IngestedFileItem,
  options: {
    preset: 'standard' | 'high-contrast' | 'soft' | 'sepia';
    contrast: number;
    brightness: number;
    jobId?: number;
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
  } else {
    ctx.clearRect(0, 0, w, h);
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
    item.size,
    options.jobId ?? 0,
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
    jobId?: number;
    forceMainThread?: boolean;
  },
  onProgress?: (current: number, total: number) => void,
  isCancelled?: () => boolean
): Promise<ProcessedImageResult> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  let totalOriginalBytes = 0;

  for (let i = 0; i < items.length; i++) {
    if (isCancelled?.()) {
      throw new Error('Cancelled');
    }
    onProgress?.(i + 1, items.length);
    const item = items[i];
    totalOriginalBytes += item.size;

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
      item.size,
      options.jobId ?? 0,
      options.forceMainThread
    );

    pageCanvas.width = 0;
    pageCanvas.height = 0;

    releaseProcessedResultUrls(encodedPage);
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
  const url = URL.createObjectURL(blob);
  return {
    blob,
    url,
    previewUrl: url,
    originalBytes: totalOriginalBytes,
    newBytes: blob.size,
    sizeBytes: blob.size,
    qualityUsed: options.quality,
    format: 'PDF',
    width: items.length,
    height: 1,
    jobId: options.jobId ?? 0,
    filename: getOutputFilename(
      firstBase,
      items.length > 1 ? `merged-${items.length}p` : 'document',
      'application/pdf'
    ),
    mimeType: 'application/pdf',
  };
}
