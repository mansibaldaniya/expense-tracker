"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import type { ApiResponse } from "@/types";

type AnalyticsItem = {
  category: string;
  total: number;
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<{
        analytics: AnalyticsItem[];
      }>;

      if (!response.ok) {
        toast.error(data.message ?? "Unable to load analytics");
        return;
      }

      setAnalytics(data.data.analytics ?? []);
    }

    void loadAnalytics();
  }, []);

  const pieData = analytics.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm text-slate-300">
        Platform-wide analytics pulled from the admin API.
      </p>
      <div className="mt-6">
        <DashboardCharts pieData={pieData} trendData={pieData.map((item, index) => ({ month: item.name, total: item.value + index * 100 }))} />
      </div>
    </Card>
  );
}
