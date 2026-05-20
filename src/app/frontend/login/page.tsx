"use client";

import { useState } from "react";
import type { ComponentProps, ComponentType, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { APP_NAME } from "@/lib/constants";
import { loginSchema } from "@/lib/validations/auth";
import type { ApiResponse } from "@/types";

type FormState = {
  email: string;
  password: string;
};

const initialForm: FormState = {
  email: "",
  password: "",
};

function IconInput({
  icon: Icon,
  ...props
}: ComponentProps<typeof Input> & { icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input {...props} className={`h-12 rounded-2xl border-white/10 bg-white/5 pl-11 ${props.className ?? ""}`} />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the highlighted fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as ApiResponse<{
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
      }>;

      if (!response.ok) {
        toast.error(data.message ?? "Login failed");
        return;
      }

      toast.success(data.message ?? "Login successful");
      const destination =
        data.data.user.role === "admin"
          ? "/admin"
          : searchParams.get("redirect") ?? "/frontend/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Something went wrong while signing you in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <section className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          <UserCheck className="h-4 w-4" />
          Welcome back
        </span>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Sign in to {APP_NAME}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Continue managing expenses, budgets, and AI imports from your secure dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Secure access",
              body: "Protected with httpOnly auth cookies and role-based access.",
              icon: ShieldCheck,
            },
            {
              title: "Fast workflow",
              body: "Jump straight into your dashboard or admin view.",
              icon: Sparkles,
            },
          ].map(({ title, body, icon: Icon }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Icon className="h-5 w-5 text-emerald-300" />
              <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">Login</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use your email and password to access your account.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 sm:block">
            <Lock className="h-5 w-5 text-emerald-300" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
            <IconInput
              icon={Mail}
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <PasswordInput
              icon={Lock}
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            {loading ? "Signing in..." : "Login"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-slate-400">
            Need an account?{" "}
            <Link href="/frontend/register" className="font-medium text-emerald-300 hover:text-emerald-200">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
