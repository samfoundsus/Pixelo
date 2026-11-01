"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "motion/react";
import { cn } from "../../lib/utils";

/**
 * Magic UI AnimatedList (fetched from https://magicui.design/r/animated-list.json, MIT License).
 * Respects prefers-reduced-motion.
 */
export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const animations: MotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { scale: 0.96, opacity: 0 },
        animate: { scale: 1, opacity: 1, originY: 0 },
        exit: { scale: 0.96, opacity: 0 },
        transition: { type: "spring", stiffness: 350, damping: 40 },
      };

  return (
    <motion.div {...animations} layout className="mx-auto w-full min-w-0">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 140, ...props }: AnimatedListProps) => {
    const prefersReducedMotion = useReducedMotion();
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children]
    );
    const [index, setIndex] = useState(
      prefersReducedMotion ? Math.max(0, childrenArray.length - 1) : 0
    );

    useEffect(() => {
      if (prefersReducedMotion) {
        setIndex(Math.max(0, childrenArray.length - 1));
        return;
      }
      if (index < childrenArray.length - 1) {
        const timeout = setTimeout(() => {
          setIndex((prevIndex) => prevIndex + 1);
        }, delay);
        return () => clearTimeout(timeout);
      }
    }, [index, delay, childrenArray.length, prefersReducedMotion]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1),
      [index, childrenArray]
    );

    return (
      <div className={cn("flex flex-col gap-[8px] min-w-0", className)} {...props}>
        <AnimatePresence initial={false}>
          {itemsToShow.map((item, idx) => (
            <AnimatedListItem key={(item as React.ReactElement).key ?? idx}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";
