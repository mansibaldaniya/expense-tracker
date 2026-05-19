"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "rounded-xl border border-white/10 bg-slate-950 text-white shadow-2xl",
      }}
    />
  );
}
