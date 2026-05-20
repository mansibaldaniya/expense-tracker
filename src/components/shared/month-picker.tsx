"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthValue(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return `${monthNames[month - 1]}, ${year}`;
}

function normalizeMonth(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

type MonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  align?: "left" | "right";
  compact?: boolean;
  placeholder?: string;
  allowClear?: boolean;
};

export function MonthPicker({
  value,
  onChange,
  className,
  align = "right",
  compact = false,
  placeholder = "Select month",
  allowClear = false,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [viewYear, setViewYear] = useState(() => {
    const parsed = Number(value.slice(0, 4));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : new Date().getFullYear();
  });

  const currentMonth = useMemo(() => {
    const [year, month] = value.split("-").map(Number);
    return {
      year: Number.isFinite(year) && year > 0 ? year : new Date().getFullYear(),
      monthIndex: Number.isFinite(month) && month > 0 ? month - 1 : new Date().getMonth(),
    };
  }, [value]);

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

  const panelAlign = align === "right" ? "right-0" : "left-0";
  const triggerSize = compact ? "h-10 px-3.5" : "h-12 px-4";

  return (
    <div ref={wrapperRef} className={cn("relative w-full min-w-0", className)}>
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => {
            if (!prev) {
              setViewYear(currentMonth.year);
            }
            return !prev;
          })
        }
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 text-left text-sm text-white shadow-sm transition-colors hover:border-emerald-400/30 hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-emerald-400/20",
          triggerSize
        )}
      >
        <span className="inline-flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{value ? formatMonthValue(value) : placeholder}</span>
        </span>
        <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-full z-[200] mt-2 w-[19rem] max-w-[calc(100vw-1rem)] rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur-xl",
            panelAlign
          )}
        >
          <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <button
              type="button"
              onClick={() => setViewYear((year) => year - 1)}
              className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold tracking-wide text-slate-200">{viewYear}</div>
            <button
              type="button"
              onClick={() => setViewYear((year) => year + 1)}
              className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {monthNames.map((monthName, index) => {
              const active = currentMonth.year === viewYear && currentMonth.monthIndex === index;
              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => {
                    onChange(normalizeMonth(viewYear, index));
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {monthName}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(normalizeMonth(now.getFullYear(), now.getMonth()));
                setOpen(false);
              }}
              className="rounded-lg px-2 py-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              This month
            </button>
            {allowClear ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-lg px-2 py-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
