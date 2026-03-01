/**
 * Re-fetch each article page from kehillanw.org, extract the real article image
 * (at /img/articles/item_XXXX_name.jpg), upload to Sanity, and patch the notice.
 *
 * Usage: SANITY_API_WRITE_TOKEN=... node scripts/migrate-images.mjs
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

const BASE = "https://kehillanw.org";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KehillaNW-migrator/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Extract the main article image from the page HTML */
function extractArticleImage(html) {
  if (!html) return null;
  // Primary: look for /img/articles/item_XXXX_*.(jpg|jpeg|png|webp|JPG)
  const match = html.match(/\/img\/articles\/(item_\d+_[^"'\s]+\.(?:jpe?g|png|webp|JPG|JPEG|PNG))/i);
  if (match) return `${BASE}/img/articles/${match[1]}`;
  return null;
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("image")) return null;
    return { buffer: Buffer.from(await res.arrayBuffer()), contentType: ct };
  } catch {
    return null;
  }
}

async function main() {
  const notices = JSON.parse(readFileSync("/tmp/knw_notices.json", "utf8"));
  const valid = notices.filter((n) => n.title && n.sourcePath);
  console.log(`Processing ${valid.length} notices for image migration…\n`);

  let found = 0, uploaded = 0, patched = 0, skipped = 0;

  for (let i = 0; i < valid.length; i++) {
    const notice = valid[i];
    const noticeId = `notice-${slugify(notice.title)}`;
    const prefix = `[${i + 1}/${valid.length}] ${notice.title.slice(0, 50)}`;

    // Check if already has an image in Sanity
    const existing = await client.fetch(
      `*[_id == $id][0]{ image }`,
      { id: noticeId }
    ).catch(() => null);

    if (existing?.image) {
      process.stdout.write(`${prefix} — already has image, skipping\n`);
      skipped++;
      continue;
    }

    // Re-fetch article page
    const url = `${BASE}/${notice.sourcePath}`;
    const html = await fetchText(url);
    const imageUrl = extractArticleImage(html);

    if (!imageUrl) {
      process.stdout.write(`${prefix} — no image found\n`);
      continue;
    }

    found++;
    process.stdout.write(`${prefix}\n  Image: ${imageUrl}\n  `);

    // Download
    const img = await downloadImage(imageUrl);
    if (!img) {
      process.stdout.write(`download failed\n`);
      continue;
    }

    // Upload to Sanity
    let asset;
    try {
      const filename = imageUrl.split("/").pop();
      asset = await client.assets.upload("image", img.buffer, {
        filename,
        contentType: img.contentType,
      });
      uploaded++;
      process.stdout.write(`uploaded (${Math.round(img.buffer.length / 1024)}KB) → ${asset._id}\n  `);
    } catch (e) {
      process.stdout.write(`upload failed: ${e.message}\n`);
      continue;
    }

    // Patch notice
    try {
      await client.patch(noticeId).set({
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      }).commit();
      patched++;
      process.stdout.write(`✓ patched\n`);
    } catch (e) {
      process.stdout.write(`patch failed: ${e.message}\n`);
    }

    await sleep(200);
  }

  console.log(`\n✅ Done:`);
  console.log(`   ${skipped} already had images (skipped)`);
  console.log(`   ${found} images found on old site`);
  console.log(`   ${uploaded} uploaded to Sanity`);
  console.log(`   ${patched} notices patched`);
}

main().catch((e) => { console.error(e); process.exit(1); });
