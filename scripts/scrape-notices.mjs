/**
 * Scrape all articles from kehillanw.org and save to /tmp/knw_notices.json
 * Usage: node scripts/scrape-notices.mjs
 */

import { writeFileSync } from "fs";

const BASE = "https://kehillanw.org";
const MAX_CATEGORY_PAGES = 30;

// Map URL path segment → category name used by import-notices.mjs
const PATH_TO_CATEGORY = {
  "announcements": "Useful Info",
  "local-guidance": "Useful Info",
  "local-shops": "Shopping",
  "shop-announcements": "Shopping",
  "cateringtake-away": "Shopping",
  "kosher-outdoor-dining": "Shopping",
  "gifts": "Shopping",
  "outings-and-activities": "Entertainment",
  "entertainment": "Entertainment",
  "online-events": "Entertainment",
  "purim": "Entertainment",
  "pesach": "Entertainment",
  "childrens-education": "Education",
  "information-for-educators": "Education",
  "kashrus": "Useful Info",
  "halacha": "Useful Info",
  "beis-hamikdosh": "Education",
  "community": "Community",
  "organisations": "Community",
  "volunteering": "Community",
  "support": "Support",
  "wellbeing": "Support",
  "parenting": "Support",
  "women": "Community",
  "gemachim": "Support",
  "government": "Useful Info",
  "recipes": "Shopping",
  "travel": "Entertainment",
  "work-avenue": "Community",
  "business-directory": "Community",
};

const CATEGORY_SEGMENTS = [
  "community", "education", "entertainment", "government", "support", "shopping",
  "health", "travel", "sport", "useful-info", "shiurim", "shuls", "cholim",
  "gemachim", "schools", "organisations", "business", "local", "halacha",
  "purim", "events", "news", "jobs", "property", "food", "technology", "finance",
  "legal", "charity", "youth", "seniors", "culture", "arts", "kosher", "simcha",
  "announcements", "local-guidance", "local-shops", "shop-announcements",
  "cateringtake-away", "kosher-outdoor-dining", "gifts", "outings-and-activities",
  "kashrus", "wellbeing", "women", "parenting", "government-local", "recipes",
  "online-events", "pesach", "childrens-education", "information-for-educators",
  "beis-hamikdosh", "volunteering", "work-avenue", "business-directory",
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function normalizeArticlePath(rawPath) {
  if (!rawPath) return null;
  const trimmed = rawPath.trim();
  if (!trimmed) return null;

  let path = trimmed
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^\//, "");

  if (!path.startsWith("articles/") || !path.endsWith(".html")) return null;
  return path;
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

/** Extract article links from a listing page */
function extractLinks(html) {
  const matches = [
    ...html.matchAll(/href="([^"]*articles\/[^"]+\.html)"/gi),
    ...html.matchAll(/<loc>([^<]*articles\/[^<]+\.html)<\/loc>/gi),
  ];

  return [...new Set(matches.map((m) => normalizeArticlePath(m[1])).filter(Boolean))];
}

async function collectLinksFromRootListings(allLinks) {
  let page = 1;
  let emptyCount = 0;

  while (emptyCount < 2) {
    const url = page === 1 ? `${BASE}/articles/` : `${BASE}/articles/?page=${page}`;
    const html = await fetchText(url);
    if (!html) {
      emptyCount++;
      page++;
      continue;
    }

    const links = extractLinks(html);
    if (links.length === 0) {
      emptyCount++;
    } else {
      emptyCount = 0;
      links.forEach((link) => allLinks.add(link));
      process.stdout.write(`  Root page ${page}: ${links.length} links (total ${allLinks.size})\n`);
    }

    page++;
    await sleep(200);
  }
}

async function collectLinksFromCategoryListings(allLinks) {
  for (const category of CATEGORY_SEGMENTS) {
    let categoryFound = 0;

    for (let page = 1; page <= MAX_CATEGORY_PAGES; page++) {
      const url = page === 1
        ? `${BASE}/articles/${category}/`
        : `${BASE}/articles/${category}/?page=${page}`;

      const html = await fetchText(url);
      if (!html || !html.includes("/articles/")) break;

      const before = allLinks.size;
      extractLinks(html).forEach((link) => allLinks.add(link));
      const added = allLinks.size - before;
      categoryFound += added;

      if (added === 0 && page > 1) break;
      await sleep(150);
    }

    if (categoryFound > 0) {
      process.stdout.write(`  Category ${category}: +${categoryFound} links (total ${allLinks.size})\n`);
    }
  }
}

async function collectLinksFromSitemaps(allLinks) {
  const sitemapUrls = [
    `${BASE}/sitemap.xml`,
    `${BASE}/sitemap_index.xml`,
    `${BASE}/sitemap.php`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    const html = await fetchText(sitemapUrl);
    if (!html) continue;

    const before = allLinks.size;
    extractLinks(html).forEach((link) => allLinks.add(link));
    const added = allLinks.size - before;

    if (added > 0) {
      process.stdout.write(`  Sitemap ${sitemapUrl}: +${added} links (total ${allLinks.size})\n`);
    }
  }
}

/** Parse a single article page */
function parseArticle(html, path) {
  if (!html) return null;

  // Title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim()
    : null;

  if (!title || title.length < 3) return null;

  // Date — look for a date pattern in the page
  const dateMatch = html.match(/(\d{1,2})[\/\s](\w+)[\/\s](\d{4})/);
  let date = null;
  if (dateMatch) {
    try { date = new Date(dateMatch[0]).toISOString().split("T")[0]; } catch { /* ignore */ }
  }

  // Summary — first <p> in the article body
  const summaryMatch = html.match(/<div[^>]*class="[^"]*article[^"]*body[^"]*"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
    || html.match(/<main[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  const summary = summaryMatch
    ? summaryMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim().slice(0, 200)
    : "";

  // Content HTML — try to grab the article body
  const bodyMatch = html.match(/<div[^>]*class="[^"]*(?:article[-_]?body|post[-_]?content|entry[-_]?content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const contentHtml = bodyMatch ? bodyMatch[1] : "";

  // External link — any prominent external link
  const extMatch = html.match(/href="(https?:\/\/(?!kehillanw\.org)[^"]+)"[^>]*>(?:(?!<).){0,50}(?:visit|click|here|more|info|buy|book|register|join|download)/i);
  const externalLink = extMatch ? extMatch[1] : null;

  // PDF link
  const pdfMatch = html.match(/href="([^"]+\.pdf)"/i);
  const pdfUrl = pdfMatch ? (pdfMatch[1].startsWith("http") ? pdfMatch[1] : `${BASE}/${pdfMatch[1].replace(/^\//, "")}`) : null;

  // Image
  const imgMatch = html.match(/<img[^>]*src="([^"]*(?:uploads|images|img)[^"]*(?:jpe?g|png|webp))"[^>]*/i);
  const imageUrl = imgMatch ? (imgMatch[1].startsWith("http") ? imgMatch[1] : `${BASE}/${imgMatch[1].replace(/^\//, "")}`) : null;

  // Category from path
  const segment = path.split("/")[1] || "";
  const category = PATH_TO_CATEGORY[segment] || "Community";

  return { title, date, summary, contentHtml, externalLink, pdfUrl, imageUrl, category, sourcePath: path };
}

async function main() {
  console.log("Phase 1: Collecting article URLs...");
  const allLinks = new Set();
  await collectLinksFromSitemaps(allLinks);
  await collectLinksFromRootListings(allLinks);
  await collectLinksFromCategoryListings(allLinks);

  console.log(`\nFound ${allLinks.size} article URLs. Phase 2: Fetching each article...\n`);
  const notices = [];
  let i = 0;
  for (const link of allLinks) {
    i++;
    const url = `${BASE}/${link}`;
    const html = await fetchText(url);
    const notice = parseArticle(html, link);
    if (notice) {
      notices.push(notice);
      if (i % 20 === 0) process.stdout.write(`  ${i}/${allLinks.size} fetched (${notices.length} valid)\n`);
    }
    await sleep(150);
  }

  writeFileSync("/tmp/knw_notices.json", JSON.stringify(notices, null, 2));
  console.log(`\n✅ Saved ${notices.length} notices to /tmp/knw_notices.json`);
  console.log(`   Now run: SANITY_API_WRITE_TOKEN=<token> node scripts/import-notices.mjs`);
}

main().catch(e => { console.error(e); process.exit(1); });
