"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SubmitClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/expenses/${claimId}/submit`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Claim submission failed." }));
        throw new Error(data.message ?? "Claim submission failed.");
      }
      router.push(`/app/employee/claims/${claimId}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Claim submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit claim"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
