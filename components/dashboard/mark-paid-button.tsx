"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await fetch("/api/finance/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        payoutReference: `RF-${Date.now()}`
      })
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="secondary" onClick={onClick} disabled={loading}>
      {loading ? "Processing..." : "Mark paid"}
    </Button>
  );
}
