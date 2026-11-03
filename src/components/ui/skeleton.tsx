import * as React from "react";
import { cn } from "../../lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-[10px] bg-[#EAE8E2] dark:bg-[#1E1E1C]",
        className
      )}
      {...props}
    />
  );
}
