"use client";

import React from "react";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

export interface PixeloToasterProps extends ToasterProps {
  theme?: "light" | "dark";
}

/**
 * Sonner Toaster wrapper without next-themes.
 * Receives theme ("light" | "dark") directly from Pixelo's own theme state.
 * Positioned bottom-center with a 96px bottom offset so it floats above the sticky mobile action bar.
 */
export function Toaster({ theme = "light", ...props }: PixeloToasterProps) {
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      offset="96px"
      mobileOffset={{ bottom: "96px", left: "20px", right: "20px" }}
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-[12px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] font-sans text-sm shadow-sm",
          description: "text-[#6B6B66] dark:text-[#9B9B95] text-xs",
          actionButton:
            "bg-[#1A1A1A] text-white dark:bg-[#EDEDEA] dark:text-[#0E0E0E] rounded-[8px]",
          cancelButton:
            "bg-[#F7F6F3] text-[#6B6B66] dark:bg-[#0E0E0E] dark:text-[#9B9B95] rounded-[8px]",
        },
      }}
      {...props}
    />
  );
}

export { toast };
export default Toaster;
