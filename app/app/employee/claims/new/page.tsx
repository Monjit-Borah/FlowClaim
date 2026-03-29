"use client";

import { useRouter } from "next/navigation";
import { Camera, UploadCloud } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";

export default function CreateExpensePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [form, setForm] = useState({
    amount: "138",
    currency: "USD",
    category: "Meals",
    merchant: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    description: "",
    notes: ""
  });

  const convertedPreview = useMemo(
    () => `${form.currency} ${form.amount || "0"}`,
    [form.amount, form.currency]
  );

  async function createAndUpload(submitAfter = false) {
    setError("");
    const claimResponse = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(form.amount),
        currency: form.currency,
        category: form.category,
        merchant: form.merchant,
        expenseDate: form.expenseDate,
        description: form.description,
        notes: form.notes
      })
    });

    if (!claimResponse.ok) {
      setError("Failed to create claim draft.");
      return;
    }

    const claim = await claimResponse.json();

    if (receipt) {
      const uploadForm = new FormData();
      uploadForm.set("claimId", claim.id);
      uploadForm.set("receipt", receipt);
      const uploadResponse = await fetch("/api/expenses/upload-receipt", {
        method: "POST",
        body: uploadForm
      });
      if (!uploadResponse.ok) {
        setError("Claim saved, but receipt upload failed.");
        return;
      }
    }

    startTransition(() => {
      router.push(
        submitAfter
          ? `/app/employee/claims/review?id=${claim.id}`
          : `/app/employee/claims/${claim.id}`
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="New expense"
        title="Create a claim"
        description="Employee flow with multi-currency entry, merchant context, receipt upload, and OCR review staging."
      />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input value={form.amount} onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))} placeholder="Amount" />
            <Select value={form.currency} onChange={(e) => setForm((current) => ({ ...current, currency: e.target.value }))}>
              <option>USD</option>
              <option>GBP</option>
              <option>EUR</option>
              <option>INR</option>
            </Select>
            <Select value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}>
              <option>Meals</option>
              <option>Travel</option>
              <option>Hotel</option>
              <option>Supplies</option>
            </Select>
            <Input value={form.merchant} onChange={(e) => setForm((current) => ({ ...current, merchant: e.target.value }))} placeholder="Merchant" />
            <Input type="date" value={form.expenseDate} onChange={(e) => setForm((current) => ({ ...current, expenseDate: e.target.value }))} />
            <Input value={convertedPreview} readOnly />
            <Input className="sm:col-span-2" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" />
            <Textarea className="sm:col-span-2" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Notes or justification" />
          </div>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => createAndUpload(true)} disabled={isPending}>
              {isPending ? "Working..." : "Run OCR and continue"}
            </Button>
            <Button variant="secondary" onClick={() => createAndUpload(false)} disabled={isPending}>
              Save draft
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="rounded-[28px] border border-dashed border-border bg-panelAlt p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-highlightSoft">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Drag, drop, or scan a receipt</h3>
            <p className="mt-2 text-sm text-muted">
              Upload an image receipt and ClaimFlow AI will run OCR, extract fields, and populate the review screen.
            </p>
            <div className="mt-6 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted"
              />
              <div className="flex justify-center">
                <Button variant="secondary" type="button">
                  <Camera className="h-4 w-4" />
                  Camera-ready upload
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
