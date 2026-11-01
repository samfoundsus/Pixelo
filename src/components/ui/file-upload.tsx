"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Upload, Camera } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";
import { ShineBorder } from "./shine-border";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 16,
    y: -16,
    opacity: 0.95,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export interface FileUploadProps {
  onChange?: (files: File[]) => Promise<void> | void;
  onTakePhotoClick?: () => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

/**
 * FileUpload drop zone component built from the Aceternity File Upload specification,
 * adapted to Pixelo's design tokens and synchronous Android File handle intake:
 * - Calls onChange(files) immediately and synchronously in the same event before any state update
 * - Resets input.value = '' only AFTER capture finishes
 * - On touch devices, changes text to "Tap to choose photos", hides "drag" wording, makes the whole zone the tap target, and shows "Take a photo" as a second full-width secondary button (min-h-48px)
 */
export const FileUpload = ({
  onChange,
  onTakePhotoClick,
  multiple = true,
  maxFiles = 10,
  className,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse =
      (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    setIsTouchDevice(Boolean(coarse));
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * CRITICAL: Inside the input change handler, copy Array.from(input.files) synchronously
   * and invoke onChange(files) immediately before any state update. Reset input.value = ''
   * ONLY in finally after capture completes.
   */
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const captured = inputEl.files ? Array.from(inputEl.files) : [];
    if (captured.length === 0) return;
    try {
      if (onChange) {
        await onChange(captured);
      }
    } finally {
      inputEl.value = "";
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    maxFiles,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles: File[]) => {
      const captured = Array.from(acceptedFiles || []);
      if (captured.length > 0 && onChange) {
        void onChange(captured);
      }
    },
  });

  return (
    <div className={cn("w-full max-w-full min-w-0", className)} {...getRootProps()}>
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={isTouchDevice ? "Tap to choose photos" : "Drop images here or tap to choose"}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        whileHover={prefersReducedMotion ? undefined : "animate"}
        className="group/file relative block w-full max-w-full cursor-pointer overflow-hidden rounded-[14px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] p-[28px] sm:p-[48px] text-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E5542B]"
      >
        <ShineBorder
          shineColor="#E5542B"
          borderWidth={1.5}
          duration={12}
        />

        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          aria-label="Choose photos"
        />

        {/* Lightweight CSS dot-grid background with radial gradient mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_78%)]"
        >
          <GridPattern />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center min-w-0">
          <p className="font-sans text-[17px] font-medium text-[#1A1A1A] dark:text-[#EDEDEA]">
            {isTouchDevice ? (
              "Tap to choose photos"
            ) : (
              <>
                <span className="sm:hidden">Tap to choose photos</span>
                <span className="hidden sm:inline">Drop images here or tap to choose</span>
              </>
            )}
          </p>
          <p className="mt-[6px] font-sans text-xs text-[#6B6B66] dark:text-[#9B9B95]">
            Processed on your device. Nothing is uploaded.
          </p>

          <div className="relative mx-auto mt-[24px] w-full max-w-[8rem]">
            <motion.div
              layoutId={prefersReducedMotion ? undefined : "file-upload"}
              variants={prefersReducedMotion ? undefined : mainVariant}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 22,
              }}
              className={cn(
                "relative z-40 mx-auto flex h-[104px] w-full max-w-[8rem] items-center justify-center rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] transition-shadow duration-150 group-hover/file:border-[#E5542B]/50",
                "shadow-[0px_8px_30px_rgba(26,26,26,0.06)] dark:shadow-[0px_8px_30px_rgba(0,0,0,0.35)]"
              )}
            >
              {isDragActive && !isTouchDevice ? (
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-[6px] text-xs font-medium text-[#E5542B]"
                >
                  <span>Choose</span>
                  <Upload
                    strokeWidth={1.5}
                    className="h-[18px] w-[18px] text-[#E5542B]"
                  />
                </motion.p>
              ) : (
                <Upload
                  strokeWidth={1.5}
                  className="h-[20px] w-[20px] text-[#1A1A1A] dark:text-[#EDEDEA] group-hover/file:text-[#E5542B] transition-colors duration-150"
                />
              )}
            </motion.div>

            <motion.div
              variants={prefersReducedMotion ? undefined : secondaryVariant}
              className="pointer-events-none absolute inset-0 z-30 mx-auto flex h-[104px] w-full max-w-[8rem] items-center justify-center rounded-[10px] border border-dashed border-[#E5542B] bg-transparent opacity-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Secondary action buttons below the drop zone: full-width 48px buttons on mobile, compact links on desktop */}
      <div className="mt-[12px] flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-[10px] sm:gap-[20px] text-sm text-[#6B6B66] dark:text-[#9B9B95]">
        <button
          type="button"
          onClick={handleClick}
          className="btn-press min-h-[48px] w-full sm:w-auto px-[16px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] font-medium inline-flex items-center justify-center gap-[8px] hover:border-[#E5542B] cursor-pointer"
        >
          <Upload strokeWidth={1.5} className="w-[15px] h-[15px]" />
          <span>Choose photos</span>
        </button>
        {onTakePhotoClick && (
          <button
            type="button"
            onClick={onTakePhotoClick}
            className="btn-press min-h-[48px] w-full sm:w-auto px-[16px] rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA] font-medium inline-flex items-center justify-center gap-[8px] hover:border-[#E5542B] cursor-pointer"
          >
            <Camera strokeWidth={1.5} className="w-[15px] h-[15px]" />
            <span>Take a photo</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Lightweight CSS dot-grid replacement for the 451-div GridPattern.
 * Keeps the exported name `GridPattern` as required by the specification.
 */
export function GridPattern() {
  return <div className="h-full w-full bg-dot-grid opacity-75" />;
}
