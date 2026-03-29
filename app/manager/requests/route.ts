import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { listManagerRequests } from "@/lib/services/manager-service";

export async function GET() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  return NextResponse.json(await listManagerRequests(user.id, user.companyId));
}
