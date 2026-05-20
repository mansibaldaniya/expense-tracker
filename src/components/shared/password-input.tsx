"use client";

import { useState } from "react";
import type { ComponentProps, ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

type PasswordInputProps = ComponentProps<typeof Input> & {
  icon?: ComponentType<{ className?: string }>;
};

export function PasswordInput({ icon: Icon, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={`h-12 rounded-2xl border-white/10 bg-white/5 ${Icon ? "pl-11" : "pl-4"} pr-12 ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
