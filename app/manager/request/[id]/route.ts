import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { getManagerRequestById } from "@/lib/services/manager-service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const { id } = await context.params;
  const request = await getManagerRequestById(user.id, user.companyId, id);

  if (!request) {
    return NextResponse.json({ message: "Manager request not found." }, { status: 404 });
  }

  return NextResponse.json(request);
}
