"use client";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  message?: string;
  className?: string;
};

export function EmptyState({ message = "No data found", className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[10rem] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 p-2 shadow-inner shadow-black/20">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="h-full w-full"
        >
          <rect width="64" height="64" rx="18" fill="#07111f" />
          <path
            d="M18 38.5C18 30.5517 24.4396 24 32.25 24C40.0604 24 46.5 30.5517 46.5 38.5C46.5 40.985 46.0459 43.3638 45.2147 45.55H19.2853C18.4541 43.3638 18 40.985 18 38.5Z"
            fill="#34D399"
          />
          <path
            d="M27 18.5C27 17.1193 28.1193 16 29.5 16H35C36.3807 16 37.5 17.1193 37.5 18.5V23H27V18.5Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />
          <path d="M23 43H41" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="29" r="2.2" fill="#0F172A" />
          <circle cx="32" cy="29" r="2.2" fill="#0F172A" />
          <circle cx="40" cy="29" r="2.2" fill="#0F172A" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-300">{message}</p>
    </div>
  );
}
