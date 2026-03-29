"use client";

import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";

export function Topbar() {
  const { toggleMobileNav } = useUIStore();

  return (
    <div className="surface sticky top-6 z-20 flex items-center gap-3 bg-transparent p-3">
      <Button variant="secondary" size="sm" className="lg:hidden" onClick={toggleMobileNav}>
        <Menu className="h-4 w-4" />
      </Button>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input className="pl-11" placeholder="Search claims, receipts, people, audit trails..." />
      </div>
      <div className="hidden items-center gap-3 rounded-full border border-border px-2 py-2 sm:flex">
        <div className="rounded-full border border-highlight px-3 py-1 text-xs font-medium text-highlight">Live system</div>
        <div className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
          Ariana Blake
        </div>
      </div>
    </div>
  );
}
