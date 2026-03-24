import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const LOCAL_SHOPS_SLUGS = [
  "b-kosher-home-delivery",
  "blanket-boutique",
  "gifts-with-jewish-theme",
  "handy-man-alin-straton",
  "kosher-outlet-opening-hours",
  "onallie-edgware-gift-shop",
  "shutlers-bridge-lane-nw11",
  "shuttlers",
  "vive-vera-herbal-teas-essential-oils",
  "voucher-gallery",
];

const CATERING_SLUGS = [
  "bitebox",
  "delicatessen-kosher-restaurant",
  "eli-s-pizza",
  "manna-deli",
  "moss-and-maple",
  "paprika-deli",
  "pourtoi-artisan-gluten-free",
  "reubens-cafe-central-london",
  "schnitzel-bar",
  "shefa-mehadrin",
];

const RECIPE_SLUGS = [
  "easy-peasy-flat-bread",
  "klbd-vegetarian-cookbook",
  "kokosh-cake-ta-am",
  "kosher-com-free-pesach-digital-cookbook",
  "lunchbox-recipes-for-children",
];

async function getCategoryId(slug) {
  return client.fetch(`*[_type == "category" && slug.current == $slug][0]._id`, { slug });
}

async function patchPrimaryCategory(slugs, categoryId) {
  const notices = await client.fetch(
    `*[_type == "notice" && slug.current in $slugs]{_id,title,"slug":slug.current}`,
    { slugs }
  );

  let updated = 0;
  for (const notice of notices) {
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
    console.log(`✓ ${notice.title} → primary ${categoryId}`);
  }

  return updated;
}

async function patchSecondaryCategory(slug, categoryId) {
  const notice = await client.fetch(
    `*[_type == "notice" && slug.current == $slug][0]{_id,title}`,
    { slug }
  );
  if (!notice?._id) return 0;

  await client
    .patch(notice._id)
    .set({
      secondaryCategory: {
        _type: "reference",
        _ref: categoryId,
        _weak: true,
      },
    })
    .commit();
  console.log(`✓ ${notice.title} → secondary ${categoryId}`);
  return 1;
}

const ids = {
  localShops: await getCategoryId("local-shops"),
  catering: await getCategoryId("cateringtake-away"),
  recipes: await getCategoryId("recipes"),
  gemachim: await getCategoryId("gemachim"),
  halacha: await getCategoryId("halacha"),
};

if (!ids.localShops || !ids.catering || !ids.recipes || !ids.gemachim || !ids.halacha) {
  throw new Error("Missing one or more required category ids");
}

const localUpdated = await patchPrimaryCategory(LOCAL_SHOPS_SLUGS, ids.localShops);
const cateringUpdated = await patchPrimaryCategory(
  CATERING_SLUGS.filter((slug) => slug !== "pourtoi-artisan-gluten-free"),
  ids.catering
);
const cateringSecondaryUpdated = await patchSecondaryCategory("pourtoi-artisan-gluten-free", ids.catering);
const recipeUpdated = await patchPrimaryCategory(RECIPE_SLUGS, ids.recipes);

await client.patch("category-recipes").set({ visible: true }).commit();
console.log("✓ Recipes category made visible");

await client.patch("category-halacha").set({ visible: false }).commit();
console.log("✓ Halacha category hidden");

await client
  .patch("category-gemachim")
  .set({
    title: "Gemach",
    showInMainNav: true,
    visible: true,
    order: 5.5,
  })
  .commit();
console.log("✓ Gemach added to main navigation");

await client.patch("notice-kosher-outdoor-dining").set({ visible: false }).commit();
console.log("✓ Kosher Outdoor Dining hidden");

console.log(
  JSON.stringify(
    {
      localUpdated,
      cateringUpdated,
      cateringSecondaryUpdated,
      recipeUpdated,
    },
    null,
    2
  )
);
