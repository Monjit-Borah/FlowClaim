"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileCheck2,
  GitBranchPlus,
  HelpCircle,
  LayoutDashboard,
  ReceiptText,
  ShieldAlert,
  Users
} from "lucide-react";

import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Command",
    items: [
      { href: "/app/admin", icon: LayoutDashboard, label: "Admin HQ" },
      { href: "/app/manager", icon: FileCheck2, label: "Manager Hub" },
      { href: "/app/employee", icon: ReceiptText, label: "Employee Home" }
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/app/admin/users", icon: Users, label: "People" },
      { href: "/app/admin/workflows", icon: GitBranchPlus, label: "Workflows" },
      { href: "/app/admin/policies", icon: ShieldAlert, label: "Policy Engine" },
      { href: "/app/admin/payouts", icon: CircleDollarSign, label: "Payouts" }
    ]
  },
  {
    label: "Experience",
    items: [
      { href: "/app/employee/notifications", icon: Bell, label: "Notifications" },
      { href: "/app/admin/settings", icon: Building2, label: "Company Settings" },
      { href: "/app/help", icon: HelpCircle, label: "Support" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface sticky top-6 hidden max-h-[calc(100vh-3rem)] min-h-0 flex-col overflow-hidden bg-transparent p-5 lg:flex">
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pr-2">
        <div className="flex items-center gap-3">
          <div className="rounded-[18px] border border-border p-3 text-foreground">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted">Approval orchestration</p>
            <p className="text-lg tracking-tight">ClaimFlow AI</p>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.label} className="space-y-3">
            <p className="px-3 text-xs uppercase tracking-[0.2em] text-muted">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                      active
                        ? "border-highlight text-highlight"
                        : "border-transparent text-muted hover:border-border hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 shrink-0 rounded-[22px] border border-border/70 bg-transparent p-4">
        <p className="text-sm font-medium text-foreground">Autonomous review agent</p>
        <p className="mt-2 text-sm text-muted">
          4 claims moved straight to payout today with no manual follow-up.
        </p>
      </div>
    </aside>
  );
}
