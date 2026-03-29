import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { env } from "@/lib/env";
import { getCurrencyByCountryLive } from "@/lib/countries";
import { SignJWT, jwtVerify } from "jose";

const resetSecret = new TextEncoder().encode(env.SESSION_SECRET);

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { role: true, employeeProfile: true }
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

export async function signup(payload: {
  companyName: string;
  country: string;
  email: string;
  fullName: string;
  password: string;
  industry?: string;
  size?: string;
  approvalPreference?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const adminRole = await prisma.role.upsert({
    where: { key: "ADMIN" },
    update: {},
    create: { key: "ADMIN", name: "Admin" }
  });
  await prisma.role.upsert({
    where: { key: "MANAGER" },
    update: {},
    create: { key: "MANAGER", name: "Manager" }
  });
  await prisma.role.upsert({
    where: { key: "EMPLOYEE" },
    update: {},
    create: { key: "EMPLOYEE", name: "Employee" }
  });

  const baseCurrency = await getCurrencyByCountryLive(payload.country);

  const result = await prisma.company.create({
    data: {
      name: payload.companyName,
      country: payload.country,
      baseCurrency,
      industry: payload.industry,
      size: payload.size,
      approvalPreference: payload.approvalPreference,
      departments: {
        create: [{ name: "Operations" }, { name: "Sales" }, { name: "Finance" }]
      },
      costCenters: {
        create: [
          { name: "Corporate", code: "CORP-001" },
          { name: "Revenue", code: "REV-100" }
        ]
      },
      users: {
        create: {
          name: payload.fullName,
          email: payload.email.toLowerCase(),
          passwordHash: hashPassword(payload.password),
          roleId: adminRole.id,
          employeeProfile: {
            create: {
              title: "Admin",
              country: payload.country
            }
          }
        }
      }
    },
    include: {
      users: {
        include: {
          role: true,
          employeeProfile: true
        }
      }
    }
  });

  return { company: result, admin: result.users[0] };
}

export async function createPasswordResetLink(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return { success: true };
  }

  const token = await new SignJWT({ sub: user.id, purpose: "password-reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(resetSecret);

  return {
    success: true,
    resetUrl: `${env.APP_URL}/reset-password/${token}`
  };
}

export async function resetPassword(token: string, password: string) {
  const verified = await jwtVerify(token, resetSecret);
  if (verified.payload.purpose !== "password-reset" || typeof verified.payload.sub !== "string") {
    throw new Error("Invalid reset token.");
  }

  await prisma.user.update({
    where: { id: verified.payload.sub },
    data: { passwordHash: hashPassword(password) }
  });

  return { success: true };
}
