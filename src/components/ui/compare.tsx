"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
 * Compare component:
 * - Zero shimmer, skeleton, gradient, or dark overlays at any stage
 * - Reserves aspect-ratio box from known width and height before images load
 * - Never remounts while processing; keeps the Before/previous After image visible
 *   until the new After image finishes decoding in memory, then swaps without a blank frame
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
  const [displayedFirstImage, setDisplayedFirstImage] = useState(firstImage);
  const [displayedSecondImage, setDisplayedSecondImage] = useState(
    secondImage || firstImage
  );
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-decode Before image when file changes so it swaps without a blank frame
  useEffect(() => {
    if (!firstImage) {
      setDisplayedFirstImage("");
      return;
    }
    if (!displayedFirstImage) {
      setDisplayedFirstImage(firstImage);
    }
    let cancelled = false;
    const preloader = new Image();
    preloader.decoding = "async";
    preloader.onload = () => {
      if (!cancelled) {
        setDisplayedFirstImage(firstImage);
      }
    };
    preloader.onerror = () => {
      if (!cancelled) {
        setDisplayedFirstImage(firstImage);
      }
    };
    preloader.src = firstImage;
    if (typeof preloader.decode === "function") {
      preloader
        .decode()
        .then(() => {
          if (!cancelled) {
            setDisplayedFirstImage(firstImage);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [firstImage]);

  // Keep Before/previous After image visible until the new After image is decoded, then swap without a blank frame
  useEffect(() => {
    const targetAfter = secondImage || firstImage;
    if (!targetAfter) {
      setDisplayedSecondImage("");
      return;
    }
    if (!displayedSecondImage) {
      setDisplayedSecondImage(targetAfter);
    }
    let cancelled = false;
    const preloader = new Image();
    preloader.decoding = "async";
    preloader.onload = () => {
      if (!cancelled) {
        setDisplayedSecondImage(targetAfter);
      }
    };
    preloader.onerror = () => {
      if (!cancelled) {
        setDisplayedSecondImage(targetAfter);
      }
    };
    preloader.src = targetAfter;
    if (typeof preloader.decode === "function") {
      preloader
        .decode()
        .then(() => {
          if (!cancelled) {
            setDisplayedSecondImage(targetAfter);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [secondImage, firstImage]);

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
        cursor:
          slideMode === "drag"
            ? isDragging
              ? "grabbing"
              : "grab"
            : "col-resize",
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
      className={cn(
        "relative w-full max-w-full max-h-[420px] min-h-[240px] overflow-hidden rounded-[10px] select-none bg-[#F7F6F3] dark:bg-[#0E0E0E]",
        className
      )}
    >
      {/* Corner Labels ("Before" and "After") */}
      <span className="pointer-events-none absolute top-[12px] left-[12px] z-30 rounded-[6px] border border-[#E7E5E0]/80 dark:border-[#262624] bg-white/90 dark:bg-[#161616]/90 px-[8px] py-[2px] text-[11px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
        {firstLabel}
      </span>
      <span className="pointer-events-none absolute top-[12px] right-[12px] z-30 rounded-[6px] border border-[#E7E5E0]/80 dark:border-[#262624] bg-white/90 dark:bg-[#161616]/90 px-[8px] py-[2px] text-[11px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
        {secondLabel}
      </span>

      {/* 1.5px Vermilion Divider Line & 44px Hit Area Focusable Keyboard-Accessible Handle */}
      <div
        className="absolute top-0 bottom-0 z-40 w-[1.5px] -translate-x-1/2 bg-[#E5542B]"
        style={{
          left: `${sliderXPercent}%`,
        }}
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
      </div>

      {/* First Image (Before / Original, clipped by sliderXPercent) */}
      <div className="pointer-events-none relative z-20 h-full w-full overflow-hidden">
        {displayedFirstImage ? (
          <div
            className={cn(
              "absolute inset-0 z-20 h-full w-full shrink-0 select-none overflow-hidden",
              firstImageClassName
            )}
            style={{
              clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
            }}
          >
            <img
              alt={firstLabel}
              src={displayedFirstImage}
              className={cn(
                "absolute inset-0 z-20 h-full w-full shrink-0 object-contain opacity-100 select-none",
                firstImageClassName
              )}
              draggable={false}
            />
          </div>
        ) : null}
      </div>

      {/* Second Image (After / Processed full layer underneath) */}
      {displayedSecondImage ? (
        <img
          className={cn(
            "pointer-events-none absolute inset-0 z-[19] h-full w-full object-contain opacity-100 select-none",
            secondImageClassname
          )}
          alt={secondLabel}
          src={displayedSecondImage}
          draggable={false}
        />
      ) : null}
    </div>
  );
};

export default Compare;
