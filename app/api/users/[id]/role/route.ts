import { NextResponse } from "next/server";
import { updateUserRole } from "@/lib/services/user-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  return NextResponse.json(await updateUserRole(id, body.roleKey));
}
