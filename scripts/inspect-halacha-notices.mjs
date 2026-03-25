import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const rows = await client.fetch(`
  *[
    _type == "notice"
    && category->slug.current == "support"
    && slug.current in [
      "birchas-ha-ilonos-2026",
      "birchas-ha-ilonos-2025",
      "checking-for-bugs-poster-klbd-old",
      "federation-shaila-text",
      "find-a-dayan",
      "halachos-of-taanis-esther",
      "hilchos-pesach-eisikovits",
      "holiday-text-shaila-line",
      "klbd-poster-checking-fruits-and-vegetables",
      "licensed-sofrim",
      "maasertext-federation",
      "mechiras-keylim-update-from-the-federation",
      "new-federation-maasertext-number",
      "ovens-on-shabbos-federation-05-02-21",
      "parshas-hamon-27th-january-2026",
      "pesach-guidance-from-r-bixenspanner",
      "remember-to-say-vesain-tal-umatar",
      "shemitta-kislev-update",
      "shemitta-updates-federation",
      "tahareinu-new-london-number",
      "tefilla-of-the-shelah-hakadosh",
      "teruma-and-maaser-klbd"
    ]
  ] | order(title asc) {
    title,
    "slug": slug.current,
    oldAdminId,
    oldAdminCategoryId,
    "category": category->title,
    "secondaryCategory": secondaryCategory->title
  }
`);

console.log(JSON.stringify(rows, null, 2));
