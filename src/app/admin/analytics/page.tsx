import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-300" />
            <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            The main charts and admin totals now live on the Overview page, where the data is loaded from the real
            admin summary API.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Open overview
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
