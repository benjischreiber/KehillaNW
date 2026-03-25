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
const ADMIN_LIST_URL = `${BASE}/admin/website_content_articles_value_list.php?listid=19&page=all`;
const ADMIN_EDIT_URL = `${BASE}/admin/website_content_articles_value_edit.php?id=`;
const CATEGORY_ID = "category-cateringtake-away";

const AREA_TO_CATEGORY_ID = {
  "Announcements": "category-announcements",
  "Beis Hamikdosh": "category-beis-hamikdosh",
  "Business Directory": "category-business-directory",
  "Catering/Take Away": "category-cateringtake-away",
  "Chanuka": "category-chanukah",
  "Chanukah": "category-chanukah",
  "Childrens Education": "category-childrens-education",
  "Community": "category-community",
  "Education": "category-education",
  "Entertainment": "category-outings-activities",
  "Financial Advice": "category-financial-advice",
  "Financial Support": "category-financial-support",
  "Gemachim": "category-gemachim",
  "Gifts": "category-gifts",
  "Government": "category-government",
  "Halacha": "category-halacha",
  "Information for Educators": "category-information-for-educators",
  "Israel": "category-israel",
  "Kashrus": "category-kashrus",
  "Kosher Outdoors": "category-kosher-outdoor-dining",
  "Local Guidance": "category-local-guidance",
  "Local Shops": "category-local-shops",
  "Online Events and Podcasts": "category-online-events",
  "Organisations": "category-organisations",
  "Outings & Activities": "category-outings-activities",
  "Parsha": "category-parsha",
  "Parenting": "category-parenting",
  "Pesach": "category-pesach",
  "Produce from Israel": "category-produce-from-israel",
  "Purim": "category-purim",
  "Recipes": "category-recipes",
  "Shop Announcements": "category-shop-announcements",
  "Shavuos": "category-shavuos",
  "Shiurim": "category-shiurim",
  "Support": "category-support",
  "Travel": "category-travel",
  "Tu Bishvat": "category-tu-bshvat",
  "Useful Info": "category-useful-info",
  "Volunteering": "category-volunteering",
  "Wellbeing": "category-wellbeing",
  "Women": "category-women",
  "Work Avenue": "category-work-avenue",
  "Yom Hashoah": "category-yom-hashoah",
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function decodeHtml(text) {
  return (text || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&ldquo;/g, "\"")
    .replace(/&rdquo;/g, "\"")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&#039;/g, "'")
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
  const decoded = decodeHtml(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
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
      markDefs.push({ _key: key, _type: "link", href, blank: true });
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

function htmlToPortableText(html) {
  if (!html) return [];

  const cleaned = html
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
    while ((match = regex.exec(cleaned)) !== null) {
      matches.push({ index: match.index, style, fragment: match[1] });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const blocks = [];
  for (const match of matches) {
    const candidateBlocks = makeBlocks(match.style, match.fragment);
    for (const block of candidateBlocks) {
      const currentText = normalizeBlockText(block);
      const previousText = blocks.length > 0 ? normalizeBlockText(blocks[blocks.length - 1]) : null;
      if (currentText && currentText === previousText) continue;
      blocks.push(block);
    }
  }

  if (blocks.length === 0) {
    const fallback = makeBlock("normal", cleaned);
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

function parseCookieFile(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  const cookies = [];
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length < 7) continue;
    const [domain, , cookiePath, secure, , name, value] = parts;
    cookies.push({ domain, path: cookiePath, secure: secure === "TRUE", name, value });
  }
  return cookies;
}

function cookieHeader(cookies, url) {
  const { hostname, pathname, protocol } = new URL(url);
  return cookies
    .filter((cookie) => hostname.endsWith(cookie.domain.replace(/^\./, "")))
    .filter((cookie) => pathname.startsWith(cookie.path))
    .filter((cookie) => protocol === "https:" || !cookie.secure)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function fetchText(url, cookies) {
  const headers = { "User-Agent": "Mozilla/5.0 (compatible; KehillaNW-recovery/1.0)" };
  const cookie = cookieHeader(cookies, url);
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }

  return await res.text();
}

function parseList(html) {
  const rows = [...html.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>[\s\S]*?<\/td>\s*<td>[\s\S]*?<\/td>\s*<td><a id="Visible\d+" class="toggleField (tick|cross)"/g)];
  return rows.map((match) => ({
    id: match[1],
    title: stripTags(match[2]).replace(/\u00a0/g, " ").trim(),
    visible: match[3] === "tick",
  }));
}

function parseSelectedOption(html, fieldName) {
  const selectMatch = html.match(new RegExp(`<select name="${fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?<\\/select>`));
  if (!selectMatch) return "";
  const selectedMatch = selectMatch[0].match(/<option value="[^"]*"\s+selected="selected"\s*>([\s\S]*?)<\/option>/i);
  return selectedMatch ? stripTags(selectedMatch[1]).trim() : "";
}

function parseInputValue(html, fieldName) {
  const match = html.match(new RegExp(`name="${fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" value="([\\s\\S]*?)"`));
  return match ? decodeHtml(match[1]).trim() : "";
}

function parseTextareaValue(html, fieldName) {
  const match = html.match(new RegExp(`<textarea[^>]*name="${fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)<\\/textarea>`));
  return match ? decodeHtml(match[1]).trim() : "";
}

function parseChecked(html, fieldName) {
  const match = html.match(new RegExp(`<input[^>]*name="${fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i"));
  return Boolean(match && /\bchecked\b/i.test(match[0]));
}

function parseEditPage(html, id) {
  const title = parseInputValue(html, "fields[Title]");
  const filename = parseInputValue(html, "fields[ArticleFilename]");
  const externalLink = parseInputValue(html, "fields[ArticleLink]");
  const summary = parseTextareaValue(html, "fields[Summary]");
  const contentHtml = parseTextareaValue(html, "fields[Content]");
  const articleDate = parseInputValue(html, "fields[ArticleDate]");
  const endDate = parseInputValue(html, "fields[EndDate]");
  const createdDateTime = parseInputValue(html, "fields[CreatedDateTime]");
  const imageFilename = parseInputValue(html, "fields[Image]");
  const primaryArea = parseSelectedOption(html, "fields[ArticleAreaID]");
  const secondArea = parseSelectedOption(html, "fields[ArticleAreaID2]");
  const featured = parseChecked(html, "fields[Featured]");
  const isEvent = parseChecked(html, "fields[IsEvent]");
  const visible = parseChecked(html, "fields[Visible]");

  return {
    id,
    title,
    filename,
    externalLink,
    summary,
    contentHtml,
    articleDate,
    endDate,
    createdDateTime,
    imageFilename,
    primaryArea,
    secondArea,
    featured,
    isEvent,
    visible,
  };
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value).toISOString();
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T12:00:00Z`).toISOString();
  }
  return null;
}

function areaToCategoryId(area) {
  const normalized = (area || "").replace(/\s+/g, " ").trim();
  return AREA_TO_CATEGORY_ID[normalized] || null;
}

async function fetchExistingNoticeMaps() {
  const docs = await client.fetch(`*[_type == "notice"]{_id,title,"slug":slug.current}`);
  const bySlug = new Map();
  const byTitle = new Map();

  for (const doc of docs) {
    if (doc.slug) bySlug.set(doc.slug, doc);
    if (doc.title) byTitle.set(normalizeText(doc.title), doc);
  }

  return { bySlug, byTitle };
}

async function fetchExistingCategoryIds() {
  const ids = await client.fetch(`*[_type == "category"]._id`);
  return new Set(ids);
}

async function maybeUploadImage(imageFilename) {
  if (!imageFilename) return null;

  const imageUrl = `${BASE}/img/articles/${imageFilename}`;
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (!res || !res.ok) return null;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image")) return null;

  const asset = await client.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
    filename: imageFilename,
    contentType,
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

async function main() {
  const cookies = parseCookieFile("/tmp/knw-admin-cookies.txt");
  const listHtml = await fetchText(ADMIN_LIST_URL, cookies);
  const listRows = parseList(listHtml);
  const { bySlug, byTitle } = await fetchExistingNoticeMaps();
  const existingCategoryIds = await fetchExistingCategoryIds();

  let created = 0;
  let patched = 0;
  let importedVisible = 0;
  let importedHidden = 0;

  for (const row of listRows) {
    const editHtml = await fetchText(`${ADMIN_EDIT_URL}${row.id}`, cookies);
    const data = parseEditPage(editHtml, row.id);
    data.visible = row.visible;
    const slug = slugify(data.filename?.replace(/\.html$/i, "") || data.title);
    const existing = bySlug.get(slug) || byTitle.get(normalizeText(data.title));
    const primaryCategoryId = areaToCategoryId(data.primaryArea) || CATEGORY_ID;
    const secondaryCategoryId = areaToCategoryId(data.secondArea);
    const publishDate = parseDate(data.articleDate) || parseDate(data.createdDateTime) || new Date().toISOString();
    const content = trimLeadingDuplicateBlocks(
      htmlToPortableText(data.contentHtml || ""),
      data.summary || "",
      data.title || ""
    );

    const patch = {
      title: data.title,
      slug: { _type: "slug", current: slug },
      summary: data.summary || "",
      category: { _type: "reference", _ref: existingCategoryIds.has(primaryCategoryId) ? primaryCategoryId : CATEGORY_ID, _weak: true },
      secondaryCategory: secondaryCategoryId && existingCategoryIds.has(secondaryCategoryId)
        ? { _type: "reference", _ref: secondaryCategoryId, _weak: true }
        : undefined,
      featured: data.featured,
      isEvent: data.isEvent,
      visible: data.visible,
      publishDate,
      endDate: parseDate(data.endDate) || undefined,
      content,
      externalLink: data.externalLink || undefined,
      sourcePath: data.filename ? `articles/cateringtake-away/${data.filename}` : undefined,
      oldAdminId: String(data.id),
    };

    if (existing) {
      const existingDoc = await client.fetch(
        `*[_id == $id][0]{_id,image,pdfFile}`,
        { id: existing._id }
      );

      if (!existingDoc.image && data.imageFilename) {
        const image = await maybeUploadImage(data.imageFilename);
        if (image) patch.image = image;
      }

      await client.patch(existing._id).set(patch).commit();
      patched += 1;
    } else {
      const doc = {
        _type: "notice",
        _id: `notice-${slug}`,
        ...patch,
      };

      if (data.imageFilename) {
        const image = await maybeUploadImage(data.imageFilename);
        if (image) doc.image = image;
      }

      await client.create(doc);
      created += 1;
      bySlug.set(slug, { _id: doc._id, slug, title: data.title });
      byTitle.set(normalizeText(data.title), { _id: doc._id, slug, title: data.title });
    }

    if (data.visible) importedVisible += 1;
    else importedHidden += 1;

    process.stdout.write(`✓ ${data.title} [${data.visible ? "visible" : "hidden"}]\n`);
  }

  const sanityCount = await client.fetch(
    `count(*[_type == "notice" && (category->slug.current == "cateringtake-away" || secondaryCategory->slug.current == "cateringtake-away") && visible == true])`
  );

  console.log(`\nRecovered Catering & Take-Away notices`);
  console.log(`  Created: ${created}`);
  console.log(`  Patched: ${patched}`);
  console.log(`  Visible imported: ${importedVisible}`);
  console.log(`  Hidden imported: ${importedHidden}`);
  console.log(`  Visible in live Sanity category now: ${sanityCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
