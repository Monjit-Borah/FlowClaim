import { NextResponse } from "next/server";

import { getClaim } from "@/lib/services/claim-service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const claim = await getClaim(id);
  if (!claim) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(claim);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  return NextResponse.json({ id, ...body, updated: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json({ id, deleted: true });
}
