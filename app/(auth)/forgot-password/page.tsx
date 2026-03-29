"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit() {
    setError("");
    setMessage("");
    setResetUrl("");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({ message: "Could not prepare reset link." }));
    if (!response.ok) {
      setError(data.message ?? "Could not prepare reset link.");
      return;
    }

    startTransition(() => {
      setMessage(data.message ?? "Reset instructions are ready.");
      setResetUrl(data.resetUrl ?? "");
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <Card className="w-full p-8">
        <span className="eyebrow">Password recovery</span>
        <h1 className="mt-6 text-3xl font-semibold">Reset access</h1>
        <p className="mt-3 text-sm text-muted">
          Enter a work email and ClaimFlow AI will generate a secure recovery path for that account.
        </p>
        <div className="mt-6 space-y-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Work email" />
          <Button className="w-full" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Preparing reset..." : "Send reset link"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {resetUrl ? (
          <div className="mt-4 rounded-3xl border border-border/60 bg-white/5 p-4 text-sm text-muted">
            <p className="font-medium text-foreground">Local development reset link</p>
            <a className="mt-2 block break-all text-highlight" href={resetUrl}>
              {resetUrl}
            </a>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          <Link href="/login">Return to login</Link>
        </p>
      </Card>
    </div>
  );
}
