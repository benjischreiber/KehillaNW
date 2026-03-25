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
const ROOT_MANAGER_URL = `${BASE}/admin/website_content_articles_manager.php`;
const MANAGER_URL = `${BASE}/admin/website_content_articles_manager.php?parentId=`;
const LIST_URL = `${BASE}/admin/website_content_articles_value_list.php?listid=`;
const EDIT_URL = `${BASE}/admin/website_content_articles_value_edit.php?id=`;
const CATEGORY_PARENTS = [1, 2, 3, 4, 5, 6];
const TOP_LEVEL_CATEGORY_IDS = {
  1: "category-government",
  2: "category-support",
  3: "category-shopping",
  4: "category-education",
  5: "category-community",
  6: "category-entertainment",
  49: "category-recipes",
};
const COLOUR_BY_ROOT = {
  1: "blue",
  2: "green",
  3: "purple",
  4: "orange",
  5: "teal",
  6: "rose",
  49: "purple",
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeText(text) {
  return (text || "")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

function textKey(text) {
  return normalizeText(text).replace(/[^a-z0-9]+/g, "");
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
  const raw = readFileSync(path, "utf8");
  const cookies = [];
  for (const line of raw.split("\n")) {
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
  const headers = { "User-Agent": "Mozilla/5.0 (compatible; KehillaNW-hidden-recovery/1.0)" };
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

function parseManagerRows(html, parentId = 0) {
  const rows = [...html.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td><a id="Visible\d+" class="toggleField (tick|cross)"/g)];
  return rows.map((match) => ({
    id: Number(match[1]),
    title: stripTags(match[2]).replace(/\u00a0/g, " ").trim(),
    items: Number(stripTags(match[3]).trim() || 0),
    visible: match[4] === "tick",
    parentId,
  }));
}

function parseListRows(html) {
  const rows = [...html.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>[\s\S]*?<\/td>\s*<td>[\s\S]*?<\/td>\s*<td><a id="Visible\d+" class="toggleField (tick|cross)"/g)];
  return rows.map((match) => ({
    id: Number(match[1]),
    title: stripTags(match[2]).replace(/\u00a0/g, " ").trim(),
    visible: match[3] === "tick",
  }));
}

function parseSelectedOption(html, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const selectMatch = html.match(new RegExp(`<select name="${escaped}"[\\s\\S]*?<\\/select>`));
  if (!selectMatch) return { value: "", text: "" };
  const selectedMatch = selectMatch[0].match(/<option value="([^"]*)"\s+selected="selected"\s*>([\s\S]*?)<\/option>/i);
  return selectedMatch
    ? { value: selectedMatch[1], text: stripTags(selectedMatch[2]).trim() }
    : { value: "", text: "" };
}

function parseInputValue(html, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`name="${escaped}" value="([\\s\\S]*?)"`));
  return match ? decodeHtml(match[1]).trim() : "";
}

function parseTextareaValue(html, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<textarea[^>]*name="${escaped}"[^>]*>([\\s\\S]*?)<\\/textarea>`));
  return match ? decodeHtml(match[1]).trim() : "";
}

function parseChecked(html, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<input[^>]*name="${escaped}"[^>]*>`, "i"));
  return Boolean(match && /\bchecked\b/i.test(match[0]));
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value).toISOString();
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, dd, mm, yyyy] = slash;
    return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T12:00:00Z`).toISOString();
  }
  return null;
}

function parseEditPage(html, id) {
  return {
    id,
    title: parseInputValue(html, "fields[Title]"),
    filename: parseInputValue(html, "fields[ArticleFilename]"),
    externalLink: parseInputValue(html, "fields[ArticleLink]"),
    summary: parseTextareaValue(html, "fields[Summary]"),
    contentHtml: parseTextareaValue(html, "fields[Content]"),
    articleDate: parseInputValue(html, "fields[ArticleDate]"),
    endDate: parseInputValue(html, "fields[EndDate]"),
    createdDateTime: parseInputValue(html, "fields[CreatedDateTime]"),
    primaryArea: parseSelectedOption(html, "fields[ArticleAreaID]"),
    secondArea: parseSelectedOption(html, "fields[ArticleAreaID2]"),
    featured: parseChecked(html, "fields[Featured]"),
    isEvent: parseChecked(html, "fields[IsEvent]"),
    visible: parseChecked(html, "fields[Visible]"),
  };
}

async function fetchExistingCategories() {
  const rows = await client.fetch(`*[_type == "category"]{_id,title,"slug":slug.current,"parentId":parent._ref,visible}`);
  return rows;
}

async function fetchExistingNotices() {
  const rows = await client.fetch(`*[_type == "notice"]{_id,title,"slug":slug.current}`);
  const bySlug = new Map();
  const byTitle = new Map();
  for (const row of rows) {
    if (row.slug) bySlug.set(row.slug, row);
    if (row.title) byTitle.set(normalizeText(row.title), row);
  }
  return { bySlug, byTitle };
}

function categorySlugFromExisting(existingCategories, title, parentRef) {
  return existingCategories.find(
    (row) =>
      normalizeText(row.title) === normalizeText(title) &&
      (row.parentId || null) === (parentRef || null)
  );
}

async function main() {
  const cookies = parseCookieFile("/tmp/knw-admin-cookies.txt");

  const categoriesByOldId = new Map();
  const rootHtml = await fetchText(ROOT_MANAGER_URL, cookies);
  for (const row of parseManagerRows(rootHtml, 0)) {
    categoriesByOldId.set(row.id, row);
  }
  console.log(`Loaded root categories: ${categoriesByOldId.size}`);

  for (const parentId of CATEGORY_PARENTS) {
    const html = await fetchText(`${MANAGER_URL}${parentId}`, cookies);
    for (const row of parseManagerRows(html, parentId)) {
      categoriesByOldId.set(row.id, row);
    }
    console.log(`Loaded child categories for parent ${parentId}`);
  }

  const existingCategories = await fetchExistingCategories();
  const usedSlugs = new Set(existingCategories.map((row) => row.slug).filter(Boolean));
  const ensuredCategoryIds = new Map();

  async function ensureCategory(oldCategoryId) {
    if (!oldCategoryId) return null;
    if (ensuredCategoryIds.has(oldCategoryId)) return ensuredCategoryIds.get(oldCategoryId);

    if (TOP_LEVEL_CATEGORY_IDS[oldCategoryId]) {
      ensuredCategoryIds.set(oldCategoryId, TOP_LEVEL_CATEGORY_IDS[oldCategoryId]);
      return TOP_LEVEL_CATEGORY_IDS[oldCategoryId];
    }

    const oldCategory = categoriesByOldId.get(Number(oldCategoryId));
    if (!oldCategory) return null;

    const parentRef = oldCategory.parentId ? await ensureCategory(oldCategory.parentId) : null;
    const matched = categorySlugFromExisting(existingCategories, oldCategory.title, parentRef);
    if (matched) {
      if (matched.visible !== oldCategory.visible) {
        await client.patch(matched._id).set({ visible: oldCategory.visible }).commit();
      }
      ensuredCategoryIds.set(oldCategory.id, matched._id);
      return matched._id;
    }

    let slug = slugify(oldCategory.title);
    if (!slug || usedSlugs.has(slug)) {
      slug = `legacy-${slug || "category"}-${oldCategory.id}`;
    }
    usedSlugs.add(slug);

    const doc = {
      _id: `legacy-category-${oldCategory.id}`,
      _type: "category",
      title: oldCategory.title,
      slug: { _type: "slug", current: slug },
      colour: COLOUR_BY_ROOT[oldCategory.parentId || oldCategory.id] || "blue",
      showInMainNav: false,
      order: oldCategory.id,
      visible: oldCategory.visible,
    };
    if (parentRef) {
      doc.parent = { _type: "reference", _ref: parentRef };
    }

    await client.createOrReplace(doc);
    existingCategories.push({
      _id: doc._id,
      title: doc.title,
      slug,
      parentId: parentRef,
      visible: doc.visible,
    });
    ensuredCategoryIds.set(oldCategory.id, doc._id);
    return doc._id;
  }

  // Ensure all hidden categories exist and stay hidden.
  let hiddenCategoriesEnsured = 0;
  for (const oldCategory of categoriesByOldId.values()) {
    if (!oldCategory.visible) {
      await ensureCategory(oldCategory.id);
      hiddenCategoriesEnsured += 1;
    }
  }
  console.log(`Ensured hidden categories: ${hiddenCategoriesEnsured}`);

  const { bySlug, byTitle } = await fetchExistingNotices();

  let created = 0;
  let patched = 0;
  let processedHiddenRows = 0;

  for (const oldCategory of categoriesByOldId.values()) {
    if (!oldCategory.items) continue;

    const listHtml = await fetchText(`${LIST_URL}${oldCategory.id}&page=all`, cookies);
    const rows = parseListRows(listHtml);
    const categoryHidden = !oldCategory.visible;
    const targetRows = rows.filter((row) => categoryHidden || !row.visible);

    if (targetRows.length === 0) continue;
    console.log(`Processing ${oldCategory.title} (${oldCategory.id}) — ${targetRows.length} hidden/admin-only notices`);

    for (const row of targetRows) {
      processedHiddenRows += 1;
      const editHtml = await fetchText(`${EDIT_URL}${row.id}`, cookies);
      const data = parseEditPage(editHtml, row.id);

      const slug = slugify(data.filename?.replace(/\.html$/i, "") || data.title);
      const existing = bySlug.get(slug) || byTitle.get(normalizeText(data.title));
      const primaryCategoryId = await ensureCategory(Number(data.primaryArea.value) || oldCategory.id);
      const secondaryCategoryId = data.secondArea.value
        ? await ensureCategory(Number(data.secondArea.value))
        : null;
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
        category: primaryCategoryId
          ? { _type: "reference", _ref: primaryCategoryId, _weak: true }
          : undefined,
        secondaryCategory: secondaryCategoryId
          ? { _type: "reference", _ref: secondaryCategoryId, _weak: true }
          : undefined,
        featured: data.featured,
        isEvent: data.isEvent,
        visible: row.visible,
        publishDate,
        endDate: parseDate(data.endDate) || undefined,
        content,
        externalLink: data.externalLink || undefined,
        oldAdminId: String(data.id),
        oldAdminCategoryId: String(oldCategory.id),
      };

      if (existing) {
        await client.patch(existing._id).set(patch).commit();
        patched += 1;
      } else {
        const doc = {
          _id: `notice-${slug}`,
          _type: "notice",
          ...patch,
        };
        await client.create(doc);
        bySlug.set(slug, { _id: doc._id, slug, title: data.title });
        byTitle.set(normalizeText(data.title), { _id: doc._id, slug, title: data.title });
        created += 1;
      }

      if (processedHiddenRows % 25 === 0) {
        console.log(`  Progress: ${processedHiddenRows} notices processed`);
      }
    }
  }

  console.log(JSON.stringify({
    hiddenCategoriesEnsured,
    processedHiddenRows,
    created,
    patched,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
