import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/api-auth";
import { loadGrant } from "@/lib/grants";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const headers = corsHeaders();
  const grant = await loadGrant(token);
  if (!grant) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }
  return NextResponse.json(grant, { headers });
}
