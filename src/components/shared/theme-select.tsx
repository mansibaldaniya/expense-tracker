"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type ThemeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
  align?: "left" | "right";
  compact?: boolean;
};

export function ThemeSelect({
  value,
  onChange,
  options,
  label,
  className,
  align = "left",
  compact = false,
}: ThemeSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => options.find((item) => item.value === value)?.label ?? label ?? "Select", [
    label,
    options,
    value,
  ]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative w-full min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 text-left text-sm text-white outline-none transition-colors hover:border-emerald-400/30 hover:bg-white/8 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20",
          compact ? "h-10 px-3.5" : "h-12 px-4"
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-full z-[80] mt-2 w-full max-w-[calc(100vw-1rem)] max-h-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active ? "bg-emerald-400 text-slate-950" : "text-slate-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{option.label}</span>
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
