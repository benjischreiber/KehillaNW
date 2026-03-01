import { NextRequest, NextResponse } from "next/server";

const CITY_ID = "645361a5977089201005233e"; // Golders Green/Hendon
const BASE = "https://www.minyanmaven.com/api";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";

  try {
    const [shacharith, mincha, maariv] = await Promise.all([
      fetch(`${BASE}/shacharith?date=${date}&city=${CITY_ID}`).then((r) => r.json()),
      fetch(`${BASE}/mincha?date=${date}&city=${CITY_ID}`).then((r) => r.json()),
      fetch(`${BASE}/maariv?date=${date}&city=${CITY_ID}`).then((r) => r.json()),
    ]);

    return NextResponse.json({ shacharith, mincha, maariv });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
