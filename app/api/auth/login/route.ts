import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession } from "@/lib/auth";
import { login } from "@/lib/services/auth-service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const user = await login(body.email, body.password);
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.key
    }
  });
}
