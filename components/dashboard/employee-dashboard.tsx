"use client";

import Link from "next/link";
import { Bell, Bot, CheckCircle2, CircleDashed, Clock3, FileUp, MessageSquareMore, Pencil, RefreshCcw, Send, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExpenseClaim } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const tableColumns = [
  "Employee Name",
  "Description",
  "Date",
  "Category",
  "Paid By",
  "Remarks",
  "Amount",
  "Status"
];

function getStatusTone(status: ExpenseClaim["status"]) {
  if (status === "Approved" || status === "Paid" || status === "In Payment Queue") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Draft" || status === "Ready for Review") return "default";
  return "warning";
}

function getFlowStage(status: ExpenseClaim["status"]) {
  if (status === "Approved" || status === "Paid" || status === "In Payment Queue") return 2;
  if (status === "Submitted" || status.includes("Pending")) return 1;
  return 0;
}

function getRejectionReason(claim: ExpenseClaim) {
  const rejection = [...claim.approvalActions].reverse().find((action) => action.decision === "REJECTED");
  if (rejection?.comment) return rejection.comment;
  if (claim.status === "Rejected") return "Rejected during approval review. Open the claim to update details and resubmit.";
  return "";
}

function getNextApprover(claim: ExpenseClaim) {
  return claim.approvalRequests.find((request) => request.state === "PENDING")?.approverName ?? "No pending approver";
}

function getSummary(claims: ExpenseClaim[]) {
  return claims.reduce(
    (acc, claim) => {
      if (claim.status === "Draft" || claim.status === "Ready for Review") {
        acc.draft += claim.convertedAmount;
      } else if (claim.status === "Approved" || claim.status === "Paid" || claim.status === "In Payment Queue") {
        acc.approved += claim.convertedAmount;
      } else {
        acc.pending += claim.convertedAmount;
      }
      return acc;
    },
    { draft: 0, pending: 0, approved: 0 }
  );
}

function answerClaimQuestion(question: string, claim: ExpenseClaim) {
  const normalized = question.toLowerCase();
  if (normalized.includes("where") || normalized.includes("status")) {
    return `Your claim is currently ${claim.status}. ${
      claim.status.includes("Pending") || claim.status === "Submitted"
        ? `It is waiting with ${getNextApprover(claim)}.`
        : claim.status === "Rejected"
          ? `It was rejected because: ${getRejectionReason(claim)}`
          : "No further action is pending right now."
    }`;
  }

  if (normalized.includes("why") && normalized.includes("reject")) {
    return getRejectionReason(claim) || "This claim has not been rejected. There is no rejection reason to show.";
  }

  if (normalized.includes("who") && normalized.includes("approv")) {
    const approvedBy = [...claim.approvalActions]
      .filter((action) => action.decision === "APPROVED")
      .map((action) => action.actorName);
    return approvedBy.length
      ? `This claim has been approved by ${approvedBy.join(", ")}.`
      : `No approver has completed this claim yet. Next approver: ${getNextApprover(claim)}.`;
  }

  return `I can help with claim status, rejection reasons, and who approved it. Right now, ${claim.vendor} is ${claim.status}.`;
}

export function EmployeeDashboard({
  claims,
  userName
}: {
  claims: ExpenseClaim[];
  userName: string;
}) {
  const [selectedId, setSelectedId] = useState(claims[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask me where your claim is, why it was rejected, or who approved it."
    }
  ]);

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedId) ?? claims[0] ?? null,
    [claims, selectedId]
  );
  const summary = useMemo(() => getSummary(claims), [claims]);

  function sendQuestion() {
    if (!question.trim() || !selectedClaim) return;
    const userText = question.trim();
    const answer = answerClaimQuestion(userText, selectedClaim);
    setMessages((current) => [...current, { role: "user", text: userText }, { role: "assistant", text: answer }]);
    setQuestion("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Employee Dashboard</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Track, submit, and understand every claim</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Upload receipts, draft new expenses, follow approval progress, and review rejection reasons with a clear
              reimbursement workspace.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start rounded-full border border-border/70 bg-white/5 px-4 py-2">
          <Bell className="h-4 w-4 text-muted" />
          <div className="h-8 w-px bg-border/60" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlightSoft/15 text-sm font-semibold text-foreground">
              {userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted">Employee workspace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          {
            label: "Draft Amount",
            value: summary.draft,
            helper: "To submit",
            icon: Pencil,
            tone: "default"
          },
          {
            label: "Pending Approval Amount",
            value: summary.pending,
            helper: "Waiting approval",
            icon: Clock3,
            tone: "warning"
          },
          {
            label: "Approved Amount",
            value: summary.approved,
            helper: "Approved",
            icon: Wallet,
            tone: "success"
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight">
                    {formatCurrency(item.value, selectedClaim?.companyCurrency ?? "USD")}
                  </p>
                  <p className="mt-3 text-sm text-muted">{item.helper}</p>
                </div>
                <div
                  className={cn(
                    "rounded-full p-3",
                    item.tone === "success" && "bg-emerald-500/10 text-emerald-300",
                    item.tone === "warning" && "bg-highlightSoft/15 text-highlight",
                    item.tone === "default" && "bg-white/10 text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/app/employee/claims/new">
          <Button>
            <FileUp className="h-4 w-4" />
            Upload Receipt
          </Button>
        </Link>
        <Link href="/app/employee/claims/new">
          <Button variant="secondary">
            <Pencil className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: "Draft", index: 0 },
            { label: "Waiting Approval", index: 1 },
            { label: "Approved", index: 2 }
          ].map((stage, index, stages) => {
            const active = getFlowStage(selectedClaim?.status ?? "Draft") >= stage.index;
            return (
              <div key={stage.label} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border",
                      active
                        ? "border-highlight bg-highlightSoft/15 text-highlight"
                        : "border-border/70 bg-white/5 text-muted"
                    )}
                  >
                    {active ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted")}>{stage.label}</p>
                    <p className="text-xs text-muted">
                      {stage.index === 0
                        ? "Editable and ready to submit"
                        : stage.index === 1
                          ? "Waiting in the approval workflow"
                          : "Finalized for payout"}
                    </p>
                  </div>
                </div>
                {index < stages.length - 1 ? <div className="hidden h-px w-10 bg-border/70 md:block" /> : null}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="text-xl font-semibold">My expense claims</h2>
            <p className="mt-1 text-sm text-muted">Click a row to inspect the approval timeline and claim detail.</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[1080px]">
              <div className="grid grid-cols-[1fr_1.25fr_110px_110px_110px_1fr_120px_130px] gap-3 border-b border-border/60 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted">
                {tableColumns.map((column) => (
                  <span key={column}>{column}</span>
                ))}
              </div>
              <div className="divide-y divide-border/60">
                {claims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedId(claim.id)}
                    className={cn(
                      "grid w-full grid-cols-[1fr_1.25fr_110px_110px_110px_1fr_120px_130px] gap-3 px-6 py-4 text-left text-sm transition",
                      claim.id === selectedId ? "bg-highlightSoft/10" : "hover:bg-white/5"
                    )}
                  >
                    <span className="font-medium">{claim.employeeName}</span>
                    <span className="text-muted">{claim.description}</span>
                    <span>{new Date(claim.expenseDate).toLocaleDateString()}</span>
                    <span>{claim.category}</span>
                    <span>{claim.employeeName}</span>
                    <span className="truncate text-muted">{claim.notes || claim.similarInsight || "None"}</span>
                    <span className="font-medium">{formatCurrency(claim.amount, claim.currency)}</span>
                    <span>
                      <Badge tone={getStatusTone(claim.status)}>{claim.status}</Badge>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {selectedClaim ? (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Claim detail</p>
                  <h3 className="mt-1 text-2xl font-semibold">{selectedClaim.vendor}</h3>
                  <p className="mt-2 text-sm text-muted">{selectedClaim.description}</p>
                </div>
                <Badge tone={getStatusTone(selectedClaim.status)}>{selectedClaim.status}</Badge>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="surface-alt flex min-h-[220px] items-center justify-center p-5">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-highlightSoft/15 text-highlight">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm text-muted">Receipt preview</p>
                    <p className="mt-2 text-base font-medium">{selectedClaim.receipt?.fileName ?? "No receipt uploaded"}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Amount", `${selectedClaim.currency} ${selectedClaim.amount}`],
                    [
                      "Company Amount",
                      formatCurrency(selectedClaim.convertedAmount, selectedClaim.companyCurrency)
                    ],
                    ["Category", selectedClaim.category],
                    ["Expense Date", new Date(selectedClaim.expenseDate).toLocaleDateString()],
                    ["Paid By", selectedClaim.employeeName],
                    ["Currency", `${selectedClaim.currency} → ${selectedClaim.companyCurrency}`]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[22px] border border-border/60 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                      <p className="mt-1 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm text-muted">
                Amount will be converted using real-time exchange rates. Current approval amount is stored in{" "}
                {selectedClaim.companyCurrency}.
              </p>

              {selectedClaim.status === "Rejected" ? (
                <div className="mt-5 rounded-[24px] border border-red-400/25 bg-red-500/10 p-4">
                  <p className="text-sm font-medium text-red-300">Rejection reason</p>
                  <p className="mt-2 text-sm text-red-100/90">{getRejectionReason(selectedClaim)}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/app/employee/claims/new">
                      <Button variant="secondary">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/app/employee/claims/${selectedClaim.id}`}>
                      <Button>
                        <RefreshCcw className="h-4 w-4" />
                        Resubmit
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Approval timeline</h3>
                  <p className="mt-1 text-sm text-muted">Every step is timestamped so you know exactly where the claim is.</p>
                </div>
                {selectedClaim.status.includes("Pending") || selectedClaim.status === "Submitted" ? (
                  <Badge tone="warning">Next approver: {getNextApprover(selectedClaim)}</Badge>
                ) : null}
              </div>

              <div className="mt-5 space-y-5">
                {selectedClaim.timeline.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlightSoft/15 text-highlight">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      {index < selectedClaim.timeline.length - 1 ? (
                        <div className="mt-2 h-full w-px bg-border/70" />
                      ) : null}
                    </div>
                    <div className="pb-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p className="mt-1 font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-highlightSoft/15 p-2 text-highlight">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Claim assistant</h3>
                  <p className="text-sm text-muted">Ask where the claim is, why it was rejected, or who approved it.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "rounded-[20px] px-4 py-3 text-sm",
                      message.role === "assistant"
                        ? "bg-white/5 text-foreground"
                        : "bg-highlightSoft/15 text-highlight"
                    )}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder='Try: "Where is my claim?"'
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendQuestion();
                    }
                  }}
                />
                <Button onClick={sendQuestion}>
                  <MessageSquareMore className="h-4 w-4" />
                  Ask
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
