import { NextResponse } from "next/server";

import { getCurrencyConfig } from "@/lib/services/company-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") ?? "United States";
  return NextResponse.json(await getCurrencyConfig(country));
}
