"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
  aspectRatio?: number;
  firstLabel?: string;
  secondLabel?: string;
}

/**
 * Compare component adapted from Aceternity UI Compare:
 * - Keeps slider logic and clip-path inset(0 ${100 - sliderXPercent}% 0 0)
 * - Uses a 1.5px vermilion (#E5542B) divider line and a 44px touch handle hit area
 * - Uses slideMode="drag" with pointer events and touch-action: pan-y so vertical scroll works on phones
 * - Responsive w-full, aspect-ratio from image dimensions, object-contain (never crops photos)
 * - Corner labels "Before" and "After"
 * - Keyboard accessible handle: focusable, ArrowLeft/ArrowRight move by 2% with aria-label and aria-valuenow
 */
export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "drag",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
  aspectRatio,
  firstLabel = "Before",
  secondLabel = "After",
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [secondLoaded, setSecondLoaded] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFirstLoaded(false);
  }, [firstImage]);

  useEffect(() => {
    setSecondLoaded(false);
  }, [secondImage]);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress =
        (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
      const percentage =
        progress <= 1 ? progress * 100 : (2 - progress) * 100;
      setSliderXPercent(percentage);
      autoplayRef.current = setTimeout(animate, 16);
    };
    animate();
  }, [autoplay, autoplayDuration]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const updatePercentFromClientX = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;
    requestAnimationFrame(() => {
      setSliderXPercent(Math.max(0, Math.min(100, percent)));
    });
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      stopAutoplay();
      if (slideMode === "drag") {
        setIsDragging(true);
        updatePercentFromClientX(e.clientX);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }
    },
    [slideMode, stopAutoplay, updatePercentFromClientX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        updatePercentFromClientX(e.clientX);
      }
    },
    [slideMode, isDragging, updatePercentFromClientX]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (slideMode === "drag") {
        setIsDragging(false);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }
    },
    [slideMode]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderXPercent((prev) => Math.max(0, prev - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderXPercent((prev) => Math.min(100, prev + 2));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderXPercent(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderXPercent(100);
    }
  }, []);

  const isLoading = (!firstLoaded && !!firstImage) || (!secondLoaded && !!secondImage);

  return (
    <div
      ref={sliderRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
      style={{
        position: "relative",
        touchAction: "pan-y",
        cursor: slideMode === "drag" ? (isDragging ? "grabbing" : "grab") : "col-resize",
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
      className={cn(
        "relative w-full max-w-full max-h-[420px] min-h-[240px] overflow-hidden rounded-[10px] select-none bg-[#F7F6F3] dark:bg-[#0E0E0E]",
        className
      )}
    >
      {/* Skeleton shimmer while either blob URL is still decoding */}
      {isLoading && (
        <div
          aria-hidden="true"
          className="skeleton-shimmer absolute inset-0 z-30 rounded-[10px]"
        />
      )}

      {/* Corner Labels ("Before" and "After") */}
      <span className="pointer-events-none absolute top-[12px] left-[12px] z-30 rounded-[6px] border border-[#E7E5E0]/80 dark:border-[#262624] bg-white/90 dark:bg-[#161616]/90 px-[8px] py-[2px] text-[11px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
        {firstLabel}
      </span>
      <span className="pointer-events-none absolute top-[12px] right-[12px] z-30 rounded-[6px] border border-[#E7E5E0]/80 dark:border-[#262624] bg-white/90 dark:bg-[#161616]/90 px-[8px] py-[2px] text-[11px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
        {secondLabel}
      </span>

      {/* 1.5px Vermilion Divider Line & 44px Hit Area Focusable Keyboard-Accessible Handle */}
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute top-0 bottom-0 z-40 w-[1.5px] -translate-x-1/2 bg-[#E5542B]"
          style={{
            left: `${sliderXPercent}%`,
          }}
          transition={{ duration: 0 }}
        >
          {showHandlebar && (
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare before and after image"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderXPercent)}
              onKeyDown={handleKeyDown}
              style={{ touchAction: "pan-y" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex h-[44px] w-[44px] items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#E5542B] focus-visible:outline-offset-2"
            >
              <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-transform duration-150 hover:scale-105">
                <MoveHorizontal
                  strokeWidth={1.5}
                  className="h-[15px] w-[15px] text-[#1A1A1A] dark:text-[#EDEDEA]"
                />
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* First Image (Before / Original, clipped by sliderXPercent) */}
      <div className="pointer-events-none relative z-20 h-full w-full overflow-hidden">
        <AnimatePresence initial={false}>
          {firstImage ? (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 h-full w-full shrink-0 select-none overflow-hidden",
                firstImageClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              <img
                alt={firstLabel}
                src={firstImage}
                onLoad={() => setFirstLoaded(true)}
                className={cn(
                  "absolute inset-0 z-20 h-full w-full shrink-0 object-contain select-none",
                  firstImageClassName
                )}
                draggable={false}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Second Image (After / Processed full layer underneath) */}
      <AnimatePresence initial={false}>
        {secondImage ? (
          <motion.img
            className={cn(
              "pointer-events-none absolute inset-0 z-[19] h-full w-full object-contain select-none",
              secondImageClassname
            )}
            alt={secondLabel}
            src={secondImage}
            onLoad={() => setSecondLoaded(true)}
            draggable={false}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Compare;
