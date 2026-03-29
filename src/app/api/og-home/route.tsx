import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
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
            width: "100%",
            height: "100%",
            padding: "52px 64px",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 560,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                color: "#d4a514",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              NW London Community
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              KehillaNW.org
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                lineHeight: 1.35,
                color: "#475569",
              }}
            >
              Notices, events and useful info for the NW London Jewish community.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 12,
                fontSize: 24,
                fontWeight: 700,
                color: "#3f9a22",
              }}
            >
              www.kehillanw.org
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 420,
              height: 420,
              borderRadius: 36,
              background: "#ffffff",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
              padding: 28,
            }}
          >
            <img
              src="https://www.kehillanw.org/favicon.png"
              alt=""
              width="364"
              height="364"
              style={{ objectFit: "contain" }}
            />
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
