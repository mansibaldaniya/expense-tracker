"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/types";

export type BudgetCategoryOption = {
  label: string;
  value: string;
};

export function useBudgetCategories() {
  const [options, setOptions] = useState<BudgetCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        const response = await fetch("/api/budget-categories", { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<{ categories: Array<{ name: string }> }>;

        if (!response.ok) {
          if (active) {
            setOptions([]);
            setLoading(false);
          }
          return;
        }

        if (active) {
          setOptions(payload.data.categories.map((item) => ({ label: item.name, value: item.name })));
          setLoading(false);
        }
      } catch {
        if (active) {
          setOptions([]);
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return { options, loading };
}
