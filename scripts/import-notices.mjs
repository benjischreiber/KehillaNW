import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Map old category names to our schema slugs + colours
const categoryMap = {
  "Outings And Activities": { title: "Outings & Activities", slug: "outings-activities", colour: "rose", parent: "entertainment" },
  "Purim": { title: "Purim", slug: "purim", colour: "rose", parent: "entertainment" },
  "Gifts": { title: "Gifts", slug: "gifts", colour: "purple", parent: "shopping" },
  "Women": { title: "Women", slug: "women", colour: "teal", parent: "community" },
  "Kashrus": { title: "Kashrus", slug: "kashrus", colour: "orange", parent: "community" },
  "Parenting": { title: "Parenting", slug: "parenting", colour: "teal", parent: "community" },
  "Wellbeing": { title: "Wellbeing", slug: "wellbeing", colour: "green", parent: "support" },
  "Government": { title: "Useful Info", slug: "useful-info", colour: "blue" },
  "Support": { title: "Support", slug: "support", colour: "green" },
  "Shopping": { title: "Shopping", slug: "shopping", colour: "purple" },
  "Education": { title: "Education", slug: "education", colour: "orange" },
  "Community": { title: "Community", slug: "community", colour: "teal" },
  "Entertainment": { title: "Entertainment", slug: "entertainment", colour: "rose" },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Convert HTML content to simple portable text blocks
function htmlToPortableText(html) {
  if (!html) return [];

  // Strip script tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Extract text paragraphs and headings
  const blocks = [];

  // Replace <h3> with heading blocks
  const h3Matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];

  const allMatches = [...h3Matches.map(m => ({ type: "h3", text: m[1], index: m.index })),
                      ...pMatches.map(m => ({ type: "p", text: m[1], index: m.index }))]
    .sort((a, b) => a.index - b.index);

  for (const match of allMatches) {
    // Strip remaining HTML tags
    const text = match.text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&ndash;/g, "–").replace(/&pound;/g, "£").trim();
    if (!text) continue;

    blocks.push({
      _type: "block",
      _key: Math.random().toString(36).slice(2),
      style: match.type === "h3" ? "h3" : "normal",
      children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text, marks: [] }],
      markDefs: [],
    });
  }

  // If no structured content found, try to get plain text
  if (blocks.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (plainText) {
      blocks.push({
        _type: "block",
        _key: Math.random().toString(36).slice(2),
        style: "normal",
        children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text: plainText, marks: [] }],
        markDefs: [],
      });
    }
  }

  return blocks;
}

async function main() {
  const notices = JSON.parse(readFileSync("/tmp/knw_notices.json", "utf8"));

  // Filter out empty/404 notices
  const valid = notices.filter(n => n.title && n.title.trim());
  console.log(`Importing ${valid.length} notices...`);

  // 1. Create top-level nav categories first
  const topLevelCats = ["Government", "Support", "Shopping", "Education", "Community", "Entertainment"];
  const catIdMap = {};

  for (const catName of topLevelCats) {
    const info = categoryMap[catName];
    const doc = {
      _type: "category",
      _id: `category-${info.slug}`,
      title: info.title,
      slug: { _type: "slug", current: info.slug },
      colour: info.colour,
      showInMainNav: true,
      showInTopNav: false,
      order: topLevelCats.indexOf(catName) + 1,
    };
    await client.createOrReplace(doc);
    catIdMap[catName] = doc._id;
    console.log(`  ✓ Category: ${info.title}`);
  }

  // 2. Create sub-categories
  const subCats = ["Outings And Activities", "Purim", "Gifts", "Women", "Kashrus", "Parenting", "Wellbeing"];
  for (const catName of subCats) {
    const info = categoryMap[catName];
    if (!info) continue;
    const doc = {
      _type: "category",
      _id: `category-${info.slug}`,
      title: info.title,
      slug: { _type: "slug", current: info.slug },
      colour: info.colour,
      showInMainNav: false,
      showInTopNav: false,
      order: 99,
    };
    await client.createOrReplace(doc);
    catIdMap[catName] = doc._id;
    console.log(`  ✓ Sub-category: ${info.title}`);
  }

  // Also add top-nav categories
  const topNavCats = [
    { title: "Shuls", slug: "shuls" },
    { title: "Schools", slug: "schools" },
    { title: "Shiurim", slug: "shiurim" },
    { title: "Gemachim", slug: "gemachim" },
    { title: "Cholim", slug: "cholim" },
  ];
  for (let i = 0; i < topNavCats.length; i++) {
    const cat = topNavCats[i];
    await client.createOrReplace({
      _type: "category",
      _id: `category-${cat.slug}`,
      title: cat.title,
      slug: { _type: "slug", current: cat.slug },
      showInTopNav: true,
      showInMainNav: false,
      order: i + 1,
    });
    console.log(`  ✓ Top-nav: ${cat.title}`);
  }

  // 3. Import notices
  for (const notice of valid) {
    const catName = notice.category?.trim() || "Community";
    const catId = catIdMap[catName] || catIdMap["Community"];
    const slug = slugify(notice.title);

    const content = htmlToPortableText(notice.contentHtml || "");

    const doc = {
      _type: "notice",
      _id: `notice-${slug}`,
      title: notice.title.trim(),
      slug: { _type: "slug", current: slug },
      summary: notice.summary?.trim() || "",
      publishDate: notice.date ? new Date(notice.date).toISOString() : new Date().toISOString(),
      category: { _type: "reference", _ref: catId },
      featured: ["SOFT PLAY Hatfield 4 March", "Purim in NW London and beyond @KNW", "FIG - Filling in the Gaps"].includes(notice.title.trim()),
      isEvent: ["SOFT PLAY Hatfield 4 March", "Post sem Purim event", "Megilla Reading on the hour", "Pre Purim Hashem, Mummy and Me", "Parshas Zochor Readings"].includes(notice.title.trim()),
      content,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ Notice: ${notice.title}`);
  }

  // 4. Add a sample Mazal Tov
  const mazalTovItems = [
    "Mazel Tov — Pini Gross (St. Hill) is engaged to Shoshana Cohen (Templars Ave, Golders Green).",
    "Rabbi & Mrs Chaim Golker on the birth of a baby boy.",
    "Mr & Mrs YY Meyers on the birth of a son.",
    "Mr & Mrs Eli Morris on the occasion of their marriage.",
  ];
  for (let i = 0; i < mazalTovItems.length; i++) {
    await client.createOrReplace({
      _type: "mazalTov",
      _id: `mazaltov-${i}`,
      content: mazalTovItems[i],
      publishDate: new Date().toISOString(),
      visible: true,
    });
  }
  console.log(`  ✓ ${mazalTovItems.length} Mazal Tov items`);

  console.log("\n✅ Import complete!");
}

main().catch(console.error);
