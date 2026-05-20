"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  limit?: number;
  className?: string;
};

export function ExpandableText({ text, limit = 20, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  const canToggle = text.length > limit;
  const displayText = useMemo(() => {
    if (expanded || !canToggle) return text;
    return `${text.slice(0, limit)}...`;
  }, [canToggle, expanded, limit, text]);

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <span className="break-all">{displayText}</span>
      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="text-xs font-medium text-emerald-300 underline-offset-2 hover:underline"
        >
          {expanded ? "Less" : "More"}
        </button>
      ) : null}
    </span>
  );
}
