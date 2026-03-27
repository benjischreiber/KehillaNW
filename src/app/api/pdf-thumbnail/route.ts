import { NextRequest } from "next/server";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { client } from "@/sanity/lib/client";
import { noticeBySlug } from "@/lib/queries";
import { Notice } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const notice = await client.fetch<Notice>(noticeBySlug, { slug }).catch(() => null);

  if (!notice?.pdfUrl) {
    return new Response("PDF not found", { status: 404 });
  }

  const pdfResponse = await fetch(notice.pdfUrl);
  if (!pdfResponse.ok) {
    return new Response("Unable to fetch PDF", { status: 502 });
  }

  const pdfData = new Uint8Array(await pdfResponse.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data: pdfData,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.6 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  const renderContext = {
    canvas,
    canvasContext: context,
    viewport,
  };

  await page.render(renderContext as never).promise;

  const png = canvas.toBuffer("image/png");

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
