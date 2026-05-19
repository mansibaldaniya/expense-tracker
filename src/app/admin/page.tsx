import Link from "next/link";

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Users", "1,284"],
          ["Expenses", "84,102"],
          ["Alerts", "12"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Manage users, review analytics, and monitor recent activity from here.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/admin/users" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
            User management
          </Link>
          <Link href="/admin/analytics" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
            Analytics
          </Link>
        </div>
      </div>
    </section>
  );
}
