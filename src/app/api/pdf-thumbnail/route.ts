import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const revalidate = 2592000;

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  // Keep old shared URLs working without downloading and rendering PDFs in a function.
  return Response.redirect(
    new URL(`/api/og-notice?slug=${encodeURIComponent(slug)}`, request.url),
    302
  );
}
