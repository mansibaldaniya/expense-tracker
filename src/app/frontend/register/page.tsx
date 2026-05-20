"use client";

import { useState } from "react";
import type { ComponentProps, ComponentType, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, BadgeCheck, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { APP_NAME } from "@/lib/constants";
import { passwordRequirementsMessage, registerSchema } from "@/lib/validations/auth";
import type { ApiResponse } from "@/types";

type FormState = {
  name: string;
  email: string;
  password: string;
};

const initialForm: FormState = {
  name: "",
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the highlighted fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
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
        toast.error(data.message ?? "Registration failed");
        return;
      }

      toast.success(data.message ?? "Registration successful");
      const destination = data.data.user.role === "admin" ? "/admin" : "/frontend/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Something went wrong while creating your account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <section className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          <Sparkles className="h-4 w-4" />
          Start tracking expenses faster
        </span>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Create your {APP_NAME} account
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Set up a secure workspace for expense tracking, budget control, AI imports, and admin-ready reporting.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Secure login",
              body: "JWT auth with protected routes and httpOnly cookies.",
              icon: ShieldCheck,
            },
            {
              title: "AI ready",
              body: "Import receipts and streamline expense capture.",
              icon: Sparkles,
            },
            {
              title: "Fast setup",
              body: "Create an account in under a minute.",
              icon: BadgeCheck,
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
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Create account</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Enter your details below to create a new expense tracking account.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 sm:block">
            <Lock className="h-5 w-5 text-emerald-300" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
            <IconInput
              icon={User}
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

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
              placeholder="Create a strong password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <p className="mt-3 text-xs leading-5 text-slate-400">{passwordRequirementsMessage}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:grid-cols-2">
            <p>- Secure account setup</p>
            <p>- AI-powered expense tools</p>
            <p>- Budget and analytics access</p>
            <p>- Admin-ready workflows</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/frontend/login" className="font-medium text-emerald-300 hover:text-emerald-200">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
