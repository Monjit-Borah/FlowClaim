"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Mail, Plus, Save, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RuleOption = {
  id: string;
  name: string;
  email: string;
};

type RuleRow = {
  id: string;
  name: string;
  email: string;
  roleKey: "EMPLOYEE" | "MANAGER";
  managerId: string | null;
  managerName: string | null;
  ruleCategory: string;
  config: {
    category: string;
    managerId: string | null;
    managerFirst: boolean;
    sequential: boolean;
    minimumApprovalPercent: number;
    specialApproverId: string | null;
    approvers: Array<{
      userId: string;
      required: boolean;
    }>;
  };
};

export function ApprovalRulesManager({
  initialRows,
  managers,
  approvers
}: {
  initialRows: RuleRow[];
  managers: RuleOption[];
  approvers: RuleOption[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [activeId, setActiveId] = useState(initialRows[0]?.id ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isSending, startSending] = useTransition();

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeId) ?? rows[0] ?? null,
    [activeId, rows]
  );

  function updateRow(userId: string, updater: (row: RuleRow) => RuleRow) {
    setRows((current) => current.map((row) => (row.id === userId ? updater(row) : row)));
  }

  function upsertApprover(userId: string, approverId: string) {
    updateRow(userId, (row) => {
      const nextApprovers = [...row.config.approvers];
      nextApprovers.push({ userId: approverId, required: false });
      return {
        ...row,
        config: {
          ...row.config,
          approvers: nextApprovers
        }
      };
    });
  }

  async function saveActiveRule() {
    if (!activeRow) return;

    setStatusMessage("");
    const payload = {
      userId: activeRow.id,
      roleKey: activeRow.roleKey,
      managerId: activeRow.config.managerId,
      category: activeRow.config.category,
      managerFirst: activeRow.config.managerFirst,
      sequential: activeRow.config.sequential,
      minimumApprovalPercent: activeRow.config.minimumApprovalPercent,
      specialApproverId: activeRow.config.specialApproverId,
      approvers: activeRow.config.approvers
    };

    const response = await fetch("/api/workflows/user-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({ message: "Could not update approval rule." }));
    if (!response.ok) {
      setStatusMessage(data.message ?? "Could not update approval rule.");
      return;
    }

    startSaving(() => {
      setStatusMessage("Approval rule updated successfully");
      setRows((current) =>
        current.map((row) =>
          row.id === activeRow.id
            ? {
                ...row,
                managerId: activeRow.config.managerId,
                managerName:
                  managers.find((manager) => manager.id === activeRow.config.managerId)?.name ?? row.managerName,
                ruleCategory: activeRow.config.category
              }
            : row
        )
      );
    });
  }

  async function sendPasswordReset(email: string) {
    setSendMessage("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({ message: "Could not issue password reset." }));
    startSending(() => {
      setSendMessage(response.ok ? `Password link prepared for ${email}` : data.message ?? "Could not issue password reset.");
    });
  }

  if (!activeRow) {
    return (
      <Card className="p-8">
        <p className="text-sm text-muted">No employees or managers are available yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <p className="text-sm text-muted">User table</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">Assign managers and open rule editing inline</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[1.2fr_0.85fr_1fr_1.1fr_160px] gap-3 border-b border-border/60 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted">
              <span>User Name</span>
              <span>Role</span>
              <span>Manager</span>
              <span>Email</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-border/60">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid grid-cols-[1.2fr_0.85fr_1fr_1.1fr_160px] gap-3 px-6 py-4 transition",
                    row.id === activeId ? "bg-highlightSoft/10" : "hover:bg-white/5"
                  )}
                >
                  <button className="flex items-center gap-3 text-left" onClick={() => setActiveId(row.id)}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-white/10 text-sm font-semibold text-foreground">
                      {row.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-muted">{row.ruleCategory}</p>
                    </div>
                  </button>

                  <Select
                    value={row.roleKey}
                    onChange={(event) => {
                      updateRow(row.id, (current) => ({ ...current, roleKey: event.target.value as RuleRow["roleKey"] }));
                      setActiveId(row.id);
                    }}
                    className={cn("h-11", row.id === activeId ? "border-highlight/50" : undefined)}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                  </Select>

                  <Select
                    value={row.config.managerId ?? ""}
                    onChange={(event) => {
                      const managerId = event.target.value || null;
                      updateRow(row.id, (current) => ({
                        ...current,
                        managerId,
                        managerName: managers.find((manager) => manager.id === managerId)?.name ?? null,
                        config: {
                          ...current.config,
                          managerId
                        }
                      }));
                      setActiveId(row.id);
                    }}
                    className={cn("h-11", row.id === activeId ? "border-highlight/50" : undefined)}
                  >
                    <option value="">Unassigned</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center text-sm text-muted">{row.email}</div>

                  <Button
                    variant="ghost"
                    className="justify-center"
                    onClick={() => sendPasswordReset(row.email)}
                    disabled={isSending}
                  >
                    <Send className="h-4 w-4" />
                    Send Password
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {sendMessage ? (
            <motion.div
              key={sendMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="border-t border-border/60 px-6 py-4 text-sm text-emerald-300"
            >
              {sendMessage}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRow.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/60 px-6 py-5">
              <p className="text-sm text-muted">Approval Rule for {activeRow.config.category}</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">{activeRow.name}</h3>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Employee name</p>
                  <Input value={activeRow.name} readOnly className="bg-white/5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Expense type or category</p>
                  <Input
                    value={activeRow.config.category}
                    onChange={(event) =>
                      updateRow(activeRow.id, (row) => ({
                        ...row,
                        config: {
                          ...row.config,
                          category: event.target.value
                        }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Manager</p>
                  <Select
                    value={activeRow.config.managerId ?? ""}
                    onChange={(event) => {
                      const managerId = event.target.value || null;
                      updateRow(activeRow.id, (row) => ({
                        ...row,
                        managerId,
                        managerName: managers.find((manager) => manager.id === managerId)?.name ?? null,
                        config: {
                          ...row.config,
                          managerId
                        }
                      }));
                    }}
                  >
                    <option value="">Unassigned</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-sm leading-6 text-muted">
                    By default, the employee&apos;s reporting manager is selected. Admin can override for approval flow.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-border/60 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold">Approvers</h4>
                    <p className="text-sm text-muted">Define the approval order, required logic, and override path.</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const nextOption = approvers.find(
                        (option) => !activeRow.config.approvers.some((approver) => approver.userId === option.id)
                      );
                      if (!nextOption) return;
                      upsertApprover(activeRow.id, nextOption.id);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add approver
                  </Button>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="grid grid-cols-[56px_1fr_140px_48px] gap-3 px-2 text-xs uppercase tracking-[0.18em] text-muted">
                    <span>Index</span>
                    <span>Approver Name</span>
                    <span>Required</span>
                    <span />
                  </div>
                  {activeRow.config.approvers.map((approver, index) => (
                    <div
                      key={`${activeRow.id}-${index}`}
                      className="grid grid-cols-[56px_1fr_140px_48px] items-center gap-3 rounded-[22px] border border-border/60 bg-white/5 px-3 py-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-foreground">
                        {index + 1}
                      </div>
                      <Select
                        value={approver.userId}
                        onChange={(event) =>
                          updateRow(activeRow.id, (row) => ({
                            ...row,
                            config: {
                              ...row.config,
                              approvers: row.config.approvers.map((current, currentIndex) =>
                                currentIndex === index ? { ...current, userId: event.target.value } : current
                              )
                            }
                          }))
                        }
                      >
                        {approvers.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </Select>
                      <label className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={approver.required}
                          onChange={(event) =>
                            updateRow(activeRow.id, (row) => ({
                              ...row,
                              config: {
                                ...row.config,
                                approvers: row.config.approvers.map((current, currentIndex) =>
                                  currentIndex === index ? { ...current, required: event.target.checked } : current
                                )
                              }
                            }))
                          }
                          className="h-4 w-4 rounded border-border bg-transparent"
                        />
                        Required
                      </label>
                      <button
                        className="text-muted transition hover:text-foreground"
                        onClick={() =>
                          updateRow(activeRow.id, (row) => ({
                            ...row,
                            config: {
                              ...row.config,
                              approvers: row.config.approvers.filter((_, currentIndex) => currentIndex !== index)
                            }
                          }))
                        }
                      >
                        <ChevronRight className="h-4 w-4 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-border/60 bg-white/5 p-5">
                <label className="flex items-start gap-3 rounded-[22px] border border-border/60 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={activeRow.config.managerFirst}
                    onChange={(event) =>
                      updateRow(activeRow.id, (row) => ({
                        ...row,
                        config: {
                          ...row.config,
                          managerFirst: event.target.checked
                        }
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-border bg-transparent"
                  />
                  <div>
                    <p className="font-medium">Is manager an approver?</p>
                    <p className="mt-1 text-sm text-muted">
                      If enabled, approval request will go to the assigned manager first.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-[22px] border border-border/60 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={activeRow.config.sequential}
                    onChange={(event) =>
                      updateRow(activeRow.id, (row) => ({
                        ...row,
                        config: {
                          ...row.config,
                          sequential: event.target.checked
                        }
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-border bg-transparent"
                  />
                  <div>
                    <p className="font-medium">Enable Sequential Approval</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      If enabled, requests are processed step-by-step in order. If disabled, all approvers receive
                      the request at the same time.
                    </p>
                  </div>
                </label>

                <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Special approver override</p>
                    <Select
                      value={activeRow.config.specialApproverId ?? ""}
                      onChange={(event) =>
                        updateRow(activeRow.id, (row) => ({
                          ...row,
                          config: {
                            ...row.config,
                            specialApproverId: event.target.value || null
                          }
                        }))
                      }
                    >
                      <option value="">No override approver</option>
                      {approvers.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </Select>
                    <p className="text-sm text-muted">
                      If this approver approves, the request is auto-approved and the remaining steps are skipped.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Minimum approval percentage</p>
                    <div className="flex items-center gap-3 rounded-[22px] border border-border/60 px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={activeRow.config.minimumApprovalPercent}
                        onChange={(event) =>
                          updateRow(activeRow.id, (row) => ({
                            ...row,
                            config: {
                              ...row.config,
                              minimumApprovalPercent: Number(event.target.value || 0)
                            }
                          }))
                        }
                        className="h-auto border-0 bg-transparent px-0 focus:border-0"
                      />
                      <span className="text-sm text-muted">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 px-6 py-5">
              <div className="flex items-center gap-3 text-sm">
                {statusMessage ? (
                  <span className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2", statusMessage.includes("successfully") ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300")}>
                    {statusMessage.includes("successfully") ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    {statusMessage}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted">
                    <ShieldCheck className="h-4 w-4" />
                    Save to persist role, manager, and approval logic together.
                  </span>
                )}
              </div>
              <Button onClick={saveActiveRule} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
