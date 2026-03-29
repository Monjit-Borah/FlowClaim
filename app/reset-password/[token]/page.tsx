"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit() {
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token, password })
    });

    const data = await response.json().catch(() => ({ message: "Could not reset password." }));
    if (!response.ok) {
      setError(data.message ?? "Could not reset password.");
      return;
    }

    startTransition(() => {
      setSuccess("Password reset complete. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <Card className="w-full p-8">
        <span className="eyebrow">Secure reset</span>
        <h1 className="mt-6 text-3xl font-semibold">Create a new password</h1>
        <p className="mt-3 text-sm text-muted">
          Set a fresh password to restore access to your reimbursement workspace.
        </p>
        <div className="mt-6 space-y-4">
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            type="password"
          />
          <Input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            type="password"
          />
          <Button className="w-full" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Updating password..." : "Reset password"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
        <p className="mt-4 text-sm text-muted">
          <Link href="/login">Return to login</Link>
        </p>
      </Card>
    </div>
  );
}
