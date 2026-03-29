import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(12),
  OCR_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  OCR_API_KEY: process.env.OCR_API_KEY
});
