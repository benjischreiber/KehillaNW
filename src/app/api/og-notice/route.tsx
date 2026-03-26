import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { client } from "@/sanity/lib/client";
import { noticeBySlug } from "@/lib/queries";
import { Notice } from "@/lib/types";
import { decodeHtmlEntities } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const notice = await client.fetch<Notice>(noticeBySlug, { slug }).catch(() => null);

  const title = decodeHtmlEntities(notice?.title || "KehillaNW.org");
  const summary = decodeHtmlEntities(
    notice?.summary || "Notices, events and useful info for the NW London Jewish community."
  );
  const category = notice?.categoryTitle || "KehillaNW.org";
  const hasPdf = !!notice?.pdfUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
          color: "#0f172a",
          fontFamily: "Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at top right, rgba(31,90,165,0.14), transparent 35%), radial-gradient(circle at bottom left, rgba(63,154,34,0.14), transparent 30%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "52px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                padding: 18,
              }}
            >
              <img
                src="https://www.kehillanw.org/favicon.png"
                alt=""
                width="110"
                height="110"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1f5aa5",
                  textTransform: "uppercase",
                  letterSpacing: 1.8,
                }}
              >
                {category}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                KehillaNW.org
              </div>
            </div>
            {hasPdf && (
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: "2px solid #e2e8f0",
                  color: "#1f5aa5",
                  fontSize: 24,
                  fontWeight: 800,
                  padding: "12px 22px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              >
                PDF Attached
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 980,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 62,
                lineHeight: 1.06,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.35,
                color: "#475569",
                maxWidth: 920,
              }}
            >
              {hasPdf ? `${summary} Open the notice to view the attached PDF.` : summary}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#64748b",
            }}
          >
            <div style={{ display: "flex" }}>www.kehillanw.org</div>
            <div style={{ display: "flex", color: "#3f9a22", fontWeight: 700 }}>NW London Community Noticeboard</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
