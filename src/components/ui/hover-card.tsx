"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-[260px] rounded-[12px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[12px] text-xs text-[#1A1A1A] dark:text-[#EDEDEA] shadow-sm outline-none animate-menu-open",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
