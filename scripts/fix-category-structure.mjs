import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function upsertCategory(id, fields) {
  const existing = await client.fetch(`*[_id == $id][0]{_id}`, { id });
  const doc = { _id: id, _type: "category", ...fields };
  if (existing?._id) {
    await client.createOrReplace(doc);
  } else {
    await client.create(doc);
  }
}

async function main() {
  await upsertCategory("category-government", {
    title: "Government",
    slug: { _type: "slug", current: "government" },
    colour: "blue",
    showInMainNav: true,
    order: 1,
    visible: true,
  });

  await upsertCategory("category-seasonal", {
    title: "Seasonal",
    slug: { _type: "slug", current: "seasonal" },
    colour: "orange",
    showInMainNav: true,
    order: 1.5,
    visible: true,
  });

  await upsertCategory("category-support", {
    title: "Support",
    slug: { _type: "slug", current: "support" },
    colour: "green",
    showInMainNav: true,
    order: 2,
    visible: true,
  });

  await upsertCategory("category-shopping", {
    title: "Shopping",
    slug: { _type: "slug", current: "shopping" },
    colour: "purple",
    showInMainNav: true,
    order: 3,
    visible: true,
  });

  await upsertCategory("category-education", {
    title: "Education",
    slug: { _type: "slug", current: "education" },
    colour: "orange",
    showInMainNav: true,
    order: 4,
    visible: true,
  });

  await upsertCategory("category-community", {
    title: "Community",
    slug: { _type: "slug", current: "community" },
    colour: "teal",
    showInMainNav: true,
    order: 5,
    visible: true,
  });

  await upsertCategory("category-entertainment", {
    title: "Entertainment",
    slug: { _type: "slug", current: "entertainment" },
    colour: "rose",
    showInMainNav: true,
    order: 6,
    visible: true,
  });

  await upsertCategory("category-outings-activities", {
    title: "Outings & Activities",
    slug: { _type: "slug", current: "outings-activities" },
    colour: "rose",
    parent: { _type: "reference", _ref: "category-entertainment" },
    showInMainNav: false,
    order: 10,
    visible: true,
  });

  await upsertCategory("category-israel", {
    title: "Israel",
    slug: { _type: "slug", current: "israel" },
    colour: "blue",
    parent: { _type: "reference", _ref: "category-government" },
    showInMainNav: false,
    order: 20,
    visible: true,
  });

  await client.patch("030de75d-dbb7-4257-9fe7-d57f7811f736").set({
    parent: { _type: "reference", _ref: "category-education" },
    order: 120,
    visible: true,
  }).commit();

  await client.patch("category-useful-info").set({
    showInMainNav: false,
    visible: false,
  }).commit();

  console.log("Category structure fixed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
