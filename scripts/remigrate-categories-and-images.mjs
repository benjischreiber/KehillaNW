/**
 * Phase 1 — Create all original subcategories in Sanity (mirroring the old site).
 * Phase 2 — Re-assign every notice's category to its correct original subcategory
 *            (derived from the article's URL path in sourcePath).
 * Phase 3 — Download and upload article images, patch notices.
 *
 * Usage: SANITY_API_WRITE_TOKEN=... node scripts/remigrate-categories-and-images.mjs
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
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── Existing top-level category _ids in Sanity ──────────────────────────────
// category-government  (slug: government, title: Government)   ← Useful Info renamed back
// category-support     (slug: support)
// category-shopping    (slug: shopping)
// category-education   (slug: education)
// category-community   (slug: community)
// category-entertainment (slug: entertainment)

// ─── Subcategories to create/update ──────────────────────────────────────────
// { sanityId, slug, title, parentId, colour }
const SUBCATEGORIES = [
  // Government / Useful Info
  { sanityId: "category-announcements",           slug: "announcements",            title: "Announcements",            parentId: "category-government", colour: "blue" },
  { sanityId: "category-local-guidance",          slug: "local-guidance",           title: "Local Guidance",           parentId: "category-government", colour: "blue" },
  { sanityId: "category-halacha",                 slug: "halacha",                  title: "Halacha",                  parentId: "category-government", colour: "blue" },
  { sanityId: "category-kashrus",                 slug: "kashrus",                  title: "Kashrus",                  parentId: "category-government", colour: "blue" },
  // Shopping
  { sanityId: "category-local-shops",             slug: "local-shops",              title: "Local Shops",              parentId: "category-shopping",   colour: "purple" },
  { sanityId: "category-shop-announcements",      slug: "shop-announcements",       title: "Shop Announcements",       parentId: "category-shopping",   colour: "purple" },
  { sanityId: "category-cateringtake-away",       slug: "cateringtake-away",        title: "Catering & Take-Away",     parentId: "category-shopping",   colour: "purple" },
  { sanityId: "category-kosher-outdoor-dining",   slug: "kosher-outdoor-dining",    title: "Kosher Outdoor Dining",    parentId: "category-shopping",   colour: "purple" },
  { sanityId: "category-gifts",                   slug: "gifts",                    title: "Gifts",                    parentId: "category-shopping",   colour: "purple" },
  { sanityId: "category-recipes",                 slug: "recipes",                  title: "Recipes",                  parentId: "category-shopping",   colour: "purple" },
  // Entertainment
  { sanityId: "category-outings-activities",      slug: "outings-activities",       title: "Outings & Activities",     parentId: "category-entertainment", colour: "rose" },
  { sanityId: "category-online-events",           slug: "online-events",            title: "Online Events & Podcasts", parentId: "category-entertainment", colour: "rose" },
  { sanityId: "category-purim",                   slug: "purim",                    title: "Purim",                    parentId: "category-entertainment", colour: "rose" },
  { sanityId: "category-pesach",                  slug: "pesach",                   title: "Pesach",                   parentId: "category-entertainment", colour: "rose" },
  { sanityId: "category-travel",                  slug: "travel",                   title: "Travel",                   parentId: "category-entertainment", colour: "rose" },
  // Education
  { sanityId: "category-childrens-education",     slug: "childrens-education",      title: "Children's Education",     parentId: "category-education",  colour: "orange" },
  { sanityId: "category-information-for-educators", slug: "information-for-educators", title: "Information for Educators", parentId: "category-education", colour: "orange" },
  { sanityId: "category-beis-hamikdosh",          slug: "beis-hamikdosh",           title: "Beis Hamikdosh",           parentId: "category-education",  colour: "orange" },
  { sanityId: "category-shiurim",                 slug: "shiurim",                  title: "Shiurim",                  parentId: "category-education",  colour: "orange" },
  { sanityId: "category-parsha",                  slug: "parsha",                   title: "Parsha",                   parentId: "category-education",  colour: "orange" },
  // Community
  { sanityId: "category-organisations",           slug: "organisations",            title: "Organisations",            parentId: "category-community",  colour: "teal" },
  { sanityId: "category-volunteering",            slug: "volunteering",             title: "Volunteering",             parentId: "category-community",  colour: "teal" },
  { sanityId: "category-women",                   slug: "women",                    title: "Women",                    parentId: "category-community",  colour: "teal" },
  { sanityId: "category-work-avenue",             slug: "work-avenue",              title: "Work Avenue",              parentId: "category-community",  colour: "teal" },
  { sanityId: "category-business-directory",      slug: "business-directory",       title: "Business Directory",       parentId: "category-community",  colour: "teal" },
  // Support
  { sanityId: "category-wellbeing",               slug: "wellbeing",                title: "Wellbeing",                parentId: "category-support",    colour: "green" },
  { sanityId: "category-parenting",               slug: "parenting",                title: "Parenting",                parentId: "category-support",    colour: "green" },
  { sanityId: "category-gemachim",                slug: "gemachim",                 title: "Gemachim",                 parentId: "category-support",    colour: "green" },
];

// ─── Path segment → Sanity category _id ─────────────────────────────────────
const PATH_TO_CAT_ID = {
  // Top-level (articles directly in these folders)
  support:                    "category-support",
  community:                  "category-community",
  entertainment:              "category-entertainment",
  shopping:                   "category-shopping",
  education:                  "category-education",
  government:                 "category-government",
  // Subcategories
  announcements:              "category-announcements",
  "local-guidance":           "category-local-guidance",
  kashrus:                    "category-kashrus",
  halacha:                    "category-halacha",
  "local-shops":              "category-local-shops",
  "shop-announcements":       "category-shop-announcements",
  "cateringtake-away":        "category-cateringtake-away",
  "kosher-outdoor-dining":    "category-kosher-outdoor-dining",
  gifts:                      "category-gifts",
  recipes:                    "category-recipes",
  "outings-and-activities":   "category-outings-activities",
  "online-events":            "category-online-events",
  purim:                      "category-purim",
  pesach:                     "category-pesach",
  travel:                     "category-travel",
  "childrens-education":      "category-childrens-education",
  "information-for-educators":"category-information-for-educators",
  "beis-hamikdosh":           "category-beis-hamikdosh",
  shiurim:                    "category-shiurim",
  parsha:                     "category-parsha",
  organisations:              "category-organisations",
  volunteering:               "category-volunteering",
  women:                      "category-women",
  "work-avenue":              "category-work-avenue",
  "business-directory":       "category-business-directory",
  wellbeing:                  "category-wellbeing",
  parenting:                  "category-parenting",
  gemachim:                   "category-gemachim",
};

function getCatIdFromPath(sourcePath) {
  const segment = sourcePath.split("/")[1] || "";
  return PATH_TO_CAT_ID[segment] || null;
}

// ─── Image extraction ─────────────────────────────────────────────────────────
async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KehillaNW-migrator/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function extractArticleImage(html) {
  if (!html) return null;
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
  } catch { return null; }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const notices = JSON.parse(readFileSync("/tmp/knw_notices.json", "utf8"));
  const valid = notices.filter((n) => n.title && n.sourcePath);

  // ── Phase 1: Create/update subcategories ───────────────────────────────────
  console.log("── Phase 1: Creating subcategories ──");
  for (const sub of SUBCATEGORIES) {
    const doc = {
      _type: "category",
      _id: sub.sanityId,
      title: sub.title,
      slug: { _type: "slug", current: sub.slug },
      colour: sub.colour,
      showInMainNav: false,
      showInTopNav: false,
      order: 99,
      parent: { _type: "reference", _ref: sub.parentId },
    };
    await client.createOrReplace(doc);
    console.log(`  ✓ ${sub.title} (${sub.slug}) → ${sub.parentId}`);
  }

  // ── Phase 2 & 3: Re-categorise + migrate images ───────────────────────────
  console.log(`\n── Phase 2 & 3: Processing ${valid.length} notices ──`);
  let reCatCount = 0, imgFound = 0, imgUploaded = 0, patchCount = 0;

  for (let i = 0; i < valid.length; i++) {
    const notice = valid[i];
    const noticeId = `notice-${slugify(notice.title)}`;
    const prefix = `[${i + 1}/${valid.length}] ${notice.title.slice(0, 50)}`;

    const targetCatId = getCatIdFromPath(notice.sourcePath);

    // Check existing Sanity document
    const existing = await client.fetch(
      `*[_id == $id][0]{ image, "currentCatId": category._ref }`,
      { id: noticeId }
    ).catch(() => null);

    if (!existing) {
      // Not in Sanity — skip (already imported, slug might differ)
      continue;
    }

    const patches = {};

    // Re-categorise if needed
    if (targetCatId && existing.currentCatId !== targetCatId) {
      patches.category = { _type: "reference", _ref: targetCatId };
      reCatCount++;
    }

    // Image migration (skip if already has one)
    if (!existing.image) {
      const url = `${BASE}/${notice.sourcePath}`;
      const html = await fetchText(url);
      const imageUrl = extractArticleImage(html);

      if (imageUrl) {
        imgFound++;
        const img = await downloadImage(imageUrl);
        if (img) {
          try {
            const filename = imageUrl.split("/").pop();
            const asset = await client.assets.upload("image", img.buffer, {
              filename,
              contentType: img.contentType,
            });
            imgUploaded++;
            patches.image = {
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
            };
          } catch (e) {
            console.log(`  ${prefix} — image upload failed: ${e.message}`);
          }
        }
      }
    }

    // Apply patches
    if (Object.keys(patches).length > 0) {
      try {
        await client.patch(noticeId).set(patches).commit();
        patchCount++;
        const parts = [];
        if (patches.category) parts.push(`cat → ${targetCatId}`);
        if (patches.image) parts.push(`image ✓`);
        process.stdout.write(`  ✓ ${prefix} [${parts.join(", ")}]\n`);
      } catch (e) {
        console.log(`  ${prefix} — patch failed: ${e.message}`);
      }
    } else if (i % 50 === 0) {
      process.stdout.write(`  . ${prefix}\n`);
    }

    await sleep(150);
  }

  console.log(`\n✅ Done:`);
  console.log(`   ${SUBCATEGORIES.length} subcategories created/updated`);
  console.log(`   ${reCatCount} notices re-categorised`);
  console.log(`   ${imgFound} images found on old site`);
  console.log(`   ${imgUploaded} images uploaded to Sanity`);
  console.log(`   ${patchCount} notices patched total`);
}

main().catch((e) => { console.error(e); process.exit(1); });
