import Link from "next/link";
import { Check } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getCompany } from "@/lib/services/company-service";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  "Company basics captured",
  "Base currency auto-mapped from country",
  "Admin seat provisioned",
  "Default workflow template package attached"
];

export default async function OnboardingPage() {
  const user = await requireUser();
  const company = await getCompany(user.companyId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6 lg:py-12">
      <Card className="p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow">Company onboarding</span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight">Your workspace is almost live.</h1>
            <p className="mt-4 text-muted">
              ClaimFlow AI created a live reimbursement workspace for {company?.name}, with base currency set to {company?.baseCurrency}, premium approval flows, and real persistence enabled.
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-[26px] border border-border/70 bg-white/70 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlightSoft">
                  {index + 1 < steps.length ? index + 1 : <Check className="h-4 w-4" />}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app/admin">
            <Button size="lg">Open admin command center</Button>
          </Link>
          <Link href="/app/employee">
            <Button variant="secondary" size="lg">
              Preview employee experience
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
