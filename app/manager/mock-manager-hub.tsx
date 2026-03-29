"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { approveRequest, getRequests, rejectRequest, type MockManagerRequest, USE_MOCK } from "./mock-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getRiskTone(score: number) {
  if (score >= 0.75) return "danger";
  if (score >= 0.4) return "warning";
  return "success";
}

export function MockManagerHub() {
  const [rows, setRows] = useState<MockManagerRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      try {
        const data = (await getRequests()) as MockManagerRequest[];
        if (active) {
          setRows(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, []);

  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedId) ?? null, [rows, selectedId]);

  async function runAction(action: "approve" | "reject", id: string) {
    setSavingAction(`${action}:${id}`);
    const updated = action === "approve" ? await approveRequest(id) : await rejectRequest(id);
    setRows((current) => current.map((row) => (row.id === id && updated ? { ...row, ...updated } : row)));
    setSavingAction(null);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
          <div>
            <p className="font-medium">Manager action queue</p>
            <p className="text-sm text-muted">
              {USE_MOCK ? "Local mock mode is supplying approval data with no backend dependency." : "Pending approvals assigned directly to you with review signals."}
            </p>
          </div>
          <Badge tone={rows.length ? "warning" : "default"}>{rows.length} pending</Badge>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-sm text-muted">Loading manager requests...</div>
        ) : rows.length ? (
          <div className="divide-y divide-border/60">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between"
                onClick={() => setSelectedId(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(row.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="grid flex-1 gap-4 md:grid-cols-[1.45fr_1fr_1fr_0.85fr]">
                  <div>
                    <p className="font-medium">{row.vendor}</p>
                    <p className="text-muted">{row.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Expense date {formatDate(row.expense_date)}</p>
                  </div>
                  <div>
                    <p>{row.employee}</p>
                    <p className="text-muted">{row.category}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Manager approval</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span title="Risk score">
                      <Badge tone={getRiskTone(row.risk_score)}>Risk {Math.round(row.risk_score * 100)}%</Badge>
                    </span>
                    <span title={row.ai_suggestion}>
                      <Badge tone="default">AI Suggestion</Badge>
                    </span>
                    {row.duplicate_flag ? (
                      <span title="Possible duplicate expense">
                        <Badge tone="danger">
                          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                          Duplicate
                        </Badge>
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium">{formatCurrency(row.amount, "USD")}</p>
                    <p className="text-muted">{row.status}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Submitted {formatDate(row.submitted_at)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={row.status === "Rejected" ? "danger" : row.status === "Approved" ? "success" : "warning"}>{row.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-muted">No approvals are waiting on you right now.</div>
        )}
      </Card>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 bg-black/30 p-4" onClick={() => setSelectedId(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <Card className="mx-auto max-h-[calc(100vh-2rem)] max-w-6xl overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Manager review</p>
                  <h3 className="mt-1 text-xl font-semibold">{selectedRow.vendor}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                    <p className="text-sm text-muted">Receipt image</p>
                    {selectedRow.receipt_url ? (
                      <img src={selectedRow.receipt_url} alt={selectedRow.vendor} className="mt-4 w-full rounded-[24px] border border-border/70" />
                    ) : (
                      <div className="mt-4 rounded-[24px] border border-border/70 bg-panel p-6 text-sm text-muted">No receipt uploaded.</div>
                    )}
                  </div>
                  <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                    <p className="text-sm text-muted">Employee history</p>
                    <div className="mt-4 space-y-3">
                      {selectedRow.history.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-panel px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{item.vendor}</p>
                            <Badge tone={item.status === "Rejected" ? "danger" : "success"}>{item.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted">{formatDate(item.expenseDate)}</p>
                          <p className="mt-2 text-sm">{formatCurrency(item.amount, "USD")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getRiskTone(selectedRow.risk_score)}>Risk {Math.round(selectedRow.risk_score * 100)}%</Badge>
                      <span title={selectedRow.ai_suggestion}>
                        <Badge tone="default">AI Suggestion</Badge>
                      </span>
                      {selectedRow.duplicate_flag ? (
                        <Badge tone="danger">
                          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                          Duplicate
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm text-muted">{selectedRow.ai_suggestion}</p>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                    <p className="text-sm text-muted">OCR vs user data</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Merchant", selectedRow.ocr_data.merchant, selectedRow.user_data.merchant],
                        ["Date", selectedRow.ocr_data.date, selectedRow.user_data.date],
                        ["Amount", selectedRow.ocr_data.amount, selectedRow.user_data.amount],
                        ["Category", selectedRow.ocr_data.category, selectedRow.user_data.category]
                      ].map(([label, ocrValue, userValue]) => (
                        <div key={label} className="rounded-2xl bg-panel px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                          <p className="mt-2 text-sm text-muted">OCR: {ocrValue}</p>
                          <p className="mt-1 font-medium">User: {userValue}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
                    <p className="text-sm text-muted">Manager action</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => void runAction("approve", selectedRow.id)} disabled={!!savingAction || selectedRow.status === "Approved"}>
                        {savingAction === `approve:${selectedRow.id}` ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void runAction("reject", selectedRow.id)}
                        disabled={!!savingAction || selectedRow.status === "Rejected"}
                      >
                        {savingAction === `reject:${selectedRow.id}` ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
