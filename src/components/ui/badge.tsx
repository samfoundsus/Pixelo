import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "accent" | "success" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-[6px] border px-[8px] py-[2px] text-xs font-medium transition-colors tabular-nums shrink-0",
        variant === "default" &&
          "border-transparent bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E]",
        variant === "secondary" &&
          "border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] text-[#6B6B66] dark:text-[#9B9B95]",
        variant === "accent" &&
          "border-transparent bg-[#E5542B]/10 text-[#E5542B]",
        variant === "success" &&
          "border-transparent bg-[#2F6B4F]/10 text-[#2F6B4F] dark:text-[#4EA87D]",
        variant === "outline" &&
          "border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA]",
        className
      )}
      {...props}
    />
  );
}
