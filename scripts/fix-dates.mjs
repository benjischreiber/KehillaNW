// fix-dates.mjs
// Usage: node /Users/benji/kehillanw/scripts/fix-dates.mjs

import { Buffer } from "node:buffer";

const b64 = s => Buffer.from(s, "base64").toString("utf8");

const PROJECT_ID = "sn3t47dp";
const DATASET = "production";
const TOKEN = "skpXEM2MDDlf8m0E4rI3WkUXqXGCy3ltbj8e0hPGmZaUkLnkggabu7ken0jWAetGDuvpwR6Y96hXF1NwmjasPZFw7YFewCWbdW0sFBBVdCTyq26vFfelLdA4ofpqNAZ2PEExwyTl2q6CVKh0C337Y8Ey0eWkYgMJR4mpTJfOArfQQKE6hrWw";
const QUERY_URL = b64("aHR0cHM6Ly9zbjN0NDdkcC5hcGkuc2FuaXR5LmlvL3YyMDIxLTEwLTIxL2RhdGEvcXVlcnkvcHJvZHVjdGlvbg==");
const MUTATE_URL = b64("aHR0cHM6Ly9zbjN0NDdkcC5hcGkuc2FuaXR5LmlvL3YyMDIxLTEwLTIxL2RhdGEvbXV0YXRlL3Byb2R1Y3Rpb24=");

// Regex patterns encoded as base64
const RE_URL_BLOCK = new RegExp(b64("PHVybD4oW1xzXFNdKj8pPFwvdXJsPg=="), "g");
const RE_LOC = new RegExp(b64("PGxvYz4oLio/KTxcL2xvYz4="));
const RE_LASTMOD = new RegExp(b64("PGxhc3Rtb2Q+KC4qPyk8XC9sYXN0bW9kPg=="));
const RE_HREF = new RegExp(b64("aHJlZj0iKFwvYXJ0aWNsZXNcL1teIl0rXC5odG1sKSI="), "g");
async function fetchSitemap() {
  const candidates = [
    "https://kehillanw.org/sitemap.xml",
    "https://kehillanw.org/sitemap_index.xml",
    "https://kehillanw.org/sitemap.php",
  ];
  for (const url of candidates) {
    console.log("Trying: " + url);
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (r.ok) {
        const text = await r.text();
        if (text.includes("<url") || text.includes("<sitemap")) {
          console.log("  OK -- " + text.length + " chars");
          return text;
        }
        console.log("  No sitemap markup found");
      } else console.log("  HTTP " + r.status);
    } catch (e) { console.log("  Error: " + e.message); }
  }
  return null;
}
function parseSitemapXml(xml) {
  const map = new Map();
  RE_URL_BLOCK.lastIndex = 0;
  let mr;
  while ((mr = RE_URL_BLOCK.exec(xml)) !== null) {
    const block = mr[1];
    const locM = RE_LOC.exec(block);
    const modM = RE_LASTMOD.exec(block);
    if (!locM) continue;
    const loc = locM[1].trim();
    if (!loc.includes("/articles/")) continue;
    const slug = loc.split("/").pop().replace(/\.html$/, "");
    if (!slug) continue;
    const dt = modM ? modM[1].trim().slice(0, 10) : null;
    if (dt) map.set(slug, dt);
  }
  return map;
}
const MONTHS = {
  january:"01", february:"02", march:"03", april:"04",
  may:"05", june:"06", july:"07", august:"08",
  september:"09", october:"10", november:"11", december:"12",
};

const RE_DATE_LONG = new RegExp(b64("KFxkezEsMn0pXHMrKEphbnVhcnl8RmVicnVhcnl8TWFyY2h8QXByaWx8TWF5fEp1bmV8SnVseXxBdWd1c3R8U2VwdGVtYmVyfE9jdG9iZXJ8Tm92ZW1iZXJ8RGVjZW1iZXIpXHMrKFxkezR9KQ=="), "i");

function extractDate(text) {
  const dateM = text.match(RE_DATE_LONG);
  if (!dateM) return null;
  const yr = dateM[3];
  const mo = MONTHS[dateM[2].toLowerCase()];
  const dy = dateM[1].padStart(2, "0");
  const sep = String.fromCharCode(45);
  return yr + sep + mo + sep + dy;
}
function parseCategoryHtml(html) {
  const map = new Map();
  RE_HREF.lastIndex = 0;
  let hm;
  while ((hm = RE_HREF.exec(html)) !== null) {
    const slug = hm[1].split("/").pop().replace(/\.html$/, "");
    const startIdx = Math.max(0, hm.index - 400);
    const snippet = html.slice(startIdx, hm.index + 600);
    const dt = extractDate(snippet);
    if (dt && !map.has(slug)) map.set(slug, dt);
  }
  return map;
}
const CATEGORIES = [
  "community","education","entertainment","government","support","shopping",
  "health","travel","sport","useful-info","shiurim","shuls","cholim",
  "gemachim","schools","organisations","business","local","halacha",
  "purim","events","news","jobs","property","food","technology","finance",
  "legal","charity","youth","seniors","culture","arts","kosher","simcha",
  "announcements","local-guidance","local-shops","shop-announcements",
  "cateringtake-away","kosher-outdoor-dining","gifts","outings-and-activities",
  "kashrus","wellbeing","women","parenting","government-local",
];
async function discoverCategories() {
  for (const tryUrl of ["https://kehillanw.org/categories/", "https://kehillanw.org/"]) {
    try {
      const r = await fetch(tryUrl, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) continue;
      const html = await r.text();
      for (const fm of html.matchAll(/\/articles\/([a-z0-9_-]+)\//g)) {
        if (!CATEGORIES.includes(fm[1])) CATEGORIES.push(fm[1]);
      }
    } catch { }
  }
}
async function scrapeByCategories() {
  await discoverCategories();
  console.log("  Using " + CATEGORIES.length + " categories");
  const map = new Map();
  for (const cat of CATEGORIES) {
    let pagesScraped = 0;
    for (let pg = 1; pg <= 30; pg++) {
      const tryUrl = pg === 1
        ? "https://kehillanw.org/articles/" + cat + "/"
        : "https://kehillanw.org/articles/" + cat + "/?page=" + pg;
      try {
        const r = await fetch(tryUrl, { signal: AbortSignal.timeout(12000) });
        if (!r.ok) break;
        const html = await r.text();
        if (!html.includes("/articles/")) break;
        const entries = parseCategoryHtml(html);
        for (const [s, dt] of entries) { if (!map.has(s)) map.set(s, dt); }
        pagesScraped++;
        if (entries.size === 0) break;
        if (entries.size < 2 && pg > 1) break;
      } catch (e) {
        if (pg === 1) console.log("  " + cat + ": " + e.message);
        break;
      }
    }
    if (pagesScraped > 0) console.log("  " + cat + ": " + pagesScraped + " pages");
  }
  return map;
}
async function fetchSanityNotices() {
  const notices = [];
  const sq = String.fromCharCode(39);
  for (let start = 0; start < 2000; start += 500) {
    const end = start + 500;
    const groq = "*[_type == " + sq + "notice" + sq + "][" + start + "..." + end + "]{_id, " + sq + "slug" + sq + ": slug.current, publishDate}";
    const r = await fetch(QUERY_URL + "?query=" + encodeURIComponent(groq));
    if (!r.ok) throw new Error("Sanity query failed: " + r.status);
    const data = await r.json();
    notices.push(...data.result);
    if (data.result.length < 500) break;
  }
  return notices;
}
async function applyMutations(mutations) {
  const BATCH = 50;
  let applied = 0;
  for (let i = 0; i < mutations.length; i += BATCH) {
    const batch = mutations.slice(i, i + BATCH);
    const r = await fetch(MUTATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TOKEN,
      },
      body: JSON.stringify({ mutations: batch }),
    });
    if (!r.ok) {
      console.error("Batch failed: " + r.status);
      try { console.error(await r.text()); } catch {}
      continue;
    }
    applied += batch.length;
    process.stdout.write("  Patched " + applied + "/" + mutations.length + "...");
  }
  process.stdout.write("
");
  return applied;
}
async function main() {
  console.log("=== KehillaNW Date Fix ===");
  let slugDate = new Map();

  console.log("STEP 1: Trying sitemap...");
  const xml = await fetchSitemap();
  if (xml) {
    slugDate = parseSitemapXml(xml);
    console.log("  " + slugDate.size + " entries from sitemap");
  }

  if (slugDate.size < 50) {
    console.log("STEP 1b: Scraping category pages...");
    const catMap = await scrapeByCategories();
    for (const [s, dt] of catMap) { if (!slugDate.has(s)) slugDate.set(s, dt); }
    console.log("Total: " + slugDate.size + " slug->date pairs");
  }

  if (slugDate.size === 0) {
    console.error("ERROR: No dates retrieved. Aborting.");
    process.exit(1);
  }

  console.log("Sample:");
  let sc = 0;
  for (const [s, dt] of slugDate) {
    if (sc++ >= 6) break;
    console.log("  " + s + ": " + dt);
  }

  console.log("STEP 2: Fetching Sanity notices...");
  const notices = await fetchSanityNotices();
  console.log("  " + notices.length + " notices in Sanity");

  console.log("STEP 3: Matching slugs...");
  const mutations = [];
  const unmatched = [];
  for (const notice of notices) {
    const { _id, slug, publishDate } = notice;
    if (!slug) continue;
    const newDate = slugDate.get(slug);
    if (newDate && newDate !== publishDate) {
      mutations.push({ patch: { id: _id, set: { publishDate: newDate } } });
    } else if (!newDate) {
      unmatched.push(slug);
    }
  }

  const alreadyOk = notices.length - mutations.length - unmatched.length;
  console.log("  To update: " + mutations.length);
  console.log("  Already correct: " + alreadyOk);
  console.log("  Unmatched: " + unmatched.length);

  if (unmatched.length > 0 && unmatched.length <= 60) {
    console.log("Unmatched slugs:");
    unmatched.forEach(s => console.log("  " + s));
  } else if (unmatched.length > 60) {
    console.log("First 60 unmatched:");
    unmatched.slice(0, 60).forEach(s => console.log("  " + s));
  }

  if (mutations.length === 0) { console.log("Nothing to update."); return; }

  console.log("STEP 4: Applying " + mutations.length + " mutations...");
  const applied = await applyMutations(mutations);

  console.log("=== SUMMARY ===");
  console.log("  Total notices: " + notices.length);
  console.log("  Dates found:   " + slugDate.size);
  console.log("  Updated:       " + applied);
  console.log("  Unmatched:     " + unmatched.length);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
