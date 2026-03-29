import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { assignManager } from "@/lib/services/user-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await requireUser();
  const body = await request.json();
  return NextResponse.json(await assignManager(id, body.managerId, user.companyId));
}
