"use client";

import { Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function SiteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(180deg,_#07111f_0%,_#0b1220_60%,_#0f172a_100%)] px-4 text-white">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-300" />
        </div>
        <p className="mt-5 text-lg font-semibold">{APP_NAME}</p>
        <p className="mt-2 text-sm text-slate-400">Loading your dashboard...</p>
        <div className="mt-5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
