import { NextResponse } from "next/server";

import { listCountries } from "@/lib/services/company-service";

export async function GET() {
  return NextResponse.json(await listCountries());
}
