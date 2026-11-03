import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  Download,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  X,
  Camera,
  Plus,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ToolPageData, TOOLS_BY_SLUG } from '../data/tools';
import {
  formatBytes,
  getFormattedSizeParts,
  ProcessedImageResult,
  IngestedFileItem,
  ingestFiles,
  releaseIngestedItem,
  releaseProcessedResultUrls,
  compressOrConvertImage,
  compressToTargetKB,
  resizeImageFile,
  cropImageFile,
  generatePassportPhoto,
  rotateFlipImageFile,
  addWatermarkToImage,
  WatermarkPosition,
  convertToBlackAndWhite,
  buildPdfFromImages,
  resetImageWorker,
  buildDiagnosticDetails,
  ImageProcessError,
  ERROR_MSG_UNSUPPORTED_FORMAT,
} from '../lib/image-processing';
import {
  useCanvasCheck,
  runTamperCheckDetailed,
  getShieldsWarningMessage,
} from '../lib/canvas-check';
import { FileUpload } from './ui/file-upload';
import { Slider } from './ui/slider';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Compare } from './ui/compare';
import { toast } from './ui/sonner';

const LazyNumberTicker = lazy(() => import('./ui/number-ticker'));

interface ToolWorkspaceProps {
  tool: ToolPageData;
  onNavigate?: (path: string) => void;
}

interface BatchItem extends IngestedFileItem {
  result?: ProcessedImageResult;
  originalDownloadUrl?: string;
}

function CanvasBlockedNotice({
  brave,
  isChecking,
  onCheckAgain,
  onDismiss,
}: {
  brave: boolean;
  isChecking: boolean;
  onCheckAgain: () => void;
  onDismiss?: () => void;
}) {
  const message = getShieldsWarningMessage(brave);

  return (
    <div
      role="region"
      aria-label="Browser canvas access notice"
      className="mb-[20px] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F3EFEA] dark:bg-[#191816] p-[16px] sm:p-[20px] text-[#1A1A1A] dark:text-[#EDEDEA] min-w-0 max-w-full"
    >
      <div className="flex items-start gap-[12px] min-w-0">
        <ShieldAlert
          strokeWidth={1.5}
          className="w-[20px] h-[20px] shrink-0 text-[#E5542B] mt-[2px]"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 space-y-[12px]">
          <p className="text-[16px] sm:text-[15px] leading-[1.6] text-[#1A1A1A] dark:text-[#EDEDEA] break-words">
            {message}
          </p>

          <details className="group text-[14px] text-[#6B6B66] dark:text-[#9B9B95]">
            <summary className="min-h-[48px] sm:min-h-[36px] inline-flex items-center gap-[6px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] hover:text-[#E5542B] cursor-pointer select-none">
              <span>How to do it</span>
              <ChevronDown
                strokeWidth={1.5}
                className="w-[15px] h-[15px] transition-transform duration-150 group-open:rotate-180"
              />
            </summary>
            <ol className="mt-[8px] list-decimal pl-[20px] space-y-[6px] text-[14px] leading-[1.6]">
              <li>
                <strong className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                  Brave on Android or iOS:
                </strong>{' '}
                Tap the Brave icon next to the address bar at the top or bottom of your screen.
              </li>
              <li>
                <strong className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                  Brave on Desktop:
                </strong>{' '}
                Click the Brave Shields icon on the right side of the address bar.
              </li>
              <li>
                Switch{' '}
                <strong className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">Shields</strong>{' '}
                off for this site, wait for the page to reload, or tap{' '}
                <strong className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
                  Check again
                </strong>{' '}
                below.
              </li>
            </ol>
          </details>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] pt-[4px]">
            <button
              type="button"
              onClick={onCheckAgain}
              disabled={isChecking}
              className="btn-press min-h-[48px] sm:min-h-[40px] px-[18px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white disabled:opacity-50 cursor-pointer"
            >
              {isChecking ? 'Checking...' : 'Check again'}
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="min-h-[48px] sm:min-h-[40px] px-[14px] rounded-[10px] text-sm text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] underline underline-offset-4 cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorNotice({
  message,
  details,
}: {
  message: string;
  details?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!details) return;
    try {
      await navigator.clipboard.writeText(`${message}\n${details}`);
      setCopied(true);
      toast('Details copied');
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div
      role="alert"
      className="mt-[8px] p-[14px] rounded-[12px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F3EFEA] dark:bg-[#191816] text-[15px] sm:text-xs text-[#1A1A1A] dark:text-[#EDEDEA] min-w-0 max-w-full space-y-[10px]"
    >
      <p className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] break-words leading-[1.5]">
        {message}
      </p>
      {details && (
        <details className="text-[12px] text-[#6B6B66] dark:text-[#9B9B95]">
          <summary className="min-h-[44px] sm:min-h-[28px] cursor-pointer inline-flex items-center gap-[4px] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] select-none underline underline-offset-2">
            Details
          </summary>
          <div className="mt-[6px] space-y-[8px]">
            <pre className="p-[8px] rounded-[6px] bg-white/80 dark:bg-[#0E0E0E]/80 border border-[#E7E5E0] dark:border-[#262624] font-mono text-[11px] whitespace-pre-wrap break-all overflow-x-auto">
              {details}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] sm:min-h-[32px] px-[12px] py-[4px] rounded-[8px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B] cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy details'}
            </button>
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Stable preview image with zero shimmer, zero skeleton, and zero blank frames:
 * - Reserves aspect-ratio box from known width and height before the image loads
 * - Keeps the current image visible while pre-decoding the next URL offscreen, then swaps
 */
function StablePreviewImage({
  src,
  alt,
  aspectRatio,
  className = '',
}: {
  src: string;
  alt: string;
  aspectRatio?: number;
  className?: string;
}) {
  const [displayedSrc, setDisplayedSrc] = useState(src);

  useEffect(() => {
    if (!src) {
      setDisplayedSrc('');
      return;
    }
    if (!displayedSrc) {
      setDisplayedSrc(src);
    }
    let cancelled = false;
    const preloader = new Image();
    preloader.decoding = 'async';
    preloader.onload = () => {
      if (!cancelled) {
        setDisplayedSrc(src);
      }
    };
    preloader.onerror = () => {
      if (!cancelled) {
        setDisplayedSrc(src);
      }
    };
    preloader.src = src;
    if (typeof preloader.decode === 'function') {
      preloader
        .decode()
        .then(() => {
          if (!cancelled) {
            setDisplayedSrc(src);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
      className="relative flex w-full max-w-full max-h-[380px] min-h-[240px] items-center justify-center overflow-hidden rounded-[10px] bg-[#F7F6F3] dark:bg-[#0E0E0E]"
    >
      {displayedSrc ? (
        <img
          src={displayedSrc}
          alt={alt}
          className={`${className} opacity-100 select-none`}
          draggable={false}
        />
      ) : null}
    </div>
  );
}

export function ToolWorkspace({ tool, onNavigate }: ToolWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const jobIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retiredResultsRef = useRef<ProcessedImageResult[]>([]);

  const { tampered, brave, isChecking, checkAgain } = useCanvasCheck();
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const [items, setItems] = useState<BatchItem[]>([]);
  const itemsRef = useRef<BatchItem[]>([]);
  itemsRef.current = items;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Compress & Convert controls
  const [quality, setQuality] = useState<number>(78);
  const [outputMime, setOutputMime] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(
    'image/jpeg'
  );
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  // Target KB controls (20KB, 50KB, 100KB)
  const defaultTargetKB =
    tool.slug === 'resize-image-to-20kb'
      ? 20
      : tool.slug === 'resize-image-to-50kb'
      ? 50
      : tool.slug === 'resize-image-to-100kb'
      ? 100
      : 50;
  const [targetKB, setTargetKB] = useState<number>(defaultTargetKB);

  // Resize controls
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(800);
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [lockAspect, setLockAspect] = useState<boolean>(true);

  // Crop controls
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '4:5' | '16:9' | '3:2' | '4:3'>(
    'free'
  );
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  // Passport Photo Maker controls
  const [passportSize, setPassportSize] = useState<'35x45mm' | '2x2in' | '51x51mm'>('35x45mm');
  const [passportZoom, setPassportZoom] = useState<number>(1.15);
  const [passportPanX, setPassportPanX] = useState<number>(0);
  const [passportPanY, setPassportPanY] = useState<number>(0);
  const [brightenBg, setBrightenBg] = useState<boolean>(true);
  const [passportLayout, setPassportLayout] = useState<'single' | 'a4-sheet'>('single');

  // Rotate & Flip controls
  const [rotateDeg, setRotateDeg] = useState<number>(90);
  const [straightenDeg, setStraightenDeg] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Watermark controls
  const [watermarkText, setWatermarkText] = useState<string>('For verification only');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(40);
  const [watermarkSize, setWatermarkSize] = useState<number>(4);
  const [watermarkColor, setWatermarkColor] = useState<string>('#FFFFFF');
  const [watermarkPos, setWatermarkPos] = useState<WatermarkPosition>('bottom-right');

  // Black & White controls
  const [bwPreset, setBwPreset] = useState<'standard' | 'high-contrast' | 'soft' | 'sepia'>(
    'standard'
  );
  const [bwContrast, setBwContrast] = useState<number>(10);
  const [bwBrightness, setBwBrightness] = useState<number>(0);

  // Image to PDF controls
  const [pdfPageSize, setPdfPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pdfMargin, setPdfMargin] = useState<number>(24);
  const [pdfQuality, setPdfQuality] = useState<number>(82);
  const [pdfResult, setPdfResult] = useState<ProcessedImageResult | null>(null);
  const [pdfError, setPdfError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  const [processTrigger, setProcessTrigger] = useState<{ id: number; debounce: boolean }>({
    id: 0,
    debounce: false,
  });

  const supportsBatch =
    tool.slug === 'compress-image' ||
    tool.slug === 'convert-jpg-to-png' ||
    tool.slug === 'convert-png-to-jpg' ||
    tool.slug === 'convert-to-webp' ||
    tool.slug === 'image-to-pdf';

  const flushRetiredResults = useCallback(() => {
    for (const r of retiredResultsRef.current) {
      releaseProcessedResultUrls(r);
    }
    retiredResultsRef.current = [];
  }, []);

  const cancelCurrentJob = useCallback(() => {
    jobIdRef.current += 1;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    resetImageWorker();
  }, []);

  const scheduleProcessing = useCallback((debounce: boolean) => {
    jobIdRef.current += 1;
    setIsPendingUpdate(true);
    setProcessTrigger({ id: jobIdRef.current, debounce });
  }, []);

  const cleanupItemsList = useCallback(
    (list: BatchItem[]) => {
      flushRetiredResults();
      for (const item of list) {
        if (item.originalDownloadUrl) {
          try {
            URL.revokeObjectURL(item.originalDownloadUrl);
          } catch {}
        }
        releaseIngestedItem(item);
      }
    },
    [flushRetiredResults]
  );

  useEffect(() => {
    return () => {
      flushRetiredResults();
    };
  }, [flushRetiredResults]);

  const handleCheckAgain = useCallback(async () => {
    const res = await checkAgain();
    if (!res.tampered) {
      setNoticeDismissed(false);
      toast('Canvas access verified');
      if (itemsRef.current.some((it) => !it.error)) {
        scheduleProcessing(false);
      }
    } else {
      setNoticeDismissed(false);
    }
  }, [checkAgain, scheduleProcessing]);

  useEffect(() => {
    cancelCurrentJob();
    setItems((prev) => {
      cleanupItemsList(prev);
      return [];
    });
    setActiveIndex(0);
    setWarningMessage(null);
    setPdfResult((prev) => {
      releaseProcessedResultUrls(prev);
      return null;
    });
    setPdfError(null);
    setIsProcessing(false);
    setIsPendingUpdate(false);
    setProgressRatio(0);

    if (tool.slug === 'convert-jpg-to-png') {
      setOutputMime('image/png');
      setQuality(100);
    } else if (tool.slug === 'convert-png-to-jpg') {
      setOutputMime('image/jpeg');
      setQuality(88);
    } else if (tool.slug === 'convert-to-webp') {
      setOutputMime('image/webp');
      setQuality(82);
    } else if (tool.slug === 'compress-image') {
      setOutputMime('image/jpeg');
      setQuality(78);
    } else if (tool.slug === 'resize-image-to-20kb') {
      setTargetKB(20);
    } else if (tool.slug === 'resize-image-to-50kb') {
      setTargetKB(50);
    } else if (tool.slug === 'resize-image-to-100kb') {
      setTargetKB(100);
    } else if (tool.slug === 'rotate-flip-image') {
      setRotateDeg(90);
      setStraightenDeg(0);
      setFlipH(false);
      setFlipV(false);
    }
  }, [tool.slug, cancelCurrentJob, cleanupItemsList]);

  const handleStartOver = () => {
    cancelCurrentJob();
    setItems((prev) => {
      cleanupItemsList(prev);
      return [];
    });
    setActiveIndex(0);
    setWarningMessage(null);
    setPdfResult((prev) => {
      releaseProcessedResultUrls(prev);
      return null;
    });
    setPdfError(null);
    setIsProcessing(false);
    setIsPendingUpdate(false);
    setProgressRatio(0);
  };

  /**
   * Shared intake handler that calls ONLY ingestFiles(files) BEFORE any React state update
   * so Android's short-lived File handles are decoded and read into memory immediately.
   */
  const runSharedIntake = useCallback(
    async (rawFiles: File[]) => {
      if (rawFiles.length === 0) return;

      const currentItems = itemsRef.current;
      const appendMode =
        supportsBatch &&
        tool.slug === 'image-to-pdf' &&
        currentItems.some((it) => !it.error);
      const existingValid = appendMode ? currentItems.filter((it) => !it.error) : [];
      const maxFiles = supportsBatch ? Math.max(1, 10 - existingValid.length) : 1;

      jobIdRef.current += 1;
      const currentIntakeJob = jobIdRef.current;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Immediately call ingestFiles BEFORE any state updates or preview rendering
      const ingested = await ingestFiles(rawFiles, {
        maxFiles,
        isCancelled: () => jobIdRef.current !== currentIntakeJob,
      });

      if (jobIdRef.current !== currentIntakeJob) {
        for (const it of ingested) {
          releaseIngestedItem(it);
        }
        return;
      }

      // Create stable originalDownloadUrl once per ingested file so "Keep original" never recreates blob URLs
      let processedIngested: BatchItem[] = ingested.map((it) => ({
        ...it,
        originalDownloadUrl: it.originalBlob ? URL.createObjectURL(it.originalBlob) : undefined,
      }));

      // If any file failed during intake, run the tamper check so Details includes the exact expected-vs-actual pixel report
      if (processedIngested.some((it) => it.error)) {
        const tamperRes = await runTamperCheckDetailed();
        processedIngested = processedIngested.map((it) => {
          if (!it.error) return it;
          return {
            ...it,
            errorDetails: buildDiagnosticDetails(new Error(it.error), {
              name: it.name,
              type: it.type,
              size: it.size,
              dimensions: `${it.originalWidth} × ${it.originalHeight} px`,
              stage: it.errorStage || 'decode',
              tamperReport: tamperRes.report,
              extra: it.errorDetails,
            }),
          };
        });
      }

      const warnings = processedIngested.map((it) => it.warning).filter(Boolean);
      setWarningMessage(warnings.length > 0 ? warnings[0]! : null);
      setPdfError(null);

      const validIngested = processedIngested.filter((it) => !it.error);
      const failedIngested = processedIngested.filter((it) => it.error);

      if (validIngested.length > 0) {
        toast(
          validIngested.length === 1
            ? 'Added 1 photo'
            : `Added ${validIngested.length} photos`
        );
      }

      for (const failed of failedIngested) {
        toast.error(`${failed.name}: ${failed.error}`);
      }

      if (appendMode) {
        const failedOld = currentItems.filter((it) => it.error);
        cleanupItemsList(failedOld);
        setItems([...existingValid, ...processedIngested]);
      } else {
        cleanupItemsList(currentItems);
        setItems(processedIngested);
        setActiveIndex(0);
      }

      const firstValid = processedIngested.find((it) => !it.error);
      if (firstValid && tool.slug === 'resize-image') {
        setTargetWidth(Math.max(1, Math.round(firstValid.originalWidth * 0.75)));
        setTargetHeight(Math.max(1, Math.round(firstValid.originalHeight * 0.75)));
      }

      if (firstValid || existingValid.length > 0) {
        scheduleProcessing(false);
      } else {
        setIsProcessing(false);
        setIsPendingUpdate(false);
        setProgressRatio(0);
      }
    },
    [supportsBatch, tool.slug, cleanupItemsList, scheduleProcessing]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      const dt = e.clipboardData;
      if (!dt) return;

      const pastedFiles: File[] = [];
      if (dt.files && dt.files.length > 0) {
        for (let i = 0; i < dt.files.length; i++) {
          const f = dt.files[i];
          if (
            f.type.startsWith('image/') ||
            /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(f.name)
          ) {
            pastedFiles.push(f);
          }
        }
      } else if (dt.items && dt.items.length > 0) {
        for (let i = 0; i < dt.items.length; i++) {
          const item = dt.items[i];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const f = item.getAsFile();
            if (f) pastedFiles.push(f);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        void runSharedIntake(pastedFiles);
      }
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [runSharedIntake]);

  const executeSingleToolPass = async (
    item: BatchItem,
    currentJobId: number,
    forceMainThread: boolean
  ): Promise<ProcessedImageResult> => {
    if (tool.slug === 'compress-image') {
      return compressOrConvertImage(item, {
        quality,
        outputMimeType: outputMime,
        suffix: 'compressed',
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'convert-jpg-to-png') {
      return compressOrConvertImage(item, {
        quality: 100,
        outputMimeType: 'image/png',
        suffix: 'converted',
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'convert-png-to-jpg') {
      return compressOrConvertImage(item, {
        quality,
        outputMimeType: 'image/jpeg',
        backgroundColor: bgColor,
        suffix: 'converted',
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'convert-to-webp') {
      return compressOrConvertImage(item, {
        quality,
        outputMimeType: 'image/webp',
        suffix: 'webp',
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (
      tool.slug === 'resize-image-to-20kb' ||
      tool.slug === 'resize-image-to-50kb' ||
      tool.slug === 'resize-image-to-100kb'
    ) {
      return compressToTargetKB(item, targetKB, forceMainThread, currentJobId);
    }
    if (tool.slug === 'resize-image') {
      const finalW =
        resizeMode === 'percentage'
          ? Math.max(1, Math.round((item.originalWidth * scalePercent) / 100))
          : targetWidth;
      const finalH =
        resizeMode === 'percentage'
          ? Math.max(1, Math.round((item.originalHeight * scalePercent) / 100))
          : targetHeight;
      return resizeImageFile(item, {
        width: finalW,
        height: finalH,
        quality,
        outputMimeType: outputMime,
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'crop-image') {
      return cropImageFile(item, cropBox, outputMime, forceMainThread, currentJobId);
    }
    if (tool.slug === 'passport-photo-maker') {
      return generatePassportPhoto(item, {
        sizePreset: passportSize,
        zoom: passportZoom,
        panX: passportPanX,
        panY: passportPanY,
        brightenBackground: brightenBg,
        outputLayout: passportLayout,
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'rotate-flip-image') {
      return rotateFlipImageFile(item, {
        rotateDegrees: rotateDeg,
        straightenAngle: straightenDeg,
        flipH,
        flipV,
        jobId: currentJobId,
        forceMainThread,
      });
    }
    if (tool.slug === 'add-watermark') {
      return addWatermarkToImage(item, {
        text: watermarkText,
        opacity: watermarkOpacity,
        fontSizePercent: watermarkSize,
        color: watermarkColor,
        position: watermarkPos,
        jobId: currentJobId,
        forceMainThread,
      });
    }
    return convertToBlackAndWhite(item, {
      preset: bwPreset,
      contrast: bwContrast,
      brightness: bwBrightness,
      jobId: currentJobId,
      forceMainThread,
    });
  };

  useEffect(() => {
    if (processTrigger.id === 0) return;

    const validItems = itemsRef.current.filter((it) => !it.error);
    if (validItems.length === 0) {
      setIsProcessing(false);
      setIsPendingUpdate(false);
      setProgressRatio(0);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const currentJobId = processTrigger.id;
    const delay = processTrigger.debounce ? 300 : 0;

    debounceTimerRef.current = setTimeout(async () => {
      if (jobIdRef.current !== currentJobId) return;

      setIsProcessing(true);
      setPdfError(null);

      try {
        if (tool.slug === 'image-to-pdf') {
          let res: ProcessedImageResult;
          try {
            res = await buildPdfFromImages(
              validItems,
              {
                pageSize: pdfPageSize,
                orientation: pdfOrientation,
                marginPt: pdfMargin,
                quality: pdfQuality,
                jobId: currentJobId,
                forceMainThread: false,
              },
              (current, total) => {
                if (jobIdRef.current === currentJobId) {
                  setProgressRatio(current / total);
                }
              },
              () => jobIdRef.current !== currentJobId
            );
          } catch {
            if (jobIdRef.current !== currentJobId) return;
            resetImageWorker();
            res = await buildPdfFromImages(
              validItems,
              {
                pageSize: pdfPageSize,
                orientation: pdfOrientation,
                marginPt: pdfMargin,
                quality: pdfQuality,
                jobId: currentJobId,
                forceMainThread: true,
              },
              (current, total) => {
                if (jobIdRef.current === currentJobId) {
                  setProgressRatio(current / total);
                }
              },
              () => jobIdRef.current !== currentJobId
            );
          }

          if (jobIdRef.current !== currentJobId || res.jobId !== currentJobId) {
            releaseProcessedResultUrls(res);
            return;
          }

          setPdfResult((prev) => {
            if (prev) retiredResultsRef.current.push(prev);
            return res;
          });
          setIsProcessing(false);
          setIsPendingUpdate(false);
          setProgressRatio(1);
          return;
        }

        for (let i = 0; i < validItems.length; i++) {
          if (jobIdRef.current !== currentJobId) return;
          const item = validItems[i];
          setProgressRatio((i + 0.35) / validItems.length);

          try {
            let result: ProcessedImageResult;
            try {
              result = await executeSingleToolPass(item, currentJobId, false);
            } catch {
              if (jobIdRef.current !== currentJobId) return;
              resetImageWorker();
              result = await executeSingleToolPass(item, currentJobId, true);
            }

            if (jobIdRef.current !== currentJobId || result.jobId !== currentJobId) {
              releaseProcessedResultUrls(result);
              return;
            }

            if (result.timeoutMessage) {
              setWarningMessage(result.timeoutMessage);
            }

            setItems((prev) =>
              prev.map((p) => {
                if (p.id !== item.id) return p;
                if (p.result) {
                  retiredResultsRef.current.push(p.result);
                }
                return {
                  ...p,
                  result,
                  error: undefined,
                  errorDetails: undefined,
                };
              })
            );
            setProgressRatio((i + 1) / validItems.length);
          } catch (err) {
            if (jobIdRef.current !== currentJobId) return;
            const tamperDetail = await runTamperCheckDetailed();
            const stage =
              err instanceof ImageProcessError ? err.stage : 'process';
            const realErrorMsg =
              err instanceof ImageProcessError
                ? err.message
                : err instanceof Error && err.message
                ? err.message
                : ERROR_MSG_UNSUPPORTED_FORMAT;

            const details = buildDiagnosticDetails(err, {
              name: item.name,
              type: item.type,
              size: item.size,
              dimensions: `${item.originalWidth} × ${item.originalHeight} px`,
              stage,
              tamperReport: tamperDetail.report,
            });
            toast.error(`${item.name}: ${realErrorMsg}`);
            setItems((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? {
                      ...p,
                      error: realErrorMsg,
                      errorStage: stage,
                      errorDetails: details,
                    }
                  : p
              )
            );
          }
        }
      } catch (err) {
        if (jobIdRef.current !== currentJobId) return;
        if (tool.slug === 'image-to-pdf') {
          const tamperDetail = await runTamperCheckDetailed();
          const msg =
            err instanceof ImageProcessError
              ? err.message
              : err instanceof Error && err.message
              ? err.message
              : 'Could not build PDF from the selected images.';
          toast.error(msg);
          setPdfError({
            message: msg,
            details: buildDiagnosticDetails(err, {
              stage: 'encode',
              tamperReport: tamperDetail.report,
            }),
          });
        }
      } finally {
        if (jobIdRef.current === currentJobId) {
          setIsProcessing(false);
          setIsPendingUpdate(false);
          setTimeout(() => {
            flushRetiredResults();
          }, 800);
        }
      }
    }, delay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [processTrigger, flushRetiredResults]);

  const activeItem =
    items[activeIndex] || items.find((i) => !i.error) || items[0] || null;

  const applyAspectRatioToCrop = (
    ratioKey: typeof cropAspect,
    imgW: number,
    imgH: number
  ) => {
    setCropAspect(ratioKey);
    if (ratioKey === 'free' || !imgW || !imgH) {
      setCropBox({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
      scheduleProcessing(false);
      return;
    }
    const [rw, rh] = ratioKey.split(':').map(Number);
    const targetRatio = rw / rh;
    const currentRatio = imgW / imgH;

    let normW = 0.8;
    let normH = 0.8;
    if (currentRatio > targetRatio) {
      normH = 0.85;
      normW = (normH * imgH * targetRatio) / imgW;
    } else {
      normW = 0.85;
      normH = (normW * imgW) / (targetRatio * imgH);
    }
    setCropBox({
      x: Number(((1 - normW) / 2).toFixed(3)),
      y: Number(((1 - normH) / 2).toFixed(3)),
      width: Number(normW.toFixed(3)),
      height: Number(normH.toFixed(3)),
    });
    scheduleProcessing(false);
  };

  const handleWidthChange = (newW: number) => {
    const clamped = Math.max(1, Math.min(4096, newW || 1));
    setTargetWidth(clamped);
    if (lockAspect && activeItem && activeItem.originalWidth > 0) {
      const ratio = activeItem.originalHeight / activeItem.originalWidth;
      setTargetHeight(Math.max(1, Math.round(clamped * ratio)));
    }
    scheduleProcessing(true);
  };

  const handleHeightChange = (newH: number) => {
    const clamped = Math.max(1, Math.min(4096, newH || 1));
    setTargetHeight(clamped);
    if (lockAspect && activeItem && activeItem.originalHeight > 0) {
      const ratio = activeItem.originalWidth / activeItem.originalHeight;
      setTargetWidth(Math.max(1, Math.round(clamped * ratio)));
    }
    scheduleProcessing(true);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, moved);
    setItems(copy);
    setActiveIndex(nextIdx);
    scheduleProcessing(false);
  };

  const removeItem = (index: number) => {
    const target = items[index];
    if (target) {
      if (target.originalDownloadUrl) {
        try {
          URL.revokeObjectURL(target.originalDownloadUrl);
        } catch {}
      }
      releaseIngestedItem(target);
    }
    const copy = items.filter((_, i) => i !== index);
    setItems(copy);
    if (activeIndex >= copy.length) {
      setActiveIndex(Math.max(0, copy.length - 1));
    }
    if (copy.some((i) => !i.error)) {
      scheduleProcessing(false);
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const files = inputEl.files ? Array.from(inputEl.files) : [];
    if (files.length === 0) return;
    try {
      await runSharedIntake(files);
    } finally {
      inputEl.value = '';
    }
  };

  const handleDownloadToast = (origBytes?: number, newBytes?: number) => {
    if (origBytes && newBytes && origBytes > newBytes) {
      const savedPct = Math.round((1 - newBytes / origBytes) * 100);
      if (savedPct > 0) {
        toast(`Downloaded, saved ${savedPct}%`);
        return;
      }
    }
    toast('Downloaded');
  };

  const renderTryAnotherToolSuggestions = () => {
    const suggestions = tool.relatedTools
      .slice(0, 3)
      .map((slug) => TOOLS_BY_SLUG[slug])
      .filter(Boolean);
    if (suggestions.length === 0) return null;

    return (
      <div className="pt-[12px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[8px] min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B66] dark:text-[#9B9B95]">
          Try another tool
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {suggestions.map((rel) => (
            <a
              key={rel.slug}
              href={rel.path}
              onClick={(e) => {
                if (!onNavigate) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onNavigate(rel.path);
              }}
              className="group min-h-[38px] px-[12px] py-[6px] rounded-[8px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] hover:border-[#E5542B] dark:hover:border-[#E5542B] text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center gap-[6px] transition-colors duration-150"
            >
              <span>{rel.name}</span>
              <span
                aria-hidden="true"
                className="text-[#6B6B66] dark:text-[#9B9B95] group-hover:text-[#E5542B] group-hover:translate-x-[2px] transition-all duration-150"
              >
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const isUpdatingJob = isPendingUpdate || isProcessing;

  const renderSizeComparisonLine = (item: BatchItem) => {
    const res = item.result;
    if (!res || isUpdatingJob || res.jobId !== jobIdRef.current) {
      return (
        <div className="space-y-[6px] min-w-0">
          <p className="text-sm font-mono tabular-nums text-[#6B6B66] dark:text-[#9B9B95]">
            {formatBytes(item.size)} → Updating...
          </p>
        </div>
      );
    }

    const { originalBytes, newBytes, qualityUsed, format, width, height, jobId } = res;
    const percentSaved =
      originalBytes > 0 ? Math.round((1 - newBytes / originalBytes) * 100) : 0;
    const isSmaller = newBytes < originalBytes && percentSaved > 0;

    const origParts = getFormattedSizeParts(originalBytes);
    const newParts = getFormattedSizeParts(newBytes);
    const resultKey = `${item.id}-${jobId}-${newBytes}`;

    return (
      <div className="space-y-[10px] min-w-0">
        <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-sm text-[#1A1A1A] dark:text-[#EDEDEA] min-w-0 tabular-nums">
          <span className="font-mono text-[#6B6B66] dark:text-[#9B9B95]">
            {formatBytes(originalBytes)}
          </span>
          <span className="text-[#6B6B66] dark:text-[#9B9B95]">→</span>
          <span className="font-mono font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
            <Suspense fallback={<span>{newParts.value.toFixed(newParts.decimals)}</span>}>
              <LazyNumberTicker
                key={`size-${resultKey}`}
                startValue={
                  origParts.unit === newParts.unit ? origParts.value : newParts.value
                }
                value={newParts.value}
                decimalPlaces={newParts.decimals}
              />
            </Suspense>{' '}
            {newParts.unit}
          </span>
          {isSmaller ? (
            <Badge
              key={`saved-${resultKey}`}
              variant="accent"
              className="animate-spring-pop"
            >
              <Suspense fallback={<span>{percentSaved}</span>}>
                <LazyNumberTicker
                  key={`pct-${resultKey}`}
                  startValue={0}
                  value={percentSaved}
                  decimalPlaces={0}
                  className="text-[#E5542B] dark:text-[#E5542B]"
                />
              </Suspense>
              % saved
            </Badge>
          ) : (
            <Badge variant="success">Ready</Badge>
          )}
        </div>

        {/* Applied settings line: e.g. "JPG · quality 78% · 1080 × 2460 px" */}
        <div className="flex flex-wrap items-center gap-[6px] text-xs font-mono text-[#6B6B66] dark:text-[#9B9B95] tabular-nums">
          <span>
            {format} ·{' '}
            {qualityUsed !== null ? `quality ${qualityUsed}%` : 'lossless'} · {width} ×{' '}
            {height} px
          </span>
        </div>

        {!isSmaller && (
          <div className="rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] p-[12px] text-xs text-[#1A1A1A] dark:text-[#EDEDEA] flex flex-col sm:flex-row sm:items-center justify-between gap-[10px]">
            <span>
              Already well optimized. The output isn&apos;t smaller than the original.
            </span>
            {item.originalDownloadUrl && (
              <a
                href={item.originalDownloadUrl}
                download={item.name}
                onClick={() => toast('Downloaded original file')}
                className="btn-press min-h-[36px] px-[12px] py-[6px] rounded-[8px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] hover:border-[#E5542B] text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center shrink-0"
              >
                Keep original ({formatBytes(originalBytes)})
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const usesComparePreview =
    tool.slug === 'compress-image' ||
    tool.slug === 'resize-image' ||
    tool.slug === 'resize-image-to-20kb' ||
    tool.slug === 'resize-image-to-50kb' ||
    tool.slug === 'resize-image-to-100kb' ||
    tool.slug === 'convert-jpg-to-png' ||
    tool.slug === 'convert-png-to-jpg' ||
    tool.slug === 'convert-to-webp' ||
    tool.slug === 'image-to-black-and-white' ||
    tool.slug === 'add-watermark';

  const isBatchJob = items.filter((it) => !it.error).length > 1;
  const hasReadyDownload =
    tool.slug === 'image-to-pdf'
      ? Boolean(pdfResult && !isUpdatingJob)
      : Boolean(activeItem?.result && !isUpdatingJob);

  const activeAspectRatio =
    activeItem && activeItem.width > 0 && activeItem.height > 0
      ? activeItem.width / activeItem.height
      : undefined;

  return (
    <section
      aria-label={`${tool.name} Workspace`}
      className="mt-[24px] w-full max-w-full min-w-0 animate-panel-fade"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileInputChange}
        className="sr-only"
        aria-label="Choose photos"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileInputChange}
        className="sr-only"
        aria-label="Take a photo"
      />

      {/* Advisory Brave Shields / Canvas Tampered Notice shown ONCE at the top of the workspace ONLY when canvasIsTampered() returns true */}
      {tampered && !noticeDismissed && (
        <CanvasBlockedNotice
          brave={brave}
          isChecking={isChecking}
          onCheckAgain={handleCheckAgain}
          onDismiss={() => setNoticeDismissed(true)}
        />
      )}

      {warningMessage && (
        <div
          role="status"
          className="mb-[16px] px-[16px] py-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-sm text-[#6B6B66] dark:text-[#9B9B95] break-words"
        >
          {warningMessage}
        </div>
      )}

      {items.length === 0 ? (
        <FileUpload
          onChange={runSharedIntake}
          onTakePhotoClick={() => cameraInputRef.current?.click()}
          multiple={supportsBatch}
          maxFiles={supportsBatch ? 10 : 1}
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
            if (dropped.length > 0) {
              void runSharedIntake(dropped);
            }
          }}
          className="relative w-full max-w-full overflow-hidden rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[20px] sm:p-[32px] box-border"
        >
          {isUpdatingJob && (
            <Progress
              value={isBatchJob ? Math.max(15, Math.round(progressRatio * 100)) : 65}
              indeterminate={false}
              aria-label="Image processing progress"
              className="absolute top-0 left-0 right-0 z-20 rounded-none"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] lg:gap-[32px] items-start w-full max-w-full min-w-0">
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 space-y-[24px] w-full max-w-full min-w-0">
              {tool.slug === 'compress-image' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0 space-y-[6px]">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                      <label htmlFor="quality-slider" className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                        Quality
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {outputMime === 'image/png' ? 'Lossless' : `${quality}%`}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                      Higher keeps more detail and a larger file. This isn&apos;t the percentage saved.
                    </p>
                    <Slider
                      id="quality-slider"
                      min={10}
                      max={98}
                      step={1}
                      disabled={outputMime === 'image/png'}
                      value={[quality]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        setQuality(vals[0] ?? 78);
                        scheduleProcessing(true);
                      }}
                      aria-label="Quality"
                    />
                    {outputMime === 'image/png' && (
                      <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5] pt-[2px]">
                        PNG is lossless, so quality doesn&apos;t apply. Choose JPG or WebP for smaller files.
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Output format
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={outputMime}
                      onValueChange={(val) => {
                        if (!val) return;
                        setOutputMime(val as 'image/jpeg' | 'image/png' | 'image/webp');
                        scheduleProcessing(false);
                      }}
                      aria-label="Output format"
                    >
                      <ToggleGroupItem value="image/jpeg">JPG</ToggleGroupItem>
                      <ToggleGroupItem value="image/webp">WebP</ToggleGroupItem>
                      <ToggleGroupItem value="image/png">PNG</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {(tool.slug === 'resize-image-to-20kb' ||
                tool.slug === 'resize-image-to-50kb' ||
                tool.slug === 'resize-image-to-100kb') && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <label htmlFor="target-kb-input" className="truncate">
                        Maximum target size
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {targetKB} KB
                      </span>
                    </div>
                    <Slider
                      id="target-kb-input"
                      min={10}
                      max={200}
                      step={5}
                      value={[targetKB]}
                      formatValue={(v) => `${v} KB`}
                      onValueChange={(vals) => {
                        setTargetKB(vals[0] ?? defaultTargetKB);
                        scheduleProcessing(true);
                      }}
                      aria-label="Maximum target size in kilobytes"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Quick presets
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={String(targetKB)}
                      onValueChange={(val) => {
                        if (!val) return;
                        setTargetKB(Number(val));
                        scheduleProcessing(false);
                      }}
                      aria-label="Quick KB presets"
                    >
                      <ToggleGroupItem value="20" className="font-mono">
                        20 KB
                      </ToggleGroupItem>
                      <ToggleGroupItem value="50" className="font-mono">
                        50 KB
                      </ToggleGroupItem>
                      <ToggleGroupItem value="100" className="font-mono">
                        100 KB
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {tool.slug === 'resize-image' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Resize mode
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={resizeMode}
                      onValueChange={(val) => {
                        if (!val) return;
                        setResizeMode(val as 'pixels' | 'percentage');
                        scheduleProcessing(false);
                      }}
                      aria-label="Resize mode"
                    >
                      <ToggleGroupItem value="pixels">By pixels</ToggleGroupItem>
                      <ToggleGroupItem value="percentage">By percentage</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {resizeMode === 'pixels' ? (
                    <div className="space-y-[16px] min-w-0">
                      <div className="grid grid-cols-2 gap-[12px] min-w-0">
                        <div className="min-w-0">
                          <label
                            htmlFor="resize-w"
                            className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate"
                          >
                            Width (px)
                          </label>
                          <input
                            id="resize-w"
                            type="number"
                            min={1}
                            max={4096}
                            value={targetWidth}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            className="w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA]"
                          />
                        </div>
                        <div className="min-w-0">
                          <label
                            htmlFor="resize-h"
                            className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate"
                          >
                            Height (px)
                          </label>
                          <input
                            id="resize-h"
                            type="number"
                            min={1}
                            max={4096}
                            value={targetHeight}
                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                            className="w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA]"
                          />
                        </div>
                      </div>

                      <label className="min-h-[48px] flex items-center gap-[10px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={lockAspect}
                          onChange={(e) => setLockAspect(e.target.checked)}
                          className="rounded accent-[#E5542B] w-[18px] h-[18px] shrink-0"
                        />
                        <span className="truncate">Lock aspect ratio</span>
                      </label>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                        <label htmlFor="scale-slider" className="truncate">
                          Scale percentage
                        </label>
                        <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                          {scalePercent}%
                        </span>
                      </div>
                      <Slider
                        id="scale-slider"
                        min={10}
                        max={100}
                        step={5}
                        value={[scalePercent]}
                        formatValue={(v) => `${v}%`}
                        onValueChange={(vals) => {
                          setScalePercent(vals[0] ?? 50);
                          scheduleProcessing(true);
                        }}
                        aria-label="Scale percentage"
                      />
                    </div>
                  )}

                  <div className="min-w-0 space-y-[6px]">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                      <label htmlFor="resize-quality-slider" className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                        Quality
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {outputMime === 'image/png' ? 'Lossless' : `${quality}%`}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                      Higher keeps more detail and a larger file. This isn&apos;t the percentage saved.
                    </p>
                    <Slider
                      id="resize-quality-slider"
                      min={10}
                      max={98}
                      step={1}
                      disabled={outputMime === 'image/png'}
                      value={[quality]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        setQuality(vals[0] ?? 88);
                        scheduleProcessing(true);
                      }}
                      aria-label="Quality"
                    />
                    {outputMime === 'image/png' && (
                      <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5] pt-[2px]">
                        PNG is lossless, so quality doesn&apos;t apply. Choose JPG or WebP for smaller files.
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Output format
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={outputMime}
                      onValueChange={(val) => {
                        if (!val) return;
                        setOutputMime(val as 'image/jpeg' | 'image/png' | 'image/webp');
                        scheduleProcessing(false);
                      }}
                      aria-label="Output format"
                    >
                      <ToggleGroupItem value="image/jpeg">JPG</ToggleGroupItem>
                      <ToggleGroupItem value="image/webp">WebP</ToggleGroupItem>
                      <ToggleGroupItem value="image/png">PNG</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {tool.slug === 'convert-jpg-to-png' && (
                <p className="text-[14px] text-[#6B6B66] dark:text-[#9B9B95] leading-relaxed">
                  PNG is lossless, so quality doesn&apos;t apply. Choose JPG or WebP for smaller files.
                </p>
              )}

              {tool.slug === 'convert-png-to-jpg' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0 space-y-[6px]">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                      <label htmlFor="png-jpg-q" className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                        Quality
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {quality}%
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                      Higher keeps more detail and a larger file. This isn&apos;t the percentage saved.
                    </p>
                    <Slider
                      id="png-jpg-q"
                      min={20}
                      max={98}
                      step={1}
                      value={[quality]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        setQuality(vals[0] ?? 88);
                        scheduleProcessing(true);
                      }}
                      aria-label="Quality"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Background fill
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={bgColor}
                      onValueChange={(val) => {
                        if (!val) return;
                        setBgColor(val);
                        scheduleProcessing(false);
                      }}
                      aria-label="Background fill color"
                    >
                      <ToggleGroupItem value="#FFFFFF">White</ToggleGroupItem>
                      <ToggleGroupItem value="#1A1A1A">Black</ToggleGroupItem>
                      <ToggleGroupItem value="#F7F6F3">Warm gray</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {tool.slug === 'convert-to-webp' && (
                <div className="min-w-0 space-y-[6px]">
                  <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                    <label htmlFor="webp-q" className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                      Quality
                    </label>
                    <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                      {quality}%
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                    Higher keeps more detail and a larger file. This isn&apos;t the percentage saved.
                  </p>
                  <Slider
                    id="webp-q"
                    min={20}
                    max={98}
                    step={1}
                    value={[quality]}
                    formatValue={(v) => `${v}%`}
                    onValueChange={(vals) => {
                      setQuality(vals[0] ?? 82);
                      scheduleProcessing(true);
                    }}
                    aria-label="Quality"
                  />
                </div>
              )}

              {tool.slug === 'crop-image' && activeItem && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Aspect ratio
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={cropAspect}
                      onValueChange={(val) => {
                        if (!val) return;
                        applyAspectRatioToCrop(
                          val as typeof cropAspect,
                          activeItem.originalWidth,
                          activeItem.originalHeight
                        );
                      }}
                      aria-label="Crop aspect ratio"
                    >
                      <ToggleGroupItem value="free">Free</ToggleGroupItem>
                      <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
                      <ToggleGroupItem value="4:5">4:5</ToggleGroupItem>
                      <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
                      <ToggleGroupItem value="3:2">3:2</ToggleGroupItem>
                      <ToggleGroupItem value="4:3">4:3</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <span className="truncate">Crop area size</span>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {Math.round(cropBox.width * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={20}
                      max={100}
                      step={1}
                      value={[Math.round(cropBox.width * 100)]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        const w = (vals[0] ?? 80) / 100;
                        const h =
                          cropAspect === 'free'
                            ? cropBox.height
                            : Math.min(1, w * (cropBox.height / cropBox.width));
                        setCropBox({
                          x: Math.min(1 - w, cropBox.x),
                          y: Math.min(1 - h, cropBox.y),
                          width: w,
                          height: h,
                        });
                        scheduleProcessing(true);
                      }}
                      aria-label="Crop area size"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] min-w-0">
                    <div className="min-w-0">
                      <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate">
                        Horizontal position
                      </label>
                      <Slider
                        min={0}
                        max={Math.max(1, Math.round((1 - cropBox.width) * 100))}
                        step={1}
                        value={[Math.round(cropBox.x * 100)]}
                        formatValue={(v) => `${v}%`}
                        onValueChange={(vals) => {
                          setCropBox((prev) => ({
                            ...prev,
                            x: Math.min(1 - prev.width, (vals[0] ?? 0) / 100),
                          }));
                          scheduleProcessing(true);
                        }}
                        aria-label="Horizontal crop position"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate">
                        Vertical position
                      </label>
                      <Slider
                        min={0}
                        max={Math.max(1, Math.round((1 - cropBox.height) * 100))}
                        step={1}
                        value={[Math.round(cropBox.y * 100)]}
                        formatValue={(v) => `${v}%`}
                        onValueChange={(vals) => {
                          setCropBox((prev) => ({
                            ...prev,
                            y: Math.min(1 - prev.height, (vals[0] ?? 0) / 100),
                          }));
                          scheduleProcessing(true);
                        }}
                        aria-label="Vertical crop position"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tool.slug === 'passport-photo-maker' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Document size
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={passportSize}
                      onValueChange={(val) => {
                        if (!val) return;
                        setPassportSize(val as '35x45mm' | '2x2in' | '51x51mm');
                        scheduleProcessing(false);
                      }}
                      aria-label="Passport document size"
                    >
                      <ToggleGroupItem value="35x45mm">35×45 mm</ToggleGroupItem>
                      <ToggleGroupItem value="2x2in">2×2 inch</ToggleGroupItem>
                      <ToggleGroupItem value="51x51mm">51×51 mm</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <span className="truncate">Head framing zoom</span>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {Math.round(passportZoom * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={100}
                      max={220}
                      step={1}
                      value={[Math.round(passportZoom * 100)]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        setPassportZoom((vals[0] ?? 115) / 100);
                        scheduleProcessing(true);
                      }}
                      aria-label="Head framing zoom"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] min-w-0">
                    <div className="min-w-0">
                      <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate">
                        Horizontal center
                      </label>
                      <Slider
                        min={-50}
                        max={50}
                        step={1}
                        value={[passportPanX]}
                        onValueChange={(vals) => {
                          setPassportPanX(vals[0] ?? 0);
                          scheduleProcessing(true);
                        }}
                        aria-label="Horizontal center"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] truncate">
                        Vertical center
                      </label>
                      <Slider
                        min={-50}
                        max={50}
                        step={1}
                        value={[passportPanY]}
                        onValueChange={(vals) => {
                          setPassportPanY(vals[0] ?? 0);
                          scheduleProcessing(true);
                        }}
                        aria-label="Vertical center"
                      />
                    </div>
                  </div>

                  <label className="min-h-[48px] flex items-center gap-[10px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={brightenBg}
                      onChange={(e) => {
                        setBrightenBg(e.target.checked);
                        scheduleProcessing(false);
                      }}
                      className="rounded accent-[#E5542B] w-[18px] h-[18px] shrink-0"
                    />
                    <span className="truncate">Brighten light background</span>
                  </label>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Output layout
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={passportLayout}
                      onValueChange={(val) => {
                        if (!val) return;
                        setPassportLayout(val as 'single' | 'a4-sheet');
                        scheduleProcessing(false);
                      }}
                      aria-label="Passport output layout"
                    >
                      <ToggleGroupItem value="single">Single photo</ToggleGroupItem>
                      <ToggleGroupItem value="a4-sheet">A4 sheet (9 copies)</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {tool.slug === 'rotate-flip-image' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Orientation
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px] min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setRotateDeg((d) => (d - 90 + 360) % 360);
                          scheduleProcessing(false);
                        }}
                        className="btn-press w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B] cursor-pointer truncate"
                      >
                        Rotate 90° left
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRotateDeg((d) => (d + 90) % 360);
                          scheduleProcessing(false);
                        }}
                        className="btn-press w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B] cursor-pointer truncate"
                      >
                        Rotate 90° right
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlipH((f) => !f);
                          scheduleProcessing(false);
                        }}
                        className={`btn-press w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border text-sm font-medium cursor-pointer truncate ${
                          flipH
                            ? 'border-[#1A1A1A] dark:border-[#EDEDEA] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E]'
                            : 'border-[#E7E5E0] dark:border-[#262624] text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B]'
                        }`}
                      >
                        Flip horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlipV((f) => !f);
                          scheduleProcessing(false);
                        }}
                        className={`btn-press w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border text-sm font-medium cursor-pointer truncate ${
                          flipV
                            ? 'border-[#1A1A1A] dark:border-[#EDEDEA] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E]'
                            : 'border-[#E7E5E0] dark:border-[#262624] text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B]'
                        }`}
                      >
                        Flip vertical
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <label htmlFor="straighten-slider" className="truncate">
                        Straighten angle
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {straightenDeg}°
                      </span>
                    </div>
                    <Slider
                      id="straighten-slider"
                      min={-45}
                      max={45}
                      step={0.5}
                      value={[straightenDeg]}
                      formatValue={(v) => `${v}°`}
                      onValueChange={(vals) => {
                        setStraightenDeg(vals[0] ?? 0);
                        scheduleProcessing(true);
                      }}
                      aria-label="Straighten angle"
                    />
                  </div>
                </div>
              )}

              {tool.slug === 'add-watermark' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label
                      htmlFor="wm-text"
                      className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px]"
                    >
                      Watermark text
                    </label>
                    <input
                      id="wm-text"
                      type="text"
                      value={watermarkText}
                      onChange={(e) => {
                        setWatermarkText(e.target.value);
                        scheduleProcessing(true);
                      }}
                      className="w-full min-w-0 min-h-[48px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm text-[#1A1A1A] dark:text-[#EDEDEA]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Placement
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={watermarkPos}
                      onValueChange={(val) => {
                        if (!val) return;
                        setWatermarkPos(val as WatermarkPosition);
                        scheduleProcessing(false);
                      }}
                      aria-label="Watermark placement"
                    >
                      <ToggleGroupItem value="bottom-right">Bottom right</ToggleGroupItem>
                      <ToggleGroupItem value="bottom-left">Bottom left</ToggleGroupItem>
                      <ToggleGroupItem value="center">Center</ToggleGroupItem>
                      <ToggleGroupItem value="top-right">Top right</ToggleGroupItem>
                      <ToggleGroupItem value="top-left">Top left</ToggleGroupItem>
                      <ToggleGroupItem value="tiled">Tiled grid</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                        <label htmlFor="wm-opacity" className="truncate">
                          Opacity
                        </label>
                        <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                          {watermarkOpacity}%
                        </span>
                      </div>
                      <Slider
                        id="wm-opacity"
                        min={10}
                        max={100}
                        step={1}
                        value={[watermarkOpacity]}
                        formatValue={(v) => `${v}%`}
                        onValueChange={(vals) => {
                          setWatermarkOpacity(vals[0] ?? 40);
                          scheduleProcessing(true);
                        }}
                        aria-label="Watermark opacity"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                        <label htmlFor="wm-size" className="truncate">
                          Text size
                        </label>
                        <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                          {watermarkSize}%
                        </span>
                      </div>
                      <Slider
                        id="wm-size"
                        min={2}
                        max={10}
                        step={0.5}
                        value={[watermarkSize]}
                        formatValue={(v) => `${v}%`}
                        onValueChange={(vals) => {
                          setWatermarkSize(vals[0] ?? 4);
                          scheduleProcessing(true);
                        }}
                        aria-label="Watermark text size"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Text color
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={watermarkColor}
                      onValueChange={(val) => {
                        if (!val) return;
                        setWatermarkColor(val);
                        scheduleProcessing(false);
                      }}
                      aria-label="Watermark text color"
                    >
                      <ToggleGroupItem value="#FFFFFF">White</ToggleGroupItem>
                      <ToggleGroupItem value="#111111">Black</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {tool.slug === 'image-to-black-and-white' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Tone preset
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={bwPreset}
                      onValueChange={(val) => {
                        if (!val) return;
                        setBwPreset(val as 'standard' | 'high-contrast' | 'soft' | 'sepia');
                        scheduleProcessing(false);
                      }}
                      aria-label="Black and white tone preset"
                    >
                      <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
                      <ToggleGroupItem value="high-contrast">High contrast</ToggleGroupItem>
                      <ToggleGroupItem value="soft">Soft tone</ToggleGroupItem>
                      <ToggleGroupItem value="sepia">Warm sepia</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <label htmlFor="bw-contrast" className="truncate">
                        Contrast
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {bwContrast > 0 ? `+${bwContrast}` : bwContrast}
                      </span>
                    </div>
                    <Slider
                      id="bw-contrast"
                      min={-40}
                      max={50}
                      step={1}
                      value={[bwContrast]}
                      onValueChange={(vals) => {
                        setBwContrast(vals[0] ?? 10);
                        scheduleProcessing(true);
                      }}
                      aria-label="Contrast adjustment"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[6px] min-w-0">
                      <label htmlFor="bw-bright" className="truncate">
                        Brightness
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {bwBrightness > 0 ? `+${bwBrightness}` : bwBrightness}
                      </span>
                    </div>
                    <Slider
                      id="bw-bright"
                      min={-40}
                      max={40}
                      step={1}
                      value={[bwBrightness]}
                      onValueChange={(vals) => {
                        setBwBrightness(vals[0] ?? 0);
                        scheduleProcessing(true);
                      }}
                      aria-label="Brightness adjustment"
                    />
                  </div>
                </div>
              )}

              {tool.slug === 'image-to-pdf' && (
                <div className="space-y-[24px] min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                      Page size
                    </label>
                    <ToggleGroup
                      type="single"
                      spacing={0}
                      value={pdfPageSize}
                      onValueChange={(val) => {
                        if (!val) return;
                        setPdfPageSize(val as 'a4' | 'letter' | 'fit');
                        scheduleProcessing(false);
                      }}
                      aria-label="PDF page size"
                    >
                      <ToggleGroupItem value="a4">A4</ToggleGroupItem>
                      <ToggleGroupItem value="letter">Letter</ToggleGroupItem>
                      <ToggleGroupItem value="fit">Fit image</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {pdfPageSize !== 'fit' && (
                    <div className="space-y-[24px] min-w-0">
                      <div className="min-w-0">
                        <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                          Orientation
                        </label>
                        <ToggleGroup
                          type="single"
                          spacing={0}
                          value={pdfOrientation}
                          onValueChange={(val) => {
                            if (!val) return;
                            setPdfOrientation(val as 'portrait' | 'landscape');
                            scheduleProcessing(false);
                          }}
                          aria-label="PDF orientation"
                        >
                          <ToggleGroupItem value="portrait">Portrait</ToggleGroupItem>
                          <ToggleGroupItem value="landscape">Landscape</ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-[14px] text-[#6B6B66] dark:text-[#9B9B95] mb-[8px]">
                          Page margin
                        </label>
                        <ToggleGroup
                          type="single"
                          spacing={0}
                          value={String(pdfMargin)}
                          onValueChange={(val) => {
                            if (val === undefined) return;
                            setPdfMargin(Number(val));
                            scheduleProcessing(false);
                          }}
                          aria-label="PDF page margin"
                        >
                          <ToggleGroupItem value="0">None</ToggleGroupItem>
                          <ToggleGroupItem value="24">Small</ToggleGroupItem>
                          <ToggleGroupItem value="48">Wide</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 space-y-[6px]">
                    <div className="flex items-center justify-between gap-[8px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                      <label htmlFor="pdf-q" className="font-medium text-[#1A1A1A] dark:text-[#EDEDEA] truncate">
                        Quality
                      </label>
                      <span className="font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA] shrink-0">
                        {pdfQuality}%
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B66] dark:text-[#9B9B95] leading-[1.5]">
                      Higher keeps more detail and a larger file. This isn&apos;t the percentage saved.
                    </p>
                    <Slider
                      id="pdf-q"
                      min={40}
                      max={95}
                      step={1}
                      value={[pdfQuality]}
                      formatValue={(v) => `${v}%`}
                      onValueChange={(vals) => {
                        setPdfQuality(vals[0] ?? 82);
                        scheduleProcessing(true);
                      }}
                      aria-label="Quality"
                    />
                  </div>
                </div>
              )}

              {/* File Queue & Per-File Errors */}
              <div className="pt-[16px] border-t border-[#E7E5E0] dark:border-[#262624] space-y-[12px] min-w-0 max-w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[10px] text-[14px] text-[#6B6B66] dark:text-[#9B9B95] min-w-0">
                  <span className="truncate">
                    {items.length === 1 ? 'Selected file' : `Files (${items.length})`}
                  </span>
                  <div className="grid grid-cols-2 sm:flex items-center gap-[8px] sm:gap-[12px] w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-press min-h-[48px] sm:min-h-[36px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] inline-flex items-center justify-center gap-[6px] text-xs sm:text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDEA] hover:border-[#E5542B] cursor-pointer truncate"
                    >
                      <Plus strokeWidth={1.5} className="w-[14px] h-[14px] shrink-0" />
                      <span className="truncate">
                        {supportsBatch && items.length < 10 ? 'Add more' : 'Choose photos'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="btn-press min-h-[48px] sm:min-h-[36px] px-[12px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] inline-flex items-center justify-center gap-[6px] text-xs sm:text-sm font-medium text-[#6B6B66] dark:text-[#9B9B95] hover:border-[#E5542B] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] cursor-pointer truncate"
                    >
                      <Camera strokeWidth={1.5} className="w-[14px] h-[14px] shrink-0" />
                      <span className="truncate">Take a photo</span>
                    </button>
                  </div>
                </div>

                <ul className="divide-y divide-[#E7E5E0] dark:divide-[#262624] min-w-0 max-w-full">
                  {items.map((item, idx) => {
                    const rowResult = item.result;
                    const rowOriginalBytes = rowResult ? rowResult.originalBytes : item.size;
                    const rowNewBytes = rowResult?.newBytes;
                    const rowJobFresh =
                      rowResult && !isUpdatingJob && rowResult.jobId === jobIdRef.current;

                    return (
                      <motion.li
                        layout
                        key={item.id}
                        className="py-[10px] text-sm min-w-0 max-w-full"
                      >
                        <div
                          onClick={() => !item.error && setActiveIndex(idx)}
                          className={`relative flex items-center justify-between gap-[10px] rounded-[10px] px-[8px] py-[6px] min-w-0 max-w-full transition-colors duration-150 ${
                            !item.error ? 'cursor-pointer' : ''
                          }`}
                        >
                          {idx === activeIndex && !item.error && (
                            <motion.div
                              layoutId={`active-file-pill-${tool.slug}`}
                              className="pointer-events-none absolute inset-0 rounded-[10px] border border-[#E5542B]/40 bg-[#F7F6F3] dark:bg-[#0E0E0E]"
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            />
                          )}
                          <div className="relative z-10 flex items-center gap-[10px] min-w-0 flex-1">
                            {item.thumbnailUrl && (
                              <img
                                src={item.thumbnailUrl}
                                alt=""
                                className="w-[48px] h-[48px] rounded-[8px] object-cover opacity-100 shrink-0 border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E]"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div
                                className={`truncate min-w-0 ${
                                  idx === activeIndex && !item.error
                                    ? 'font-medium text-[#1A1A1A] dark:text-[#EDEDEA]'
                                    : 'text-[#6B6B66] dark:text-[#9B9B95]'
                                }`}
                                title={item.name}
                              >
                                {item.name}
                              </div>
                              <div className="text-xs font-mono tabular-nums text-[#6B6B66] dark:text-[#9B9B95]">
                                {formatBytes(rowOriginalBytes)}
                                {tool.slug !== 'image-to-pdf' && !item.error && (
                                  <span className="text-[#2F6B4F] dark:text-[#4EA87D]">
                                    {' → '}
                                    {rowJobFresh && typeof rowNewBytes === 'number'
                                      ? formatBytes(rowNewBytes)
                                      : 'Updating...'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10 flex items-center gap-[4px] shrink-0">
                            {tool.slug === 'image-to-pdf' && items.length > 1 && !item.error && (
                              <div className="flex items-center gap-[2px] text-xs text-[#6B6B66]">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(idx, -1);
                                  }}
                                  className="min-h-[48px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] hover:text-[#E5542B] disabled:opacity-30 cursor-pointer"
                                  aria-label="Move up"
                                >
                                  <ArrowUp strokeWidth={1.5} className="w-[15px] h-[15px]" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === items.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(idx, 1);
                                  }}
                                  className="min-h-[48px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] hover:text-[#E5542B] disabled:opacity-30 cursor-pointer"
                                  aria-label="Move down"
                                >
                                  <ArrowDown strokeWidth={1.5} className="w-[15px] h-[15px]" />
                                </button>
                              </div>
                            )}

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(idx);
                                }}
                                className="min-h-[48px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] text-[#6B6B66] hover:text-[#E5542B] cursor-pointer shrink-0"
                                aria-label={`Remove ${item.name}`}
                              >
                                <X strokeWidth={1.5} className="w-[16px] h-[16px]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {item.error && (
                          <ErrorNotice
                            message={item.error}
                            details={item.errorDetails}
                          />
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Right Column: Result stacked vertically (1. Preview, then 2. Result summary card) */}
            <div className="lg:col-span-7 lg:pl-[32px] lg:border-l border-[#E7E5E0] dark:border-[#262624] flex flex-col gap-[20px] w-full max-w-full min-w-0">
              {isUpdatingJob && (
                <div
                  className="text-xs text-[#6B6B66] dark:text-[#9B9B95] min-w-0"
                  role="status"
                  aria-live="polite"
                >
                  Processing...
                </div>
              )}

              {/* 1. Preview Area First (static neutral box, reserved aspect-ratio, zero shimmers/overlays) */}
              <div className="min-h-[260px] sm:min-h-[340px] w-full max-w-full rounded-[10px] bg-[#F7F6F3] dark:bg-[#0E0E0E] flex flex-col items-center justify-center p-[12px] sm:p-[16px] overflow-hidden box-border">
                {tool.slug === 'image-to-pdf' ? (
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-[12px] min-w-0">
                    {items
                      .filter((it) => !it.error)
                      .map((item, idx) => (
                        <div key={item.id} className="flex flex-col items-center min-w-0">
                          {item.thumbnailUrl && (
                            <img
                              src={item.thumbnailUrl}
                              alt={`Page ${idx + 1}`}
                              className="h-[110px] w-full object-contain opacity-100 rounded-[8px] bg-white dark:bg-[#161616] p-[4px]"
                            />
                          )}
                          <span className="mt-[6px] text-xs text-[#6B6B66] dark:text-[#9B9B95]">
                            Page {idx + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : usesComparePreview && activeItem?.previewUrl ? (
                  <div className="w-full flex flex-col items-center gap-[8px] min-w-0">
                    <Compare
                      firstImage={activeItem.previewUrl}
                      secondImage={
                        activeItem.result?.previewUrl ||
                        activeItem.result?.url ||
                        activeItem.previewUrl
                      }
                      aspectRatio={activeAspectRatio}
                      slideMode="drag"
                      firstLabel="Before"
                      secondLabel="After"
                    />
                    <p className="text-[11px] text-[#6B6B66] dark:text-[#9B9B95]">
                      Drag handle or use left/right arrow keys to compare
                    </p>
                  </div>
                ) : activeItem ? (
                  <StablePreviewImage
                    src={
                      activeItem.result?.previewUrl ||
                      activeItem.result?.url ||
                      activeItem.previewUrl
                    }
                    alt={`Preview for ${activeItem.name}`}
                    aspectRatio={
                      activeItem.result && activeItem.result.width > 0 && activeItem.result.height > 0
                        ? activeItem.result.width / activeItem.result.height
                        : activeAspectRatio
                    }
                    className="max-h-[380px] max-w-full object-contain rounded-[8px]"
                  />
                ) : null}
              </div>

              {/* 2. Result Summary Card */}
              {tool.slug === 'image-to-pdf' ? (
                <div className="flex flex-col gap-[16px] pt-[16px] border-t border-[#E7E5E0] dark:border-[#262624] min-w-0">
                  <div className="min-w-0 space-y-[8px]">
                    {isUpdatingJob ? (
                      <p className="text-sm font-mono text-[#6B6B66] dark:text-[#9B9B95]">
                        Updating...
                      </p>
                    ) : pdfResult ? (
                      <>
                        <p className="text-sm text-[#1A1A1A] dark:text-[#EDEDEA] flex flex-wrap items-center gap-[8px] tabular-nums">
                          <span>
                            {items.filter((i) => !i.error).length}{' '}
                            {items.filter((i) => !i.error).length === 1 ? 'page' : 'pages'} →
                          </span>
                          <span className="font-mono font-medium">
                            {formatBytes(pdfResult.newBytes)}
                          </span>
                          <Badge variant="success" className="animate-spring-pop">
                            PDF ready
                          </Badge>
                        </p>
                        <div className="flex flex-wrap items-center gap-[8px] text-xs font-mono text-[#6B6B66] dark:text-[#9B9B95]">
                          <span>
                            PDF · quality {pdfResult.qualityUsed ?? pdfQuality}% ·{' '}
                            {pdfPageSize.toUpperCase()}
                          </span>
                        </div>
                      </>
                    ) : pdfError ? (
                      <ErrorNotice
                        message={pdfError.message}
                        details={pdfError.details}
                      />
                    ) : (
                      <p className="text-sm text-[#6B6B66] dark:text-[#9B9B95]">
                        Processing...
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] min-w-0">
                    {pdfResult && !isUpdatingJob ? (
                      <a
                        href={pdfResult.url}
                        download={pdfResult.filename}
                        onClick={() => handleDownloadToast()}
                        className="btn-press w-full sm:w-auto min-h-[48px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white text-sm font-medium inline-flex items-center justify-center gap-[8px] shrink-0"
                      >
                        <Download strokeWidth={1.5} className="w-[16px] h-[16px]" />
                        <span>Download PDF ({formatBytes(pdfResult.newBytes)})</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => scheduleProcessing(false)}
                        className="btn-press w-full sm:w-auto min-h-[48px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center gap-[8px] cursor-pointer"
                      >
                        <span>{isUpdatingJob ? 'Updating...' : 'Process PDF'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleStartOver}
                      className="btn-press w-full sm:w-auto min-h-[48px] px-[18px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm font-medium text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] hover:border-[#E5542B] inline-flex items-center justify-center gap-[8px] cursor-pointer"
                    >
                      <RotateCcw strokeWidth={1.5} className="w-[14px] h-[14px]" />
                      <span>Start over</span>
                    </button>
                  </div>

                  {pdfResult && renderTryAnotherToolSuggestions()}
                </div>
              ) : (
                activeItem && (
                  <div className="flex flex-col gap-[16px] pt-[16px] border-t border-[#E7E5E0] dark:border-[#262624] min-w-0">
                    {/* 2. Size Line + Applied Settings */}
                    <div className="min-w-0">
                      {activeItem.error ? (
                        <ErrorNotice
                          message={activeItem.error}
                          details={activeItem.errorDetails}
                        />
                      ) : (
                        renderSizeComparisonLine(activeItem)
                      )}
                    </div>

                    {/* 3. Actions (Never disabled by the Shields check) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] min-w-0">
                      {activeItem.result && !isUpdatingJob ? (
                        <a
                          href={activeItem.result.url}
                          download={activeItem.result.filename}
                          onClick={() =>
                            handleDownloadToast(
                              activeItem.result?.originalBytes,
                              activeItem.result?.newBytes
                            )
                          }
                          className="btn-press w-full sm:w-auto min-h-[48px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] hover:bg-[#E5542B] dark:hover:bg-[#E5542B] dark:hover:text-white text-sm font-medium inline-flex items-center justify-center gap-[8px] shrink-0"
                        >
                          <Download strokeWidth={1.5} className="w-[16px] h-[16px]" />
                          <span>Download ({formatBytes(activeItem.result.newBytes)})</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => scheduleProcessing(false)}
                          className="btn-press w-full sm:w-auto min-h-[48px] px-[20px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center gap-[8px] cursor-pointer"
                        >
                          <span>{isUpdatingJob ? 'Updating...' : 'Process photo'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleStartOver}
                        className="btn-press w-full sm:w-auto min-h-[48px] px-[18px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-sm font-medium text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA] hover:border-[#E5542B] inline-flex items-center justify-center gap-[8px] cursor-pointer"
                      >
                        <RotateCcw strokeWidth={1.5} className="w-[14px] h-[14px]" />
                        <span>Start over</span>
                      </button>
                    </div>

                    {activeItem.result && renderTryAnotherToolSuggestions()}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky mobile bottom action bar (< 640px) with Download (primary) and Start over, plus safe-area inset */}
      {items.length > 0 && hasReadyDownload && (
        <div
          style={{
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
          className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3]/95 dark:bg-[#0E0E0E]/95 backdrop-blur-md px-[20px] pt-[12px]"
        >
          <div className="grid grid-cols-3 gap-[8px] items-center">
            {tool.slug === 'image-to-pdf' && pdfResult ? (
              <a
                href={pdfResult.url}
                download={pdfResult.filename}
                onClick={() => handleDownloadToast()}
                className="btn-press col-span-2 min-h-[48px] px-[14px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center gap-[8px] truncate"
              >
                <Download strokeWidth={1.5} className="w-[16px] h-[16px] shrink-0" />
                <span className="truncate">
                  Download PDF ({formatBytes(pdfResult.newBytes)})
                </span>
              </a>
            ) : activeItem?.result ? (
              <a
                href={activeItem.result.url}
                download={activeItem.result.filename}
                onClick={() =>
                  handleDownloadToast(
                    activeItem.result?.originalBytes,
                    activeItem.result?.newBytes
                  )
                }
                className="btn-press col-span-2 min-h-[48px] px-[14px] rounded-[10px] bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] text-sm font-medium inline-flex items-center justify-center gap-[8px] truncate"
              >
                <Download strokeWidth={1.5} className="w-[16px] h-[16px] shrink-0" />
                <span className="truncate">
                  Download ({formatBytes(activeItem.result.newBytes)})
                </span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={handleStartOver}
              className="btn-press col-span-1 min-h-[48px] px-[10px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-xs font-medium text-[#1A1A1A] dark:text-[#EDEDEA] inline-flex items-center justify-center gap-[4px] truncate cursor-pointer"
            >
              <RotateCcw strokeWidth={1.5} className="w-[13px] h-[13px] shrink-0" />
              <span className="truncate">Start over</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ToolWorkspace;
