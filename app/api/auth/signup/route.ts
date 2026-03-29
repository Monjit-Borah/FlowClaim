import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession } from "@/lib/auth";
import { signup } from "@/lib/services/auth-service";

const schema = z.object({
  companyName: z.string().min(2),
  country: z.string().min(2),
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(6),
  industry: z.string().optional(),
  size: z.string().optional(),
  approvalPreference: z.string().optional()
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const result = await signup(body);
  await createSession(result.admin.id);
  return NextResponse.json(result, { status: 201 });
}
