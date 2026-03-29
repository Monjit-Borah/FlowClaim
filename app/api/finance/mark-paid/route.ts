import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { markPaid } from "@/lib/services/finance-service";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await requireUser();
  return NextResponse.json(
    await markPaid({
      paymentId: body.paymentId,
      processorId: user.id,
      payoutReference: body.payoutReference
    })
  );
}
