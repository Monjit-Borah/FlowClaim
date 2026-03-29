import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { HeroPanel } from "@/components/dashboard/hero-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BrainCircuit,
    title: "Receipt intelligence",
    description: "OCR extraction, confidence scoring, category suggestion, and editable review before submit."
  },
  {
    icon: Workflow,
    title: "Adaptive approval orchestration",
    description: "Sequential, parallel, percentage, CFO override, and hybrid approval logic in one engine."
  },
  {
    icon: ShieldCheck,
    title: "Policy and fraud command",
    description: "Real-time rule enforcement, duplicate detection, anomaly scoring, and audit-grade decisions."
  },
  {
    icon: Building2,
    title: "Enterprise operating view",
    description: "Dashboards, payouts, notifications, people mapping, analytics, and reimbursement lifecycle control."
  }
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6 lg:py-8">
      <header className="surface mb-6 flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm text-muted">Premium reimbursement OS</p>
          <p className="text-xl font-semibold">ClaimFlow AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <HeroPanel />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <SectionHeading
            eyebrow="Why teams switch"
            title="Built for finance leaders who want control without friction."
            description="ClaimFlow AI gives every stakeholder a role-aware control center while keeping the employee journey as simple as scanning and submitting."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[26px] border border-border/70 bg-white/70 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-highlightSoft">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden p-8">
          <SectionHeading
            eyebrow="Product preview"
            title="A calm, executive-grade command center"
            description="Every surface is designed like a premium fintech product: rounded containers, controlled contrast, premium charts, and focused actions."
          />
          <div className="mt-8 grid gap-4">
            {[
              "OCR extraction with editable confidence review",
              "Conditional workflows with percentage approvals",
              "Fraud and policy recommendations in the approval inbox",
              "Finance queue and reimbursement payout completion"
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-[26px] border border-border/70 bg-panel px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm text-white">
                    0{index + 1}
                  </span>
                  <p className="font-medium">{item}</p>
                </div>
                <Sparkles className="h-4 w-4 text-highlight" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Employees",
            body: "Scan receipts, edit OCR outputs, submit polished claims, and track every reimbursement milestone."
          },
          {
            title: "Managers",
            body: "Approve faster with risk summaries, policy context, receipt previews, and escalation actions."
          },
          {
            title: "Admins & Finance",
            body: "Shape workflows, manage roles, watch analytics, audit overrides, and run payout operations."
          }
        ].map((item) => (
          <Card key={item.title} className="p-6">
            <p className="text-sm text-muted">Role-based showcase</p>
            <h3 className="mt-2 text-2xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-muted">{item.body}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card className="flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center">
          <div>
            <span className="eyebrow">Demo-ready enterprise SaaS</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              Launch a fully seeded reimbursement workspace in minutes.
            </h2>
          </div>
          <Link href="/app/admin">
            <Button size="lg">
              Open live product
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      <footer className="py-10 text-center text-sm text-muted">
        ClaimFlow AI · Intelligent reimbursement, approvals, policy, fraud, analytics, and payout orchestration.
      </footer>
    </div>
  );
}
