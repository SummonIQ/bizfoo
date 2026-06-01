import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/api-auth";
import { redeemGrant } from "@/lib/grants";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const headers = corsHeaders();
  const result = await redeemGrant(token);
  if (!result.url && result.reason) {
    return NextResponse.json(result, { status: 410, headers });
  }
  return NextResponse.json(result, { headers });
}
