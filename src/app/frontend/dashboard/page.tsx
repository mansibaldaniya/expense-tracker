import { APP_NAME } from "@/lib/constants";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Progress } from "@/components/ui/progress";

const pieData = [
  { name: "Food", value: 5200 },
  { name: "Bills", value: 3100 },
  { name: "Transport", value: 1800 },
  { name: "Shopping", value: 2400 },
];

const trendData = [
  { month: "Jan", total: 18000 },
  { month: "Feb", total: 21000 },
  { month: "Mar", total: 16500 },
  { month: "Apr", total: 24000 },
  { month: "May", total: 19800 },
  { month: "Jun", total: 25500 },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Spending", "Rs. 24,180"],
          ["Expenses", "128"],
          ["Budget Alerts", "3"],
          ["Top Category", "Food"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">{APP_NAME} analytics</h2>
          <p className="mt-2 text-sm text-slate-300">
            This shell is ready to connect to `/api/dashboard` for live summaries and charts.
          </p>
          <div className="mt-6">
            <DashboardCharts pieData={pieData} trendData={trendData} />
          </div>
        </div>
        <div className="space-y-4">
          {[
            ["Food", 72],
            ["Bills", 91],
            ["Transport", 43],
          ].map(([category, value]) => (
            <div key={category as string} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{category as string}</h3>
                <span className="text-sm text-slate-300">{value as number}%</span>
              </div>
              <div className="mt-4">
                <Progress value={value as number} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
