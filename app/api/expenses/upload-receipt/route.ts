import { NextResponse } from "next/server";
import { ClaimStatus } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runOcrFromUrl } from "@/lib/ocr";
import { saveUploadedFile } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();
  const file = formData.get("receipt");
  const claimId = String(formData.get("claimId") ?? "");

  if (!(file instanceof File) || !claimId) {
    return NextResponse.json({ message: "Receipt and claimId are required." }, { status: 400 });
  }

  const uploaded = await saveUploadedFile(file);

  const receipt = await prisma.expenseReceipt.create({
    data: {
      claimId,
      fileName: uploaded.fileName,
      fileUrl: uploaded.fileUrl,
      mimeType: uploaded.mimeType,
      size: uploaded.size
    }
  });

  await prisma.expenseClaim.update({
    where: { id: claimId },
    data: { status: ClaimStatus.OCR_PROCESSING }
  });

  const ocr = await runOcrFromUrl(uploaded.fileUrl);

  const extraction = await prisma.oCRExtraction.create({
    data: {
      receiptId: receipt.id,
      merchant: ocr.merchant,
      amount: ocr.amount,
      tax: ocr.tax,
      date: ocr.date ?? undefined,
      currency: ocr.currency,
      suggestedCategory: ocr.suggestedCategory,
      confidence: ocr.confidence,
      lowConfidenceKeys: ocr.lowConfidenceKeys,
      rawText: ocr.rawText,
      lineItems: ocr.lineItems
    }
  });

  await prisma.expenseClaim.update({
    where: { id: claimId },
    data: {
      merchant: ocr.merchant || undefined,
      category: ocr.suggestedCategory || undefined,
      amount: ocr.amount || undefined,
      status: ClaimStatus.READY_FOR_REVIEW
    }
  });

  return NextResponse.json({ receipt, extraction, uploadedBy: user.id });
}
