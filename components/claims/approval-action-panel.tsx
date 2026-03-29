"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function ApprovalActionPanel({
  approvalRequestId
}: {
  approvalRequestId?: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function run(action: "approve" | "reject" | "send-back" | "escalate") {
    if (!approvalRequestId) return;
    setLoadingAction(action);
    await fetch(`/api/approvals/${approvalRequestId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment })
    });
    router.refresh();
    setLoadingAction(null);
  }

  return (
    <div className="rounded-[24px] bg-white/70 p-4">
      <p className="text-sm text-muted">Approval comment</p>
      <Textarea
        className="mt-3"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add context for approval, rejection, or escalation"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run("approve")} disabled={!approvalRequestId || !!loadingAction}>
          {loadingAction === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button variant="secondary" onClick={() => run("send-back")} disabled={!approvalRequestId || !!loadingAction}>
          {loadingAction === "send-back" ? "Sending..." : "Send back"}
        </Button>
        <Button variant="ghost" onClick={() => run("escalate")} disabled={!approvalRequestId || !!loadingAction}>
          {loadingAction === "escalate" ? "Escalating..." : "Escalate"}
        </Button>
        <Button variant="secondary" onClick={() => run("reject")} disabled={!approvalRequestId || !!loadingAction}>
          {loadingAction === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
