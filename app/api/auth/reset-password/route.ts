import { NextResponse } from "next/server";
import { z } from "zod";

import { createPasswordResetLink, resetPassword } from "@/lib/services/auth-service";

const requestSchema = z.object({
  email: z.string().email()
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const result = await createPasswordResetLink(body.email);

    return NextResponse.json({
      success: true,
      message: "If that account exists, a reset link is ready.",
      resetUrl: result.resetUrl ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not prepare reset link.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = resetSchema.parse(await request.json());
    await resetPassword(body.token, body.password);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset password.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
