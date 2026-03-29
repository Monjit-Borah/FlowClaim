import { NextResponse } from "next/server";
import { finalizeClaimSubmission } from "@/lib/services/claim-service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json(await finalizeClaimSubmission(id));
}
