"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageWindow(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const range: number[] = [];
  for (let current = start; current <= end; current += 1) {
    range.push(current);
  }
  return range;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(page, totalPages);

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-sm text-slate-300">
        Showing {Math.min(total, (page - 1) * pageSize + 1)} to {Math.min(total, page * pageSize)} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        {pages[0] > 1 ? (
          <>
            <Button
              type="button"
              variant={page === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(1)}
              className={cn(
                "min-w-10 rounded-full",
                page === 1 ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "border-white/10 bg-transparent text-white hover:bg-white/10"
              )}
            >
              1
            </Button>
            {pages[0] > 2 ? <span className="px-1 text-slate-500">...</span> : null}
          </>
        ) : null}

        {pages.map((item) => (
          <Button
            key={item}
            type="button"
            variant={page === item ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item)}
            className={cn(
              "min-w-10 rounded-full",
              page === item ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "border-white/10 bg-transparent text-white hover:bg-white/10"
            )}
          >
            {item}
          </Button>
        ))}

        {pages[pages.length - 1] < totalPages ? (
          <>
            {pages[pages.length - 1] < totalPages - 1 ? <span className="px-1 text-slate-500">...</span> : null}
            <Button
              type="button"
              variant={page === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "min-w-10 rounded-full",
                page === totalPages
                  ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  : "border-white/10 bg-transparent text-white hover:bg-white/10"
              )}
            >
              {totalPages}
            </Button>
          </>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
