"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";
import type { ApiResponse } from "@/types";

function fieldClasses() {
  return "h-12 rounded-2xl";
}

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const passwordMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);

  async function savePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields");
      return;
    }

    if (passwordMismatch) {
      toast.error("New password and confirm password must match");
      return;
    }

    setSavingPassword(true);
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    setSavingPassword(false);

    if (!response.ok) {
      toast.error(data.message ?? "Unable to update password");
      return;
    }

    toast.success("Password updated");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Settings</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Security settings</h1>
            <p className="mt-2 text-sm text-slate-300">Update your account password by confirming your current password and new password.</p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 sm:block">
            <LockKeyhole className="h-6 w-6 text-emerald-300" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <LockKeyhole className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Change password</h2>
              <p className="text-sm text-slate-300">Only password changes are available in settings.</p>
            </div>
          </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Current password</label>
            <PasswordInput
              icon={LockKeyhole}
              className={fieldClasses()}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">New password</label>
            <PasswordInput
              icon={LockKeyhole}
              className={fieldClasses()}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
            <PasswordInput
              icon={LockKeyhole}
              className={fieldClasses()}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
            />
            {passwordMismatch ? (
              <p className="mt-2 text-xs text-red-300">Confirm password must match the new password.</p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => void savePassword()}
            disabled={savingPassword || passwordMismatch}
            className="h-12 rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </Button>

          <p className="text-xs text-slate-400">
            Your password must include uppercase, number, and special character.
          </p>
        </div>
      </Card>
    </section>
  );
}
