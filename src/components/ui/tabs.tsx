"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex min-h-[48px] sm:min-h-[40px] items-center justify-center rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] p-[3px] text-[#6B6B66] dark:text-[#9B9B95]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "btn-press inline-flex min-h-[42px] sm:min-h-[34px] items-center justify-center whitespace-nowrap rounded-[8px] px-[12px] text-xs sm:text-sm font-medium transition-colors cursor-pointer data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white dark:data-[state=active]:bg-[#EDEDEA] dark:data-[state=active]:text-[#0E0E0E]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-[12px] outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
