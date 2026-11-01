"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b border-[#E7E5E0] dark:border-[#262624] last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-[16px] py-[16px] text-left text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA] transition-colors duration-150 hover:text-[#E5542B] dark:hover:text-[#E5542B] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5542B] [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-[#E5542B]",
          className
        )}
        {...props}
      >
        <span className="min-w-0 break-words">{children}</span>
        <ChevronDown
          strokeWidth={1.5}
          className="h-[18px] w-[18px] shrink-0 text-[#6B6B66] dark:text-[#9B9B95] transition-transform duration-150"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Uses forceMount on AccordionPrimitive.Content and hides closed panels with CSS
 * (`data-[state=closed]:hidden`) so every FAQ answer stays in the static HTML
 * for SEO crawlers and AdSense review even when closed.
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount
      className="overflow-hidden text-[16px] leading-[1.7] text-[#6B6B66] dark:text-[#9B9B95] data-[state=closed]:hidden data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-[16px] pt-[2px]", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
