"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number | null;
  indeterminate?: boolean;
}

/**
 * Progress built on radix-ui Progress primitive.
 * - 4px tall, vermilion #E5542B fill
 * - Determinate for batch jobs ("Compressing 3 of 6")
 * - Indeterminate sliding bar for single files
 */
export function Progress({
  className,
  value,
  indeterminate = false,
  ...props
}: ProgressProps) {
  const clamped =
    typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={indeterminate ? null : clamped}
      className={cn(
        "relative h-[4px] w-full overflow-hidden bg-[#E7E5E0] dark:bg-[#262624]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 bg-[#E5542B] transition-transform duration-150 ease-out",
          indeterminate && "motion-safe:animate-progress-indeterminate origin-left"
        )}
        style={
          indeterminate
            ? undefined
            : { transform: `translateX(-${100 - clamped}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
}
