"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SubmitClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    await fetch(`/api/expenses/${claimId}/submit`, { method: "POST" });
    router.push(`/app/employee/claims/${claimId}`);
    router.refresh();
  }

  return <Button onClick={onSubmit} disabled={loading}>{loading ? "Submitting..." : "Submit claim"}</Button>;
}
