"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit() {
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: "Login failed" }));
      setError(data.message ?? "Login failed");
      return;
    }

    const data = await response.json();
    startTransition(() => {
      const role = data.user.role;
      router.push(role === "ADMIN" ? "/app/admin" : role === "MANAGER" ? "/app/manager" : "/app/employee");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 lg:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="hidden p-10 lg:block">
          <span className="eyebrow">Welcome back</span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
            Reimbursements that move with operating-grade intelligence.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Sign in to access live approvals, fraud monitoring, policy orchestration, analytics, and payout operations.
          </p>
        </Card>
        <Card className="p-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm text-muted">Login</p>
            <h2 className="text-3xl font-semibold">Access your workspace</h2>
          </div>
          <div className="mt-8 space-y-4">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button className="w-full" onClick={onSubmit} disabled={isPending}>
              {isPending ? "Signing in..." : "Continue to ClaimFlow AI"}
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
