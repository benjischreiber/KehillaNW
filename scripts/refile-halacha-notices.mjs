import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CATEGORY_IDS = {
  support: "category-support",
  education: "category-education",
  halacha: "category-halacha",
  kashrus: "category-kashrus",
  pesach: "category-pesach",
  purim: "category-purim",
  women: "category-women",
  parenting: "category-parenting",
};

const NOTICE_TO_CATEGORY = {
  "birchas-ha-ilonos-2025": "halacha",
  "birchas-ha-ilonos-2026": "halacha",
  "checking-for-bugs-poster-klbd-old": "kashrus",
  "federation-shaila-text": "support",
  "find-a-dayan": "support",
  "halachos-of-taanis-esther": "purim",
  "hilchos-pesach-eisikovits": "pesach",
  "holiday-text-shaila-line": "support",
  "klbd-poster-checking-fruits-and-vegetables": "kashrus",
  "licensed-sofrim": "support",
  "maasertext-federation": "support",
  "mechiras-keylim-update-from-the-federation": "support",
  "new-federation-maasertext-number": "support",
  "ovens-on-shabbos-federation-05-02-21": "halacha",
  "parshas-hamon-27th-january-2026": "halacha",
  "pesach-guidance-from-r-bixenspanner": "pesach",
  "remember-to-say-vesain-tal-umatar": "halacha",
  "shemitta-kislev-update": "kashrus",
  "shemitta-updates-federation": "kashrus",
  "tahareinu-new-london-number": "women",
  "tefilla-of-the-shelah-hakadosh": "parenting",
  "teruma-and-maaser-klbd": "kashrus",
};

const slugs = Object.keys(NOTICE_TO_CATEGORY);

const notices = await client.fetch(
  `*[_type == "notice" && slug.current in $slugs]{
    _id,
    title,
    "slug": slug.current,
    "currentCategoryId": category._ref
  }`,
  { slugs }
);

let updated = 0;

for (const notice of notices) {
  const categorySlug = NOTICE_TO_CATEGORY[notice.slug];
  const targetCategoryId = CATEGORY_IDS[categorySlug];
  if (!targetCategoryId) {
    throw new Error(`Missing category id for ${categorySlug}`);
  }

  if (notice.currentCategoryId === targetCategoryId) continue;

  await client.patch(notice._id).set({
    category: {
      _type: "reference",
      _ref: targetCategoryId,
      _weak: true,
    },
  }).commit();

  updated += 1;
  console.log(`✓ ${notice.title} -> ${categorySlug}`);
}

await client.patch(CATEGORY_IDS.halacha).set({
  visible: true,
  parent: {
    _type: "reference",
    _ref: CATEGORY_IDS.education,
    _weak: true,
  },
  showInMainNav: false,
}).commit();

const summary = await client.fetch(
  `{
    "supportChildren": *[_type == "category" && parent._ref == $supportId && (!defined(visible) || visible == true)]{title, "slug": slug.current},
    "educationChildren": *[_type == "category" && parent._ref == $educationId && (!defined(visible) || visible == true)]{title, "slug": slug.current}
  }`,
  { supportId: CATEGORY_IDS.support, educationId: CATEGORY_IDS.education }
);

console.log(JSON.stringify({
  updated,
  summary,
}, null, 2));
