"use client";

import React, { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { cn } from "../../lib/utils";

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}

/**
 * NumberTicker from Magic UI specification:
 * - Animates from startValue to value (supports counting down when startValue > value or direction="down")
 * - Respects prefers-reduced-motion by showing the final value immediately
 * - Uses tabular-nums and theme neutral/accent colors instead of hardcoded black
 */
export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const initialNumeric =
    direction === "down" && startValue === 0 ? value : startValue;
  const targetNumeric =
    direction === "down" && startValue === 0 ? 0 : value;

  const formatNum = (n: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)));

  const motionValue = useMotionValue(
    prefersReducedMotion ? targetNumeric : initialNumeric
  );
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = formatNum(targetNumeric);
      }
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(targetNumeric);
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [motionValue, isInView, delay, targetNumeric, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNum(latest);
      }
    });
  }, [springValue, decimalPlaces, prefersReducedMotion]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block font-mono tabular-nums text-[#1A1A1A] dark:text-[#EDEDEA]",
        className
      )}
      {...props}
    >
      {formatNum(prefersReducedMotion ? targetNumeric : initialNumeric)}
    </span>
  );
}

export default NumberTicker;
