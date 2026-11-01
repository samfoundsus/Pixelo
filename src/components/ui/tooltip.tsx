"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-[8px] border border-[#E7E5E0] dark:border-[#262624] bg-[#1A1A1A] dark:bg-[#EDEDEA] px-[10px] py-[4px] text-xs text-white dark:text-[#0E0E0E] shadow-xs animate-page-fade",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
