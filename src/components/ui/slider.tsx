"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "../../lib/utils";

export interface SliderProps {
  id?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (value: number[]) => void;
  formatValue?: (val: number) => string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Slider built on @base-ui/react/slider:
 * - Thin 4px track with Vermilion #E5542B Indicator fill
 * - 24px white thumb with a 44px touch area (before:-inset-[10px])
 * - touch-action: pan-y so vertical page scrolling isn't blocked on phones
 * - Value bubble always visible above the thumb while dragging
 */
export function Slider({
  id,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  onValueChange,
  formatValue,
  className,
  ...props
}: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const thumbValues = React.useMemo(() => {
    if (Array.isArray(value) && value.length > 0) return value;
    if (Array.isArray(defaultValue) && defaultValue.length > 0) return defaultValue;
    return [min];
  }, [value, defaultValue, min]);

  return (
    <SliderPrimitive.Root
      id={id}
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
      onBlur={() => setIsDragging(false)}
      onValueChange={(newValue) => {
        if (!onValueChange) return;
        const normalized = Array.isArray(newValue) ? [...newValue] : [Number(newValue)];
        onValueChange(normalized);
      }}
      style={{ touchAction: "pan-y" }}
      className={cn(
        "relative flex w-full min-h-[48px] select-none items-center data-[disabled]:opacity-50",
        orientation === "vertical" && "h-full min-h-[140px] w-auto flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control
        style={{ touchAction: "pan-y" }}
        className="relative flex w-full min-h-[48px] items-center py-[12px] cursor-pointer"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-[#E7E5E0] dark:bg-[#262624]"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="absolute h-full bg-[#E5542B] rounded-full"
          />
        </SliderPrimitive.Track>
        {thumbValues.map((val, index) => (
          <SliderPrimitive.Thumb
            key={index}
            data-slot="slider-thumb"
            style={{ touchAction: "pan-y" }}
            className="group/thumb relative block size-[24px] shrink-0 rounded-full border border-[#D5D2CA] dark:border-[#323230] bg-white dark:bg-[#EDEDEA] shadow-[0_1px_3px_rgba(0,0,0,0.16)] transition-[transform,border-color,box-shadow] duration-150 hover:border-[#E5542B] active:scale-[0.98] focus-visible:border-[#E5542B] focus-visible:ring-3 focus-visible:ring-[#E5542B]/25 focus-visible:outline-none cursor-grab active:cursor-grabbing before:absolute before:-inset-[10px] before:content-['']"
          >
            {/* Floating value label above thumb while dragging */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -top-[34px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[#1A1A1A] dark:bg-[#EDEDEA] px-[7px] py-[2px] font-mono text-[11px] font-medium tabular-nums text-white dark:text-[#0E0E0E] shadow-xs transition-opacity duration-150",
                isDragging
                  ? "opacity-100"
                  : "opacity-0 group-focus-visible/thumb:opacity-100 group-active/thumb:opacity-100"
              )}
            >
              {formatValue ? formatValue(val) : val}
            </span>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
