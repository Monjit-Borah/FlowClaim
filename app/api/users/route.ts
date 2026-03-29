import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole, requireUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/services/audit-service";
import { createUser, listUsers } from "@/lib/services/user-service";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  roleKey: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  departmentId: z.string().optional().or(z.literal("")),
  costCenterId: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  managerId: z.string().optional().or(z.literal(""))
});

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await listUsers(user.companyId));
}

export async function POST(request: Request) {
  try {
    const actor = await requireRole(["ADMIN"]);
    const body = createUserSchema.parse(await request.json());
    const user = await createUser({
      companyId: actor.companyId,
      name: body.name,
      email: body.email,
      password: body.password,
      roleKey: body.roleKey,
      departmentId: body.departmentId || undefined,
      costCenterId: body.costCenterId || undefined,
      title: body.title || undefined,
      country: body.country || undefined,
      managerId: body.managerId || undefined
    });

    await createAuditLog({
      companyId: actor.companyId,
      actorId: actor.id,
      action: "USER_CREATED",
      target: user.id,
      detail: `${actor.name} created ${user.email} as ${user.role.key}`
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create user.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
