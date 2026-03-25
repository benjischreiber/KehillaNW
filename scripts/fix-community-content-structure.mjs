import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CATEGORY_SLUG_TO_NOTICE_SLUGS = {
  kashrus: [
    "allergy-alert-gluten",
    "beechams-powders-sachets-dairy",
    "bendicks-are-klbd-certified",
    "bendicks-mints",
    "cadbury-bournville-giant-buttons",
    "chewing-gum-kashrus-alert",
    "daddies-brown-sauce",
    "ddavp-melts-and-desmomelt-tablets",
    "ella-s-kitchen-baby-cereals",
    "elite-product-recall-april-2022",
    "heinz-spicy-sauce",
    "hula-hoops-original-are-parev",
    "israeli-potatoes",
    "j2o-fruit-ice-lollies",
    "kashrus-alert-ella-s-kitchen",
    "kashrus-alert-recall-olam-foods-28-august",
    "kashrus-alert-be-fruitful-broccoli",
    "kashrus-information-from-manchester-beis-din",
    "kashrus-notice-wrigley-s",
    "kettle-chips-klbd",
    "kingsmill-products-ska",
    "kosher-guide-october-update-2022",
    "kosher-marmite",
    "lemsip-max-all-in-one-lemon-sachets-dairy",
    "lotus-biscoff-approved-by-ska",
    "love-corn-milk-chocolate-and-sea-salt",
    "m-s-dairy-free-cheese",
    "macain-products-no-longer-approved-by-klbd",
    "new-filtering-facility-on-isitkosher-uk",
    "radish-infestation-alert",
    "really-jewish-food-guide-2025-update",
    "really-jewish-food-guide-june-update",
    "robinsons-wonderfully-fruity-twist",
    "rowntrees-jelly-tots-not-kosher",
    "rowntrees-products-removed-from-list",
    "rowse-honey",
    "ska-alert-tesco-broccoli-update",
    "ska-kashrus-product-search",
    "ska-whats-app-updates",
    "ska-approves-labeled-mccains-products",
  ],
  halacha: [
    "federation-shaila-text",
    "find-a-dayan",
    "halochos-of-fruits-and-vegetables",
    "licensed-sofrim",
    "maasertext-federation",
    "mechiras-keylim-update-from-the-federation",
    "new-federation-maasertext-number",
  ],
  support: [
    "chaveirim-north-west-london",
    "emergency-nhs-prescriptions",
    "list-of-local-support-organisations",
    "medical-forms-by-dr-opat",
    "misaskim-please-help-us-to-help-you",
    "paperweight-helpline",
  ],
  organisations: [
    "donatify",
    "edgware-community-website",
    "kehilla-cost-of-living-study",
    "kol-mevaser",
    "nw-london-community-calendar",
    "nw-london-shidduch-initiative",
    "one-kind-word-updates",
  ],
  "work-avenue": [
    "richard-mintz-bursary-fund",
  ],
  "business-directory": [
    "english-hebrew-translator",
    "professional-keyboard-player",
  ],
  "local-shops": [
    "deliveroo",
    "ding-kosher-food-delivery-service",
    "personalised-gifts",
    "pomegranate-juicery",
  ],
  israel: [
    "british-citizens-in-israel",
    "donate-to-israel-with-aac",
    "food-for-families-of-soliders-in-the-idf",
    "get-matched-with-an-idf-soldier",
    "hug-in-a-box",
    "letters-for-israel",
    "new-rules-on-entry-to-israel-january-2025",
    "our-home-is-your-home",
    "pen-pals-with-israeli-families",
    "recording-of-mizrachi-chizuk-event",
    "recording-of-unity-event-at-kinloss",
  ],
};

async function getCategoryId(slug) {
  return client.fetch(`*[_type == "category" && slug.current == $slug][0]._id`, { slug });
}

async function patchPrimaryCategory(slugs, categoryId) {
  const notices = await client.fetch(
    `*[_type == "notice" && slug.current in $slugs]{_id,title,"slug":slug.current,"currentCategoryId":category._ref}`,
    { slugs }
  );

  let updated = 0;
  for (const notice of notices) {
    if (notice.currentCategoryId === undefined) continue;
    if (notice.currentCategoryId === null || notice.currentCategoryId === "" || notice.currentCategoryId !== categoryId) {
      await client
        .patch(notice._id)
        .set({
          category: {
            _type: "reference",
            _ref: categoryId,
            _weak: true,
          },
        })
        .commit();
      updated += 1;
      console.log(`✓ ${notice.title} → ${categoryId}`);
    }
  }

  return updated;
}

const categoryIds = {};
for (const slug of Object.keys(CATEGORY_SLUG_TO_NOTICE_SLUGS)) {
  categoryIds[slug] = await getCategoryId(slug);
  if (!categoryIds[slug]) {
    throw new Error(`Missing category id for ${slug}`);
  }
}

const summary = {};
for (const [categorySlug, noticeSlugs] of Object.entries(CATEGORY_SLUG_TO_NOTICE_SLUGS)) {
  summary[categorySlug] = await patchPrimaryCategory(noticeSlugs, categoryIds[categorySlug]);
}

console.log(JSON.stringify(summary, null, 2));
