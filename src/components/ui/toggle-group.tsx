"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from "../../lib/utils";

interface ToggleGroupContextValue {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  spacing?: number;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
  spacing: 2,
});

export interface ToggleGroupProps {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  spacing?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
}

/**
 * ToggleGroup built on @base-ui/react/toggle-group & @base-ui/react/toggle.
 * Default spacing is 2; pass spacing={0} for a connected segmented control.
 * Selected item fills near-black (#1A1A1A) in light mode and near-white (#EDEDEA) in dark mode.
 * Full width on mobile, wraps cleanly inside its own container, and every item is at least 48px tall on mobile.
 */
export function ToggleGroup({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  size = "default",
  spacing = 2,
  disabled = false,
  orientation = "horizontal",
  className,
  children,
  ...props
}: ToggleGroupProps) {
  const isMultiple = type === "multiple";

  const normalizedValue = React.useMemo(() => {
    if (value === undefined) return undefined;
    return Array.isArray(value) ? value : value ? [value] : [];
  }, [value]);

  const normalizedDefaultValue = React.useMemo(() => {
    if (defaultValue === undefined) return undefined;
    return Array.isArray(defaultValue)
      ? defaultValue
      : defaultValue
      ? [defaultValue]
      : [];
  }, [defaultValue]);

  return (
    <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        multiple={isMultiple}
        disabled={disabled}
        orientation={orientation}
        value={normalizedValue}
        defaultValue={normalizedDefaultValue}
        onValueChange={(nextGroupValue) => {
          if (!onValueChange) return;
          if (isMultiple) {
            onValueChange(nextGroupValue);
          } else {
            const nextSingle = nextGroupValue[0];
            if (nextSingle !== undefined) {
              onValueChange(nextSingle);
            }
          }
        }}
        style={{ gap: `${spacing * 2}px` } as React.CSSProperties}
        className={cn(
          "flex flex-wrap items-center w-full max-w-full min-w-0 rounded-[10px] border border-[#E7E5E0] dark:border-[#262624] bg-[#F7F6F3] dark:bg-[#0E0E0E] p-[3px]",
          orientation === "vertical" && "flex-col items-stretch",
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive>, "value"> {
  value: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: ToggleGroupItemProps) {
  const ctx = React.useContext(ToggleGroupContext);
  const resolvedSize = size || ctx.size || "default";

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={variant || ctx.variant}
      data-size={resolvedSize}
      value={value}
      className={cn(
        "btn-press flex-1 min-w-[72px] min-h-[48px] sm:min-h-[40px] inline-flex items-center justify-center rounded-[8px] px-[10px] font-medium transition-colors duration-150 select-none cursor-pointer truncate",
        resolvedSize === "sm"
          ? "text-xs"
          : resolvedSize === "lg"
          ? "text-sm"
          : "text-sm",
        "text-[#6B6B66] dark:text-[#9B9B95] hover:text-[#1A1A1A] dark:hover:text-[#EDEDEA]",
        "data-[pressed]:bg-[#1A1A1A] data-[pressed]:text-white dark:data-[pressed]:bg-[#EDEDEA] dark:data-[pressed]:text-[#0E0E0E] data-[pressed]:shadow-2xs",
        "aria-pressed:bg-[#1A1A1A] aria-pressed:text-white dark:aria-pressed:bg-[#EDEDEA] dark:aria-pressed:text-[#0E0E0E]",
        "focus-visible:outline-2 focus-visible:outline-[#E5542B] focus-visible:z-10",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}
