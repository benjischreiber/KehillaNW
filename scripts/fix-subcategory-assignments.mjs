import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const beisTitles = [
  "Being in Awe of the Beis HaMikdash",
  "Guarding the Beis Hamikdash Quiz",
  "Lechen HaPanim Part 2",
  "Miracles In the Beis HaMikdash",
  "Offering The Ketores קטֹרת",
  "The Temple Mount & Courtyard",
  "Tour of the Beis Hamikdash",
];

async function main() {
  const beisCategoryId = "category-beis-hamikdosh";

  const notices = await client.fetch(
    `*[_type == "notice" && title in $titles]{_id,title,"categorySlug":category->slug.current}`,
    { titles: beisTitles }
  );

  for (const notice of notices) {
    if (notice.categorySlug === "beis-hamikdosh") continue;

    await client.patch(notice._id).set({
      category: { _type: "reference", _ref: beisCategoryId, _weak: true },
    }).commit();

    console.log(`✓ Refiled ${notice.title}`);
  }

  const onlineEventsCats = await client.fetch(
    `*[_type == "category" && (slug.current == "online-events" || title == "Online Events & Podcasts")]{
      _id,title,visible
    }`
  );

  for (const category of onlineEventsCats) {
    if (category.visible === false) continue;
    await client.patch(category._id).set({ visible: false }).commit();
    console.log(`✓ Hid ${category.title}`);
  }

  console.log("Subcategory assignments fixed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
