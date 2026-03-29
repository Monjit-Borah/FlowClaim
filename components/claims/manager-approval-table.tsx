"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExpenseClaim, ManagerApprovalItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type ManagerApprovalApiItem = {
  id: string;
  employee: string;
  amount: number;
  category: string;
  status: string;
  receipt_url: string | null;
  risk_score: number;
  ai_suggestion: string;
  duplicate_flag: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getRiskTone(riskScore: number) {
  if (riskScore >= 70) return "danger";
  if (riskScore >= 50) return "warning";
  return "success";
}

export function ManagerApprovalTable({ approvals }: { approvals: ManagerApprovalItem[] }) {
  const [rows, setRows] = useState(approvals);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [employeeHistory, setEmployeeHistory] = useState<ExpenseClaim[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setRows(approvals);
  }, [approvals]);

  useEffect(() => {
    let active = true;

    async function loadApprovals() {
      const response = await fetch("/manager/requests", { cache: "no-store" });
      if (!response.ok) return;

      const data = (await response.json()) as ManagerApprovalApiItem[];
      const byClaimId = new Map(data.map((item) => [item.id, item]));

      if (!active) return;

      setRows((current) =>
        current.map((row) => {
          const match = byClaimId.get(row.claimId);
          return match
            ? {
                ...row,
                riskScore: match.risk_score,
                aiSuggestion: match.ai_suggestion,
                duplicateFlag: match.duplicate_flag
              }
            : row;
        })
      );
    }

    void loadApprovals();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedClaimId) return;

    let active = true;

    async function loadDetail() {
      setLoadingDetail(true);

      const [claimResponse, claimsResponse] = await Promise.all([
        fetch(`/api/expenses/${selectedClaimId}`, { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" })
      ]);

      if (!claimResponse.ok) {
        if (active) setLoadingDetail(false);
        return;
      }

      const claim = (await claimResponse.json()) as ExpenseClaim;
      const claims = claimsResponse.ok ? ((await claimsResponse.json()) as ExpenseClaim[]) : [];

      if (!active) return;

      setSelectedClaim(claim);
      setEmployeeHistory(
        claims
          .filter((historyClaim) => historyClaim.employeeId === claim.employeeId && historyClaim.id !== claim.id)
          .slice(0, 4)
      );
      setLoadingDetail(false);
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [selectedClaimId]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.claimId === selectedClaimId) ?? null,
    [rows, selectedClaimId]
  );

  function closeModal() {
    setSelectedClaimId(null);
    setSelectedClaim(null);
    setEmployeeHistory([]);
    setLoadingDetail(false);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
          <div>
            <p className="font-medium">Manager action queue</p>
            <p className="text-sm text-muted">Pending approvals assigned directly to you with review signals.</p>
          </div>
          <Badge tone={rows.length ? "warning" : "default"}>{rows.length} pending</Badge>
        </div>
        {rows.length ? (
          <div className="divide-y divide-border/60">
            {rows.map((approval) => (
              <div
                key={approval.approvalRequestId}
                className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between"
                onClick={() => setSelectedClaimId(approval.claimId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedClaimId(approval.claimId);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="grid flex-1 gap-4 md:grid-cols-[1.45fr_1fr_1fr_0.85fr]">
                  <div>
                    <p className="font-medium">{approval.vendor}</p>
                    <p className="text-muted">{approval.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                      Expense date {formatDate(approval.expenseDate)}
                    </p>
                  </div>
                  <div>
                    <p>{approval.employeeName}</p>
                    <p className="text-muted">{approval.department}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{approval.stepName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span title="Risk Score">
                      <Badge tone={getRiskTone(approval.riskScore)}>Risk {approval.riskScore}</Badge>
                    </span>
                    <span title={approval.aiSuggestion ?? "AI suggestion unavailable"}>
                      <Badge tone="default">AI Suggestion</Badge>
                    </span>
                    {approval.duplicateFlag ? (
                      <span title="Potential duplicate receipt">
                        <Badge tone="danger">
                          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                          Duplicate
                        </Badge>
                      </span>
                    ) : null}
                    {approval.fraudCount ? (
                      <span title="Fraud signals detected on this claim">
                        <Badge tone="danger">{approval.fraudCount} fraud flag{approval.fraudCount > 1 ? "s" : ""}</Badge>
                      </span>
                    ) : null}
                    {!approval.hasReceipt ? (
                      <span title="No receipt has been uploaded yet">
                        <Badge tone="danger">Missing receipt</Badge>
                      </span>
                    ) : approval.ocrConfidence != null ? (
                      <span title="Receipt OCR confidence">
                        <Badge tone={approval.ocrConfidence < 0.8 ? "warning" : "default"}>
                          OCR {Math.round(approval.ocrConfidence * 100)}%
                        </Badge>
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium">{formatCurrency(approval.amount, approval.companyCurrency)}</p>
                    <p className="text-muted">{approval.agingDays} day{approval.agingDays === 1 ? "" : "s"} waiting</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Submitted {formatDate(approval.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="warning">{approval.status}</Badge>
                  <Link
                    href={`/app/manager/claims/${approval.claimId}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-muted">No approvals are waiting on you right now.</div>
        )}
      </Card>

      {selectedClaimId ? (
        <div className="fixed inset-0 z-50 bg-black/30 p-4" onClick={closeModal}>
          <div onClick={(event) => event.stopPropagation()}>
            <Card className="mx-auto max-h-[calc(100vh-2rem)] max-w-6xl overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Manager review</p>
                  <h3 className="mt-1 text-xl font-semibold">{selectedClaim?.vendor ?? selectedRow?.vendor ?? "Loading claim"}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {loadingDetail ? (
                <div className="mt-6 text-sm text-muted">Loading review details...</div>
              ) : selectedClaim ? (
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                      <p className="text-sm text-muted">Receipt image</p>
                      {selectedClaim.receipt?.fileUrl ? (
                        <img
                          src={selectedClaim.receipt.fileUrl}
                          alt={selectedClaim.receipt.fileName}
                          className="mt-4 w-full rounded-[24px] border border-border/70"
                        />
                      ) : (
                        <div className="mt-4 rounded-[24px] border border-border/70 bg-panel p-6 text-sm text-muted">No receipt uploaded.</div>
                      )}
                    </div>
                    <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                      <p className="text-sm text-muted">Employee history</p>
                      <div className="mt-4 space-y-3">
                        {employeeHistory.length ? (
                          employeeHistory.map((historyClaim) => (
                            <div key={historyClaim.id} className="rounded-2xl bg-panel px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{historyClaim.vendor}</p>
                                <Badge tone={historyClaim.status.includes("Rejected") ? "danger" : "default"}>{historyClaim.status}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted">{formatDate(historyClaim.expenseDate)}</p>
                              <p className="mt-2 text-sm">{formatCurrency(historyClaim.convertedAmount, historyClaim.companyCurrency)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl bg-panel px-4 py-3 text-sm text-muted">No prior employee history found.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getRiskTone(selectedRow?.riskScore ?? selectedClaim.riskScore)}>
                          Risk {selectedRow?.riskScore ?? selectedClaim.riskScore}
                        </Badge>
                        <span title={selectedRow?.aiSuggestion ?? "AI suggestion unavailable"}>
                          <Badge tone="default">AI Suggestion</Badge>
                        </span>
                        {selectedRow?.duplicateFlag ? (
                          <Badge tone="danger">
                            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                            Duplicate
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-4 text-sm text-muted">{selectedRow?.aiSuggestion ?? "No AI suggestion available yet."}</p>
                    </div>

                    <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                      <p className="text-sm text-muted">OCR vs user data</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          ["Merchant", selectedClaim.receipt?.ocr?.merchant ?? "-", selectedClaim.vendor],
                          ["Date", selectedClaim.receipt?.ocr?.date ?? "-", selectedClaim.expenseDate],
                          [
                            "Amount",
                            selectedClaim.receipt?.ocr ? `${selectedClaim.receipt.ocr.currency} ${selectedClaim.receipt.ocr.amount}` : "-",
                            `${selectedClaim.currency} ${selectedClaim.amount}`
                          ],
                          ["Category", selectedClaim.receipt?.ocr?.suggestedCategory ?? "-", selectedClaim.category]
                        ].map(([label, ocrValue, userValue]) => (
                          <div key={label} className="rounded-2xl bg-panel px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                            <p className="mt-2 text-sm text-muted">OCR: {ocrValue}</p>
                            <p className="mt-1 font-medium">User: {userValue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-muted">Unable to load claim details.</div>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
