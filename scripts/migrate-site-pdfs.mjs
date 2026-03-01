/**
 * Downloads PDFs from kehillanw.org admin and uploads to Sanity.
 * Skips outdated COVID-era and old advert PDFs.
 * Usage: SANITY_API_WRITE_TOKEN=... node scripts/migrate-site-pdfs.mjs
 */

import { createClient } from "@sanity/client";

const SANITY = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const ADMIN = "https://kehillanw.org/admin";

async function login() {
  const res = await fetch(`${ADMIN}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "username=admin&password=admin613&doAction=login&return=&loginkeeping=on",
    redirect: "manual",
  });
  return (res.headers.getSetCookie?.() ?? []).map(c => c.split(";")[0]).join("; ");
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Human-readable name from filename, and keywords to search Sanity
const PDFS = [
  {
    file: "item_358_Ladies-Tisha-BAv-Shiur-TC.pdf",
    title: "Ladies Tisha B'Av Shiur",
    keywords: ["tisha", "ladies", "shiur"],
  },
  {
    file: "item_3318_TFL-A41-Edgware-Way.pdf",
    title: "TFL A41 Edgware Way",
    keywords: ["tfl", "a41", "edgware"],
  },
  {
    file: "item_4301_Radish-UK-Oct-23.pdf",
    title: "Radish Infestation Alert",
    keywords: ["radish"],
  },
  {
    file: "item_4409_BoardingPass-8.pdf",
    title: "BoardingPass Issue 8",
    keywords: ["boarding", "pass"],
  },
  {
    file: "item_4832_2025-march-update.pdf",
    title: "KLBD March 2025 Update",
    keywords: ["march", "2025", "update", "klbd"],
  },
];

async function findNotice(keywords) {
  for (const kw of keywords) {
    const results = await SANITY.fetch(
      `*[_type == "notice" && title match $q][0]{ _id, title, slug }`,
      { q: `*${kw}*` }
    ).catch(() => null);
    if (results) return results;
  }
  return null;
}

async function main() {
  console.log("Logging in to kehillanw.org admin…");
  const cookies = await login();

  let linked = 0, uploaded = 0;

  for (const entry of PDFS) {
    console.log(`\n▶ ${entry.file}`);

    // Download via admin file manager
    process.stdout.write(`  Downloading… `);
    let buf;
    try {
      const r = await fetch(
        `${ADMIN}/tinyfilemanager.php?p=articles&dl=${encodeURIComponent(entry.file)}`,
        { headers: { Cookie: cookies }, signal: AbortSignal.timeout(30000) }
      );
      if (!r.ok) { console.log(`HTTP ${r.status} — skip`); continue; }
      buf = Buffer.from(await r.arrayBuffer());
      process.stdout.write(`${Math.round(buf.length / 1024)}KB  `);
    } catch (e) { console.log(`error: ${e.message}`); continue; }

    // Upload to Sanity
    process.stdout.write(`Uploading… `);
    let asset;
    try {
      asset = await SANITY.assets.upload("file", buf, {
        filename: entry.file,
        contentType: "application/pdf",
      });
      uploaded++;
      process.stdout.write(`✓ ${asset._id}\n`);
    } catch (e) { console.log(`upload failed: ${e.message}`); continue; }

    // Try to link to matching notice
    const notice = await findNotice(entry.keywords);
    if (notice) {
      await SANITY.patch(notice._id).set({
        pdfFile: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
      }).commit();
      console.log(`  → linked to "${notice.title}" (${notice._id})`);
      linked++;
    } else {
      console.log(`  → no matching notice found. Asset ready to assign in Studio: ${asset._id}`);
      console.log(`     Title: "${entry.title}"`);
    }
  }

  // Also handle root-level Haggadah PDF
  console.log(`\n▶ Haggodoh Made Easy.pdf (root)`);
  process.stdout.write(`  Downloading… `);
  try {
    const r = await fetch(
      `${ADMIN}/tinyfilemanager.php?p=&dl=${encodeURIComponent("Haggodoh Made Easy.pdf")}`,
      { headers: { Cookie: cookies }, signal: AbortSignal.timeout(30000) }
    );
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      process.stdout.write(`${Math.round(buf.length / 1024)}KB  `);
      const asset = await SANITY.assets.upload("file", buf, {
        filename: "Haggodoh-Made-Easy.pdf",
        contentType: "application/pdf",
      });
      uploaded++;
      console.log(`✓ ${asset._id}`);
      const notice = await findNotice(["haggadah", "haggodoh", "pesach"]);
      if (notice) {
        await SANITY.patch(notice._id).set({
          pdfFile: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
        }).commit();
        console.log(`  → linked to "${notice.title}"`);
        linked++;
      } else {
        console.log(`  → no matching notice. Asset: ${asset._id}`);
      }
    } else {
      console.log(`HTTP ${r.status} — skip`);
    }
  } catch (e) { console.log(`error: ${e.message}`); }

  console.log(`\n✅ Done: ${uploaded} PDFs uploaded, ${linked} linked to notices.`);
}

main().catch(e => { console.error(e); process.exit(1); });
