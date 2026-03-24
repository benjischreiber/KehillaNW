import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const seasonalChildren = [
  { title: "Rosh Hashana", slug: "rosh-hashana", order: 10 },
  { title: "Yom Kippur", slug: "yom-kippur", order: 20 },
  { title: "Sukkos", slug: "sukkos", order: 30 },
  { title: "Simchas Torah", slug: "simchas-torah", order: 40 },
  { title: "Chanukah", slug: "chanukah", order: 50 },
  { title: "Tu B'Shvat", slug: "tu-bshvat", order: 60 },
  { title: "Purim", slug: "purim", order: 70 },
  { title: "Pesach", slug: "pesach", order: 80 },
  { title: "Lag BaOmer", slug: "lag-baomer", order: 90 },
  { title: "Shavuos", slug: "shavuos", order: 100 },
  { title: "Tisha B'Av", slug: "tisha-bav", order: 110 },
  { title: "Yom HaShoah", slug: "yom-hashoah", order: 120 },
];

async function main() {
  const seasonalId = "category-seasonal";

  await client.createOrReplace({
    _id: seasonalId,
    _type: "category",
    title: "Seasonal",
    slug: { _type: "slug", current: "seasonal" },
    colour: "orange",
    showInMainNav: true,
    order: 1.5,
    visible: true,
  });

  for (const item of seasonalChildren) {
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]{_id, title, slug, colour, showInMainNav, visible}`,
      { slug: item.slug }
    );

    const doc = {
      _id: existing?._id || `category-${item.slug}`,
      _type: "category",
      title: item.title,
      slug: { _type: "slug", current: item.slug },
      parent: { _type: "reference", _ref: seasonalId },
      colour: "orange",
      showInMainNav: false,
      order: item.order,
      visible: existing?.visible ?? false,
    };

    await client.createOrReplace(doc);
    console.log(`✓ ${item.title}`);
  }

  console.log("Seasonal categories synced.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
