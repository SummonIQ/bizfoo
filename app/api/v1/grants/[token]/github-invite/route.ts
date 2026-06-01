import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { corsHeaders } from "@/lib/api-auth";
import { redeemGitHubInvite } from "@/lib/grants";

const schema = z.object({
  githubLogin: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, {
      message: "Invalid GitHub username",
    }),
});

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const headers = corsHeaders();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400, headers },
    );
  }
  const result = await redeemGitHubInvite(token, parsed.data.githubLogin);
  if (!result.url && result.reason) {
    return NextResponse.json(result, { status: 410, headers });
  }
  return NextResponse.json(result, { headers });
}
