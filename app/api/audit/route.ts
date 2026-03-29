import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { listAuditLogs } from "@/lib/services/audit-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await listAuditLogs(user.companyId));
}
