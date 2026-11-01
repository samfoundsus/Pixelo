import { useState, useEffect } from 'react';

export interface CanvasCheckState {
  checked: boolean;
  tampered: boolean;
  brave: boolean;
  unknownError: boolean;
}

export const BRAVE_SHIELDS_MESSAGE =
  'Brave Shields is blocking image processing. Tap the lion icon next to the address bar, switch Shields off for this site, then reload.';

export const GENERIC_CANVAS_BLOCKED_MESSAGE =
  'Your browser is blocking canvas access (a privacy setting or extension). Allow it for this site, or try another browser.';

export const BRAVE_HELP_LINE =
  'Using Brave? Turn Shields off for this site so the tools can read your photos.';

let cachedState: CanvasCheckState | null = null;
let inFlightPromise: Promise<CanvasCheckState> | null = null;
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

function drawFixedPattern(ctx: CanvasRenderingContext2D) {
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

/**
 * Draws a fixed pattern on a 64x64 canvas (solid-color rectangles with known RGB values),
 * reads it back with getImageData, and compares pixels.
 * Returns true if:
 * - any sampled pixel differs from the expected value
 * - getImageData throws
 * - toBlob returns null
 * - two consecutive reads differ from each other (random farbling noise)
 */
export async function canvasIsTampered(): Promise<boolean> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  try {
    const runPass = async (): Promise<{ data: Uint8ClampedArray; blobOk: boolean } | null> => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      drawFixedPattern(ctx);

      let imgData: ImageData;
      try {
        imgData = ctx.getImageData(0, 0, 64, 64);
      } catch {
        // getImageData threw -> canvas read is blocked
        return { data: new Uint8ClampedArray(0), blobOk: false };
      }

      const blob = await canvasToBlobCheck(canvas);
      if (!blob || blob.size === 0) {
        return { data: imgData.data, blobOk: false };
      }

      return { data: imgData.data, blobOk: true };
    };

    const pass1 = await runPass();
    const pass2 = await runPass();

    // If 2D context couldn't be created at all (e.g. non-browser test runner), treat as unknown (not tampered)
    if (!pass1 || !pass2) {
      return false;
    }

    if (!pass1.blobOk || !pass2.blobOk || pass1.data.length === 0 || pass2.data.length === 0) {
      return true;
    }

    // Compare sampled pixels against known RGB values
    for (const pt of SAMPLE_POINTS) {
      const idx = (pt.y * 64 + pt.x) * 4;
      const r1 = pass1.data[idx];
      const g1 = pass1.data[idx + 1];
      const b1 = pass1.data[idx + 2];
      const a1 = pass1.data[idx + 3];

      if (r1 !== pt.r || g1 !== pt.g || b1 !== pt.b || a1 !== 255) {
        return true;
      }
    }

    // Compare pass1 and pass2 across all bytes to catch random noise injection
    if (pass1.data.length !== pass2.data.length) {
      return true;
    }
    for (let i = 0; i < pass1.data.length; i++) {
      if (pass1.data[i] !== pass2.data[i]) {
        return true;
      }
    }

    return false;
  } catch (unexpectedErr) {
    // Requirement 6: Never block usage if the check itself throws unexpectedly:
    // treat that as "unknown", log it, and let the tool run.
    console.warn('[canvas-check] Unexpected error during canvas check:', unexpectedErr);
    return false;
  }
}

/**
 * Runs the Brave + Canvas tampering check once on first load, caches the result in memory,
 * and re-runs it when forceRefresh is true (e.g., when the user taps "Check again").
 */
export async function runCanvasCheck(forceRefresh = false): Promise<CanvasCheckState> {
  if (typeof window === 'undefined') {
    return { checked: false, tampered: false, brave: false, unknownError: false };
  }

  if (cachedState && !forceRefresh) {
    return cachedState;
  }

  if (inFlightPromise && !forceRefresh) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const [braveResult, tamperedResult] = await Promise.all([
        isBrave(),
        canvasIsTampered(),
      ]);
      const nextState: CanvasCheckState = {
        checked: true,
        tampered: tamperedResult,
        brave: braveResult,
        unknownError: false,
      };
      cachedState = nextState;
      notifyListeners(nextState);
      return nextState;
    } catch (err) {
      console.warn('[canvas-check] Check failed unexpectedly, treating as unknown:', err);
      const fallbackState: CanvasCheckState = {
        checked: true,
        tampered: false,
        brave: false,
        unknownError: true,
      };
      cachedState = fallbackState;
      notifyListeners(fallbackState);
      return fallbackState;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

export function getCachedCanvasCheck(): CanvasCheckState {
  return (
    cachedState || {
      checked: false,
      tampered: false,
      brave: false,
      unknownError: false,
    }
  );
}

export function getShieldsWarningMessage(brave: boolean): string {
  return brave ? BRAVE_SHIELDS_MESSAGE : GENERIC_CANVAS_BLOCKED_MESSAGE;
}

/**
 * React hook to subscribe to the shared canvas check state and trigger "Check again".
 */
export function useCanvasCheck() {
  const [state, setState] = useState<CanvasCheckState>(() => getCachedCanvasCheck());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const listener = (next: CanvasCheckState) => {
      setState(next);
    };
    listeners.add(listener);

    if (!cachedState) {
      void runCanvasCheck(false);
    } else {
      setState(cachedState);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const checkAgain = async () => {
    setIsChecking(true);
    try {
      return await runCanvasCheck(true);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    ...state,
    isChecking,
    checkAgain,
  };
}
