import { useState, useEffect, useCallback } from 'react';

export interface CanvasCheckState {
  checked: boolean;
  tampered: boolean;
  brave: boolean;
  report: string;
}

export const BRAVE_SHIELDS_MESSAGE =
  'Brave Shields is blocking image processing. Tap the lion icon next to the address bar, switch Shields off for this site, then reload.';

export const GENERIC_CANVAS_BLOCKED_MESSAGE =
  'Your browser is blocking canvas access (a privacy setting or extension). Allow it for this site, or try another browser.';

export const BRAVE_HELP_LINE =
  'Using Brave? Turn Shields off for this site so the tools can read your photos.';

const CHANNEL_TOLERANCE = 3;

let latestCheckState: CanvasCheckState = {
  checked: false,
  tampered: false,
  brave: false,
  report: 'not-run',
};

const listeners = new Set<(state: CanvasCheckState) => void>();

function notifyListeners(state: CanvasCheckState) {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch {}
  }
}

/**
 * Checks if the current browser is Brave via navigator.brave.isBrave().
 * Wrapped in try/catch so it never throws.
 */
export async function isBrave(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    };
    return !!(nav.brave && typeof nav.brave.isBrave === 'function' && (await nav.brave.isBrave()));
  } catch {
    return false;
  }
}

interface TestRect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  g: number;
  b: number;
}

const PATTERN_RECTS: TestRect[] = [
  { x: 0, y: 0, w: 32, h: 32, r: 229, g: 84, b: 43 },
  { x: 32, y: 0, w: 32, h: 32, r: 47, g: 107, b: 79 },
  { x: 0, y: 32, w: 32, h: 32, r: 26, g: 26, b: 26 },
  { x: 32, y: 32, w: 32, h: 32, r: 247, g: 246, b: 243 },
  { x: 16, y: 16, w: 32, h: 32, r: 107, g: 107, b: 102 },
];

const SAMPLE_POINTS: Array<{ x: number; y: number; r: number; g: number; b: number }> = [
  { x: 4, y: 4, r: 229, g: 84, b: 43 },
  { x: 12, y: 8, r: 229, g: 84, b: 43 },
  { x: 56, y: 6, r: 47, g: 107, b: 79 },
  { x: 48, y: 12, r: 47, g: 107, b: 79 },
  { x: 6, y: 56, r: 26, g: 26, b: 26 },
  { x: 12, y: 48, r: 26, g: 26, b: 26 },
  { x: 56, y: 56, r: 247, g: 246, b: 243 },
  { x: 50, y: 50, r: 247, g: 246, b: 243 },
  { x: 32, y: 32, r: 107, g: 107, b: 102 },
  { x: 24, y: 24, r: 107, g: 107, b: 102 },
  { x: 40, y: 40, r: 107, g: 107, b: 102 },
];

function drawFixedOpaquePattern(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  for (const rect of PATTERN_RECTS) {
    ctx.fillStyle = `rgb(${rect.r}, ${rect.g}, ${rect.b})`;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
}

function canvasToBlobCheck(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/png',
        1
      );
    } catch {
      resolve(null);
    }
  });
}

export interface TamperCheckResult {
  tampered: boolean;
  report: string;
}

/**
 * Runs a fresh 64x64 opaque canvas check without caching:
 * - Draws fully opaque solid rectangles (no alpha, no gradients) on two fresh 64x64 canvases
 * - Reads pixels with getImageData and allows a tolerance of 3 per channel
 * - Returns tampered = true ONLY if:
 *   (a) two consecutive reads differ from each other, or
 *   (b) sampled pixels differ from expected RGB values by more than tolerance (3), or
 *   (c) getImageData or toBlob throws or returns null
 */
export async function runTamperCheckDetailed(): Promise<TamperCheckResult> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { tampered: false, report: 'ssr (skipped)' };
  }

  try {
    const runSinglePass = async (
      passLabel: string
    ): Promise<{
      data: Uint8ClampedArray | null;
      getImageDataError?: string;
      blobOk: boolean;
    }> => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx =
        canvas.getContext('2d', { alpha: false, willReadFrequently: true }) ||
        canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return { data: null, getImageDataError: `${passLabel}: 2D context null`, blobOk: false };
      }

      drawFixedOpaquePattern(ctx);

      let imgData: ImageData;
      try {
        imgData = ctx.getImageData(0, 0, 64, 64);
      } catch (err) {
        return {
          data: null,
          getImageDataError: `${passLabel} getImageData threw: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`,
          blobOk: false,
        };
      }

      const blob = await canvasToBlobCheck(canvas);
      const blobOk = !!(blob && blob.size > 0);
      return { data: imgData.data, blobOk };
    };

    const pass1 = await runSinglePass('pass1');
    const pass2 = await runSinglePass('pass2');

    if (!pass1.data || !pass2.data) {
      const errMsg = pass1.getImageDataError || pass2.getImageDataError || 'getImageData returned null';
      const report = `tampered=true | reason=${errMsg}`;
      latestCheckState = { ...latestCheckState, checked: true, tampered: true, report };
      return { tampered: true, report };
    }

    if (!pass1.blobOk || !pass2.blobOk) {
      const report = `tampered=true | reason=toBlob returned null or empty (pass1.blobOk=${pass1.blobOk}, pass2.blobOk=${pass2.blobOk})`;
      latestCheckState = { ...latestCheckState, checked: true, tampered: true, report };
      return { tampered: true, report };
    }

    // (a) Check if two consecutive reads differ from each other
    let twoReadsDiffIndex = -1;
    for (let i = 0; i < pass1.data.length; i++) {
      if (pass1.data[i] !== pass2.data[i]) {
        twoReadsDiffIndex = i;
        break;
      }
    }

    // (b) Check sampled pixels against expected values with tolerance of 3 per channel
    const sampleSummaries: string[] = [];
    let exceededTolerance = false;

    for (const pt of SAMPLE_POINTS) {
      const idx = (pt.y * 64 + pt.x) * 4;
      const r = pass1.data[idx];
      const g = pass1.data[idx + 1];
      const b = pass1.data[idx + 2];
      const a = pass1.data[idx + 3];

      const dr = Math.abs(r - pt.r);
      const dg = Math.abs(g - pt.g);
      const db = Math.abs(b - pt.b);
      const da = Math.abs(a - 255);

      if (sampleSummaries.length < 4 || dr > CHANNEL_TOLERANCE || dg > CHANNEL_TOLERANCE || db > CHANNEL_TOLERANCE || da > CHANNEL_TOLERANCE) {
        sampleSummaries.push(
          `(${pt.x},${pt.y}) exp=[${pt.r},${pt.g},${pt.b},255] act=[${r},${g},${b},${a}]`
        );
      }

      if (
        dr > CHANNEL_TOLERANCE ||
        dg > CHANNEL_TOLERANCE ||
        db > CHANNEL_TOLERANCE ||
        da > CHANNEL_TOLERANCE
      ) {
        exceededTolerance = true;
      }
    }

    const tampered = twoReadsDiffIndex !== -1 || exceededTolerance;
    const report = [
      `tampered=${tampered}`,
      `twoReadsIdentical=${twoReadsDiffIndex === -1}${
        twoReadsDiffIndex !== -1 ? ` (diff at byte ${twoReadsDiffIndex})` : ''
      }`,
      `tolerance=${CHANNEL_TOLERANCE}`,
      `toBlobOk=true`,
      `samples: ${sampleSummaries.join('; ')}`,
    ].join(' | ');

    latestCheckState = { ...latestCheckState, checked: true, tampered, report };
    return { tampered, report };
  } catch (err) {
    const report = `tampered=false (unexpected check error: ${
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    })`;
    return { tampered: false, report };
  }
}

export async function canvasIsTampered(_forceRefresh?: boolean): Promise<boolean> {
  const res = await runTamperCheckDetailed();
  return res.tampered;
}

export function getLastTamperReport(): string {
  return latestCheckState.report;
}

/**
 * Always runs a fresh canvas tampering check (never cached).
 */
export async function runCanvasCheck(_forceRefresh?: boolean): Promise<CanvasCheckState> {
  if (typeof window === 'undefined') {
    return { checked: false, tampered: false, brave: false, report: 'ssr' };
  }

  try {
    const [braveResult, tamperDetail] = await Promise.all([
      isBrave(),
      runTamperCheckDetailed(),
    ]);
    const nextState: CanvasCheckState = {
      checked: true,
      tampered: tamperDetail.tampered,
      brave: braveResult,
      report: tamperDetail.report,
    };
    latestCheckState = nextState;
    notifyListeners(nextState);
    return nextState;
  } catch (err) {
    const fallbackState: CanvasCheckState = {
      checked: true,
      tampered: false,
      brave: false,
      report: `error: ${err instanceof Error ? err.message : String(err)}`,
    };
    latestCheckState = fallbackState;
    notifyListeners(fallbackState);
    return fallbackState;
  }
}

export function getShieldsWarningMessage(brave: boolean): string {
  return brave ? BRAVE_SHIELDS_MESSAGE : GENERIC_CANVAS_BLOCKED_MESSAGE;
}

/**
 * React hook that re-runs the canvas check on page load, on "Check again",
 * on window focus, on visibilitychange, and on pageshow (never cached).
 */
export function useCanvasCheck() {
  const [state, setState] = useState<CanvasCheckState>(latestCheckState);
  const [isChecking, setIsChecking] = useState(false);

  const checkAgain = useCallback(async () => {
    setIsChecking(true);
    try {
      return await runCanvasCheck();
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const listener = (next: CanvasCheckState) => {
      setState(next);
    };
    listeners.add(listener);

    void runCanvasCheck();

    const onFocus = () => {
      void runCanvasCheck();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runCanvasCheck();
      }
    };
    const onPageShow = () => {
      void runCanvasCheck();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return {
    ...state,
    isChecking,
    checkAgain,
  };
}
