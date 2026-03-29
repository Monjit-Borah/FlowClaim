import { ApprovalDecision } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { runManagerDecision } from "@/lib/services/manager-service";

const managerDecisionSchema = z
  .object({
    id: z.string().optional(),
    request_id: z.string().optional(),
    approvalRequestId: z.string().optional(),
    comment: z.string().optional().or(z.literal(""))
  })
  .refine((body) => Boolean(body.approvalRequestId || body.request_id || body.id), {
    message: "Request id is required."
  });

export async function POST(request: Request) {
  try {
    const user = await requireRole(["MANAGER", "ADMIN"]);
    const body = managerDecisionSchema.parse(await request.json());
    const id = body.approvalRequestId ?? body.request_id ?? body.id!;

    return NextResponse.json(
      await runManagerDecision({
        actorId: user.id,
        companyId: user.companyId,
        id,
        decision: ApprovalDecision.APPROVED,
        comment: body.comment || undefined
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not approve manager request.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
