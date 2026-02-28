/**
 * Download live external PDFs and upload them to Sanity,
 * then patch the relevant notice documents to reference them.
 * Usage: SANITY_API_WRITE_TOKEN=... node scripts/migrate-pdfs.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Known false positives / irrelevant PDFs to skip
const SKIP = [
  "Splash Pools around London",   // car park plan, unrelated
  "Regent's Park Boating Lake",   // T&Cs, unrelated
  "The Very Hungry Caterpillar Trail Bluewater", // old event
  "YU Torah To Go Pesach 2022",   // outdated
];

async function main() {
  const all = JSON.parse(readFileSync("/tmp/knw_notices.json", "utf8"));
  const withPdf = all.filter(n => n.pdfUrl && !SKIP.includes(n.title));

  for (const notice of withPdf) {
    process.stdout.write(`Checking: ${notice.title}… `);

    // Check if URL is live
    let live = false;
    try {
      const r = await fetch(notice.pdfUrl, { method: "HEAD", signal: AbortSignal.timeout(8000) });
      live = r.status < 400;
    } catch { /* skip */ }

    if (!live) {
      console.log("dead, skipping");
      continue;
    }

    // Download the PDF
    let pdfBuffer;
    try {
      const r = await fetch(notice.pdfUrl, { signal: AbortSignal.timeout(30000) });
      pdfBuffer = Buffer.from(await r.arrayBuffer());
    } catch (e) {
      console.log("download failed:", e.message);
      continue;
    }

    // Upload to Sanity
    let asset;
    try {
      asset = await client.assets.upload("file", pdfBuffer, {
        filename: `${slugify(notice.title)}.pdf`,
        contentType: "application/pdf",
      });
    } catch (e) {
      console.log("upload failed:", e.message);
      continue;
    }

    // Patch the notice document
    const noticeId = `notice-${slugify(notice.title)}`;
    try {
      await client.patch(noticeId).set({
        pdfFile: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
      }).commit();
      console.log(`✓ uploaded & linked (${Math.round(pdfBuffer.length / 1024)}KB)`);
    } catch (e) {
      console.log("patch failed:", e.message);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
