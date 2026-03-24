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
  "Local Shops": { title: "Local Shops", slug: "local-shops", colour: "purple", parent: "shopping" },
  "Shop Announcements": { title: "Shop Announcements", slug: "shop-announcements", colour: "purple", parent: "shopping" },
  "Catering & Take-Away": { title: "Catering & Take-Away", slug: "cateringtake-away", colour: "purple", parent: "shopping" },
  "Kosher Outdoor Dining": { title: "Kosher Outdoor Dining", slug: "kosher-outdoor-dining", colour: "purple", parent: "shopping" },
  "Recipes": { title: "Recipes", slug: "recipes", colour: "amber", parent: "shopping" },
  "Women": { title: "Women", slug: "women", colour: "teal", parent: "community" },
  "Kashrus": { title: "Kashrus", slug: "kashrus", colour: "purple", parent: "shopping" },
  "Halacha": { title: "Halacha", slug: "halacha", colour: "green", parent: "support" },
  "Parenting": { title: "Parenting", slug: "parenting", colour: "teal", parent: "community" },
  "Wellbeing": { title: "Wellbeing", slug: "wellbeing", colour: "green", parent: "support" },
  "Beis Hamikdosh": { title: "Beis Hamikdosh", slug: "beis-hamikdosh", colour: "orange", parent: "education" },
  "Online Events & Podcasts": { title: "Online Events & Podcasts", slug: "online-events", colour: "orange", parent: "education" },
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

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&ldquo;/g, "\"")
    .replace(/&rdquo;/g, "\"")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&pound;/g, "£")
    .replace(/&#39;/g, "'");
}

function stripTags(text) {
  return decodeHtml(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inlineText(text) {
  const decoded = decodeHtml(text).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ");
  const hasLeadingSpace = /^\s/.test(decoded);
  const hasTrailingSpace = /\s$/.test(decoded);
  const collapsed = decoded.replace(/\s+/g, " ").trim();
  if (!collapsed) return "";
  return `${hasLeadingSpace ? " " : ""}${collapsed}${hasTrailingSpace ? " " : ""}`;
}

function sanitizeHref(href) {
  const value = decodeHtml((href || "").trim());
  if (!value) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return null;
}

function htmlToPortableChildren(fragment) {
  const children = [];
  const markDefs = [];
  const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let lastIndex = 0;
  let match;

  const pushText = (text, marks = []) => {
    const normalized = inlineText(text);
    if (!normalized) return;
    children.push({
      _type: "span",
      _key: Math.random().toString(36).slice(2),
      text: normalized,
      marks,
    });
  };

  while ((match = anchorRegex.exec(fragment)) !== null) {
    pushText(fragment.slice(lastIndex, match.index));

    const href = sanitizeHref(match[1]);
    const linkText = stripTags(match[2]);
    if (href && linkText) {
      const key = Math.random().toString(36).slice(2);
      markDefs.push({
        _key: key,
        _type: "link",
        href,
        blank: true,
      });
      pushText(match[2], [key]);
    } else {
      pushText(match[2]);
    }

    lastIndex = match.index + match[0].length;
  }

  pushText(fragment.slice(lastIndex));

  return { children, markDefs };
}

function makeBlock(style, fragment) {
  const { children, markDefs } = htmlToPortableChildren(fragment);
  if (children.length === 0) return null;
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2),
    style,
    children,
    markDefs,
  };
}

function makeBlocks(style, fragment) {
  return fragment
    .split(/<br\s*\/?>/gi)
    .map((part) => makeBlock(style, part))
    .filter(Boolean);
}

function normalizeBlockText(block) {
  return block.children.map((child) => child.text).join(" ").replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function textKey(text) {
  return normalizeText(text)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

// Convert HTML content to portable text blocks while keeping inline links.
function htmlToPortableText(html) {
  if (!html) return [];

  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  const matches = [];
  const patterns = [
    { regex: /<h2[^>]*>([\s\S]*?)<\/h2>/gi, style: "h2" },
    { regex: /<h3[^>]*>([\s\S]*?)<\/h3>/gi, style: "h3" },
    { regex: /<h4[^>]*>([\s\S]*?)<\/h4>/gi, style: "h4" },
    { regex: /<p[^>]*>([\s\S]*?)<\/p>/gi, style: "normal" },
  ];

  for (const { regex, style } of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.push({ index: match.index, style, fragment: match[1] });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const blocks = [];
  for (const match of matches) {
    if (match.style === "normal" && /<(h2|h3|h4|ul|ol|li)\b/i.test(match.fragment)) {
      continue;
    }

    const candidateBlocks = makeBlocks(match.style, match.fragment);
    if (candidateBlocks.length === 0) continue;

    for (const block of candidateBlocks) {
      const currentText = normalizeBlockText(block);
      const previousText = blocks.length > 0 ? normalizeBlockText(blocks[blocks.length - 1]) : null;
      if (currentText && currentText === previousText) continue;

      blocks.push(block);
    }
  }

  if (blocks.length === 0) {
    const fallback = makeBlock("normal", html);
    if (fallback) blocks.push(fallback);
  }

  return blocks;
}

function trimLeadingDuplicateBlocks(blocks, summary, title) {
  const summaryText = normalizeText(summary);
  const titleText = normalizeText(title);
  const summaryKey = textKey(summary);
  const titleKey = textKey(title);
  let startIndex = 0;

  while (startIndex < blocks.length) {
    const blockText = normalizeBlockText(blocks[startIndex]);
    const blockKey = textKey(blockText);
    if (!blockText) {
      startIndex += 1;
      continue;
    }

    const matchesSummary =
      (summaryText && blockText === summaryText) ||
      (summaryKey && blockKey === summaryKey);
    const matchesTitle =
      (titleText && blockText === titleText) ||
      (titleKey && blockKey && (blockKey === titleKey || titleKey.includes(blockKey) || blockKey.includes(titleKey)));

    if (matchesSummary || matchesTitle) {
      startIndex += 1;
      continue;
    }

    break;
  }

  return blocks.slice(startIndex);
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

    const content = trimLeadingDuplicateBlocks(
      htmlToPortableText(notice.contentHtml || ""),
      notice.summary?.trim() || "",
      notice.title?.trim() || ""
    );
    const noticeId = `notice-${slug}`;
    const existing = await client.fetch(
      `*[_id == $id][0]{ _id, publishDate, image, pdfFile, secondaryCategory, visible }`,
      { id: noticeId }
    ).catch(() => null);

    const baseFields = {
      title: notice.title.trim(),
      slug: { _type: "slug", current: slug },
      summary: notice.summary?.trim() || "",
      category: { _type: "reference", _ref: catId },
      featured: ["SOFT PLAY Hatfield 4 March", "Purim in NW London and beyond @KNW", "FIG - Filling in the Gaps"].includes(notice.title.trim()),
      isEvent: ["SOFT PLAY Hatfield 4 March", "Post sem Purim event", "Megilla Reading on the hour", "Pre Purim Hashem, Mummy and Me", "Parshas Zochor Readings"].includes(notice.title.trim()),
      content,
      externalLink: notice.externalLink || undefined,
      visible: existing?.visible ?? true,
    };

    if (existing) {
      const patch = {
        ...baseFields,
        publishDate: existing.publishDate || (notice.date ? new Date(notice.date).toISOString() : undefined),
      };

      await client.patch(noticeId).set(patch).commit();
    } else {
      await client.create({
        _type: "notice",
        _id: noticeId,
        ...baseFields,
        publishDate: notice.date ? new Date(notice.date).toISOString() : new Date().toISOString(),
      });
    }
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
