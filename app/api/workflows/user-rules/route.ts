import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { saveApprovalRuleConfig } from "@/lib/services/approval-rules-service";

const schema = z.object({
  userId: z.string().min(1),
  roleKey: z.enum(["EMPLOYEE", "MANAGER"]),
  managerId: z.string().nullable(),
  category: z.string().min(2),
  managerFirst: z.boolean(),
  sequential: z.boolean(),
  minimumApprovalPercent: z.number().min(1).max(100),
  specialApproverId: z.string().nullable(),
  approvers: z.array(
    z.object({
      userId: z.string().min(1),
      required: z.boolean()
    })
  )
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = schema.parse(await request.json());
    const workflow = await saveApprovalRuleConfig({
      companyId: admin.companyId,
      actorId: admin.id,
      ...body
    });

    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update approval rule.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
