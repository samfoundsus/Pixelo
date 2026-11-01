"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] animate-page-fade",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-32px)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 gap-[16px] rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[20px] shadow-lg animate-menu-open",
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute right-[12px] top-[12px] min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] text-[#6B6B66] hover:text-[#1A1A1A] dark:text-[#9B9B95] dark:hover:text-[#EDEDEA] cursor-pointer"
          >
            <X strokeWidth={1.5} className="h-[16px] w-[16px]" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-medium text-[#1A1A1A] dark:text-[#EDEDEA]", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-[#6B6B66] dark:text-[#9B9B95]", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
