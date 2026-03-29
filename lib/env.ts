import { z } from "zod";

const isDevelopment = process.env.NODE_ENV === "development";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(12)
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? (isDevelopment ? "file:./dev.db" : undefined),
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  SESSION_SECRET: process.env.SESSION_SECRET ?? (isDevelopment ? "dev-session-secret-12345" : undefined)
});
