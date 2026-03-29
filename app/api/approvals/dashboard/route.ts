import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { listApprovalDashboardClaims } from "@/lib/services/approval-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(
    await listApprovalDashboardClaims({
      userId: user.id,
      companyId: user.companyId,
      roleKey: user.role.key
    })
  );
}
