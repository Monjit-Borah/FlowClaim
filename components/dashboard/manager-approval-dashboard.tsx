"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Clock3, Eye, Receipt, ShieldAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { ExpenseClaim } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

function getStatusTone(status: string) {
  if (status === "Rejected") return "danger";
  if (status === "Approved" || status === "Paid" || status === "In Payment Queue") return "success";
  return "warning";
}

function formatApprovalSubject(claim: ExpenseClaim) {
  return claim.vendor || claim.description || "Expense request";
}

function formatOriginalToConverted(claim: ExpenseClaim) {
  return `${formatCurrency(claim.amount, claim.currency)} → ${formatCurrency(
    claim.convertedAmount,
    claim.companyCurrency
  )}`;
}

function getPendingApprovalRequestId(claim: ExpenseClaim) {
  return claim.approvalRequests.find((request) => request.state === "PENDING")?.id;
}

function getRejectionReason(claim: ExpenseClaim) {
  const rejection = [...claim.approvalActions].reverse().find((action) => action.decision === "REJECTED");
  return rejection?.comment || "Rejected with no comment provided.";
}

function getSummary(claims: ExpenseClaim[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return claims.reduce(
    (acc, claim) => {
      if (claim.status.includes("Pending") || claim.status === "Submitted") acc.pending += 1;

      for (const action of claim.approvalActions) {
        const created = new Date(action.createdAt);
        if (created < startOfToday) continue;
        if (action.decision === "APPROVED") acc.approvedToday += 1;
        if (action.decision === "REJECTED") acc.rejectedToday += 1;
      }

      return acc;
    },
    { pending: 0, approvedToday: 0, rejectedToday: 0 }
  );
}

async function postAction(approvalRequestId: string, action: "approve" | "reject", comment?: string) {
  const response = await fetch(`/api/approvals/${approvalRequestId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Approval update failed." }));
    throw new Error(data.message ?? "Approval update failed.");
  }

  return response.json();
}

export function ManagerApprovalDashboard({
  claims,
  managerName
}: {
  claims: ExpenseClaim[];
  managerName: string;
}) {
  const router = useRouter();
  const [liveClaims, setLiveClaims] = useState(claims);
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id ?? "");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalClaimId, setModalClaimId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLiveClaims(claims);
    setSelectedClaimId((current) => current || claims[0]?.id || "");
  }, [claims]);

  useEffect(() => {
    let active = true;

    async function refreshClaims() {
      try {
        const response = await fetch("/api/approvals/dashboard", {
          method: "GET",
          cache: "no-store"
        });
        if (!response.ok) return;
        const nextClaims = (await response.json()) as ExpenseClaim[];
        if (!active) return;
        setLiveClaims(nextClaims);
        setSelectedClaimId((current) =>
          nextClaims.some((claim) => claim.id === current) ? current : nextClaims[0]?.id ?? ""
        );
      } catch {
        // Keep last successful state.
      }
    }

    refreshClaims();
    const interval = window.setInterval(refreshClaims, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const selectedClaim = useMemo(
    () => liveClaims.find((claim) => claim.id === selectedClaimId) ?? liveClaims[0] ?? null,
    [liveClaims, selectedClaimId]
  );

  const filteredClaims = useMemo(() => {
    if (filter === "ALL") return liveClaims;
    if (filter === "PENDING") return liveClaims.filter((claim) => claim.status.includes("Pending") || claim.status === "Submitted");
    if (filter === "APPROVED") return liveClaims.filter((claim) => claim.status === "Approved" || claim.status === "Paid" || claim.status === "In Payment Queue");
    return liveClaims.filter((claim) => claim.status === "Rejected");
  }, [liveClaims, filter]);

  const summary = useMemo(() => getSummary(liveClaims), [liveClaims]);
  const modalClaim = modalClaimId ? liveClaims.find((claim) => claim.id === modalClaimId) ?? null : null;

  async function approveClaim(claim: ExpenseClaim) {
    const requestId = getPendingApprovalRequestId(claim);
    if (!requestId) return;
    setBusyKey(`approve-${claim.id}`);
    setMessage("");
    try {
      await postAction(requestId, "approve");
      setMessage(`${claim.employeeName}'s claim approved by ${managerName}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not approve claim.");
    } finally {
      setBusyKey(null);
    }
  }

  async function rejectClaim() {
    if (!modalClaim) return;
    const requestId = getPendingApprovalRequestId(modalClaim);
    if (!requestId) return;
    setBusyKey(`reject-${modalClaim.id}`);
    setMessage("");
    try {
      await postAction(requestId, "reject", rejectionReason.trim());
      setMessage(`Claim rejected with comment saved for ${modalClaim.employeeName}.`);
      setModalClaimId(null);
      setRejectionReason("");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reject claim.");
    } finally {
      setBusyKey(null);
    }
  }

  async function bulkApprove() {
    const selectedClaims = filteredClaims.filter((claim) => selectedIds.includes(claim.id));
    const actionable = selectedClaims.filter((claim) => getPendingApprovalRequestId(claim));
    if (!actionable.length) return;

    setBusyKey("bulk-approve");
    setMessage("");
    try {
      await Promise.all(
        actionable.map((claim) => postAction(getPendingApprovalRequestId(claim)!, "approve"))
      );
      setMessage(`${actionable.length} claim${actionable.length > 1 ? "s" : ""} approved.`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk approval failed.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Manager approval dashboard</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Approvals to review</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Review reimbursement claims, compare original and converted values, inspect receipt evidence, and make fast approval decisions with complete timestamp history.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as Filter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                filter === item
                  ? "border-highlight bg-highlightSoft/15 text-highlight"
                  : "border-border/70 text-muted hover:text-foreground"
              )}
            >
              {item === "ALL" ? "All claims" : item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending approvals", value: summary.pending, icon: Clock3 },
          { label: "Approved today", value: summary.approvedToday, icon: CheckCircle2 },
          { label: "Rejected today", value: summary.rejectedToday, icon: ShieldAlert }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight">{item.value}</p>
                </div>
                <div className="rounded-full bg-highlightSoft/15 p-3 text-highlight">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">Approvals to review</h2>
              <p className="mt-1 text-sm text-muted">Select a row to inspect the receipt, timeline, and current approval stage.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={bulkApprove}
                disabled={!selectedIds.length || busyKey === "bulk-approve"}
              >
                <Check className="h-4 w-4" />
                {busyKey === "bulk-approve" ? "Approving..." : "Approve selected"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[42px_1.15fr_1fr_120px_140px_180px_190px] gap-3 border-b border-border/60 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted">
                <span />
                <span>Approval Subject</span>
                <span>Request Owner</span>
                <span>Category</span>
                <span>Request Status</span>
                <span>Total Amount</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-border/60">
                {filteredClaims.map((claim) => {
                  const requestId = getPendingApprovalRequestId(claim);
                  const actionable = Boolean(requestId) && (claim.status.includes("Pending") || claim.status === "Submitted");
                  return (
                    <div
                      key={claim.id}
                      className={cn(
                        "grid grid-cols-[42px_1.15fr_1fr_120px_140px_180px_190px] gap-3 px-6 py-4 text-sm transition",
                        claim.id === selectedClaimId ? "bg-highlightSoft/10" : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(claim.id)}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked ? [...current, claim.id] : current.filter((id) => id !== claim.id)
                            )
                          }
                          className="h-4 w-4 rounded border-border bg-transparent"
                        />
                      </div>
                      <button className="text-left" onClick={() => setSelectedClaimId(claim.id)}>
                        <p className="font-medium">{formatApprovalSubject(claim)}</p>
                        <p className="mt-1 text-xs text-muted">{claim.description}</p>
                      </button>
                      <button className="text-left" onClick={() => setSelectedClaimId(claim.id)}>
                        <p className="font-medium">{claim.employeeName}</p>
                        <p className="mt-1 text-xs text-muted">{claim.department}</p>
                      </button>
                      <button className="text-left" onClick={() => setSelectedClaimId(claim.id)}>
                        {claim.category}
                      </button>
                      <button className="text-left" onClick={() => setSelectedClaimId(claim.id)}>
                        <Badge tone={getStatusTone(claim.status)}>{claim.status}</Badge>
                      </button>
                      <button className="text-left" onClick={() => setSelectedClaimId(claim.id)}>
                        <p className="font-medium">{formatCurrency(claim.convertedAmount, claim.companyCurrency)}</p>
                        <p className="mt-1 text-xs text-muted">{formatOriginalToConverted(claim)}</p>
                      </button>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={() => approveClaim(claim)} disabled={!actionable || busyKey === `approve-${claim.id}`}>
                          {busyKey === `approve-${claim.id}` ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          variant="secondary"
                          className="border-red-400/40 text-red-300 hover:border-red-300 hover:text-red-200"
                          onClick={() => {
                            setModalClaimId(claim.id);
                            setSelectedClaimId(claim.id);
                          }}
                          disabled={!actionable || busyKey === `reject-${claim.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredClaims.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-base font-medium">No live approvals in this view yet</p>
                    <p className="mt-2 text-sm text-muted">
                      As soon as an employee submits a claim into the approval workflow, it will appear here automatically.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <Link href="/app/employee/claims/new">
                        <Button>Create a test claim</Button>
                      </Link>
                      <Link href="/app/employee">
                        <Button variant="secondary">Open employee dashboard</Button>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {message ? <div className="border-t border-border/60 px-6 py-4 text-sm text-emerald-300">{message}</div> : null}
        </Card>

        {selectedClaim ? (
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Claim detail</p>
                <h3 className="mt-1 text-2xl font-semibold">{selectedClaim.employeeName}</h3>
                <p className="mt-2 text-sm text-muted">{selectedClaim.description}</p>
              </div>
              <Badge tone={getStatusTone(selectedClaim.status)}>{selectedClaim.status}</Badge>
            </div>

            <div className="mt-5 space-y-5">
              <div className="rounded-[24px] border border-border/60 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4" />
                  Receipt preview
                </div>
                <div className="mt-4 surface-alt flex min-h-[210px] items-center justify-center p-4">
                  <div className="text-center">
                    <p className="font-medium">{selectedClaim.receipt?.fileName ?? "No receipt uploaded"}</p>
                    <p className="mt-2 text-sm text-muted">{selectedClaim.vendor}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Description", selectedClaim.description],
                  ["Category", selectedClaim.category],
                  ["Expense Date", new Date(selectedClaim.expenseDate).toLocaleDateString()],
                  ["Paid By", selectedClaim.employeeName],
                  ["Remarks", selectedClaim.notes || "None"],
                  ["Amount", formatOriginalToConverted(selectedClaim)]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] border border-border/60 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[22px] border border-border/60 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Approval status</p>
                <p className="mt-2 font-medium">{selectedClaim.status}</p>
                <p className="mt-1 text-sm text-muted">Next approver: {selectedClaim.approvalRequests.find((r) => r.state === "PENDING")?.approverName ?? "No next approver"}</p>
              </div>

              {(selectedClaim.riskScore > 70 || selectedClaim.fraudFlags.length > 0) ? (
                <div className="rounded-[22px] border border-yellow-400/25 bg-yellow-500/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-300" />
                    <div>
                      <p className="font-medium text-yellow-100">Policy / risk check</p>
                      <p className="mt-1 text-sm text-yellow-50/85">
                        {selectedClaim.fraudFlags[0]?.description ?? `Risk score is ${selectedClaim.riskScore}. Review before approving.`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-border/60 bg-white/5 p-4">
                <h4 className="text-lg font-semibold">Approval timeline</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-highlight" />
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-muted">{new Date(selectedClaim.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedClaim.approvalActions.map((action, index) => (
                    <div key={`${action.id}-${index}`} className="flex gap-3">
                      <div className={cn("mt-1 h-3 w-3 rounded-full", action.decision === "REJECTED" ? "bg-red-400" : "bg-emerald-400")} />
                      <div>
                        <p className="font-medium">
                          {action.actorName} {action.decision === "APPROVED" ? "approved" : "rejected"}
                        </p>
                        <p className="text-sm text-muted">{new Date(action.createdAt).toLocaleString()}</p>
                        {action.comment ? <p className="mt-1 text-sm text-muted">{action.comment}</p> : null}
                      </div>
                    </div>
                  ))}
                  {selectedClaim.approvalRequests.filter((request) => request.state === "PENDING").map((request) => (
                    <div key={request.id} className="flex gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full bg-highlight/70" />
                      <div>
                        <p className="font-medium">{request.stepName} pending</p>
                        <p className="text-sm text-muted">{request.approverName} · waiting for review</p>
                      </div>
                    </div>
                  ))}
                  {selectedClaim.approvalRequests.filter((request) => request.state !== "PENDING").length === 0 &&
                  selectedClaim.approvalActions.length === 0 ? (
                    <div className="flex gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full bg-border/70" />
                      <div>
                        <p className="font-medium">Future steps not started</p>
                        <p className="text-sm text-muted">Approval workflow has not begun beyond submission.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => approveClaim(selectedClaim)}
                  disabled={!getPendingApprovalRequestId(selectedClaim) || busyKey === `approve-${selectedClaim.id}`}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  className="border-red-400/40 text-red-300 hover:border-red-300 hover:text-red-200"
                  onClick={() => setModalClaimId(selectedClaim.id)}
                  disabled={!getPendingApprovalRequestId(selectedClaim)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Link href={`/app/manager/claims/${selectedClaim.id}`}>
                  <Button variant="ghost">
                    <Eye className="h-4 w-4" />
                    Open full page
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      {modalClaim ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-2xl font-semibold">Reject claim</h3>
            <p className="mt-2 text-sm text-muted">
              Add a reason for rejecting {modalClaim.employeeName}&apos;s claim. This comment will be stored with your timestamp.
            </p>
            <Textarea
              className="mt-5"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter reason for rejection"
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalClaimId(null)}>
                Cancel
              </Button>
              <Button
                className="border-red-400/40 text-red-300 hover:border-red-300 hover:text-red-200"
                onClick={rejectClaim}
                disabled={!rejectionReason.trim() || busyKey === `reject-${modalClaim.id}`}
              >
                {busyKey === `reject-${modalClaim.id}` ? "Rejecting..." : "Submit rejection"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
