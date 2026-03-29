import { NextResponse } from "next/server";
import { ApprovalDecision } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { applyApprovalAction } from "@/lib/services/approval-service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(
    await applyApprovalAction({
      approvalRequestId: id,
      actorId: user.id,
      decision: ApprovalDecision.ESCALATED,
      comment: body.comment
    })
  );
}
