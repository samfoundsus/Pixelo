"use client";

import React, { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type MotionProps,
  type UseInViewOptions,
  type Variants,
} from "motion/react";

type MarginType = UseInViewOptions["margin"];

export interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
}

const getFilter = (v: Variants[string]) =>
  typeof v === "function" ? undefined : v.filter;

/**
 * BlurFade component from Magic UI specification:
 * - Respects prefers-reduced-motion by rendering children directly with no animation.
 * - Uses inView={true} and once={true} by default when used across sections.
 */
export function BlurFade({
  children,
  className,
  variant,
  duration = 0.34,
  delay = 0,
  offset = 6,
  direction = "up",
  inView = true,
  inViewMargin = "-40px",
  blur = "4px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  };

  const combinedVariants = variant ?? defaultVariants;
  const hiddenFilter = getFilter(combinedVariants.hidden);
  const visibleFilter = getFilter(combinedVariants.visible);
  const shouldTransitionFilter =
    hiddenFilter != null &&
    visibleFilter != null &&
    hiddenFilter !== visibleFilter;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.02 + delay,
          duration,
          ease: "easeOut",
          ...(shouldTransitionFilter ? { filter: { duration } } : {}),
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
