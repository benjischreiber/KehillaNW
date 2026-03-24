import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

await client.patch("category-parsha").set({ visible: false }).commit();
console.log("✓ Parsha hidden");

await client.patch("category-work-avenue").set({ visible: false }).commit();
console.log("✓ Work Avenue hidden");

await client.patch("category-entertainment").set({ title: "Outings & Activities" }).commit();
console.log("✓ Entertainment renamed to Outings & Activities");
