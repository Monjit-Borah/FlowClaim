"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";

type Country = {
  name: string;
  currencyCode: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState("United States");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    companyName: "",
    industry: "AI Infrastructure",
    size: "201-500",
    approvalPreference: "Hybrid intelligent routing",
    password: ""
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/company/countries")
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch(() => setCountries([]));
  }, []);

  const currency = useMemo(
    () => countries.find((entry) => entry.name === country)?.currencyCode ?? "USD",
    [countries, country]
  );

  async function onSubmit() {
    setError("");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, country })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: "Signup failed" }));
      setError(data.message ?? "Signup failed");
      return;
    }

    startTransition(() => {
      router.push("/onboarding");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 lg:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-8 lg:p-10">
          <span className="eyebrow">Signup</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
            Create your reimbursement control center.
          </h1>
          <p className="mt-4 text-muted">
            Real company creation, base-currency mapping, live admin account provisioning, and workflow-ready onboarding.
          </p>
        </Card>
        <Card className="p-8 lg:p-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} />
            <Input placeholder="Work email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            <Input className="sm:col-span-2" placeholder="Company name" value={form.companyName} onChange={(e) => setForm((current) => ({ ...current, companyName: e.target.value }))} />
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              {(countries.length ? countries : [{ name: "United States", currencyCode: "USD" }]).map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {entry.name}
                </option>
              ))}
            </Select>
            <Input value={currency} readOnly />
            <Select value={form.industry} onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))}>
              <option>AI Infrastructure</option>
              <option>Manufacturing</option>
              <option>Consulting</option>
            </Select>
            <Select value={form.size} onChange={(e) => setForm((current) => ({ ...current, size: e.target.value }))}>
              <option>201-500</option>
              <option>11-50</option>
              <option>501-1,000</option>
            </Select>
            <Select className="sm:col-span-2" value={form.approvalPreference} onChange={(e) => setForm((current) => ({ ...current, approvalPreference: e.target.value }))}>
              <option>Hybrid intelligent routing</option>
              <option>Manager-first</option>
              <option>Finance-first</option>
            </Select>
            <Input className="sm:col-span-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
          </div>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <Button className="mt-6 w-full" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Creating workspace..." : "Create company and continue"}
          </Button>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
