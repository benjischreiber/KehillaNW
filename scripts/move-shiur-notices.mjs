import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const shiurimId = "category-shiurim";
const slugs = [
  "daf-yomi-list-of-local-shiurim",
  "jft-sunday-night-shiurim-for-women",
  "parsha-shiur-with-r-yoni-birnbaum-kinloss",
  "pirkei-avos-shiur-for-boys",
  "reconnect-weekly-tuesday-morning-shiur",
  "shiurim-by-r-y-hartman-shlita",
];

const notices = await client.fetch(
  `*[_type == "notice" && slug.current in $slugs]{
    _id,
    title,
    "slug": slug.current,
    "categoryId": category._ref,
    "secondaryId": secondaryCategory._ref
  }`,
  { slugs }
);

for (const notice of notices) {
  const patch = client.patch(notice._id).set({
    category: {
      _type: "reference",
      _ref: shiurimId,
      _weak: true,
    },
  });

  if (notice.categoryId && notice.categoryId !== shiurimId && !notice.secondaryId) {
    patch.set({
      secondaryCategory: {
        _type: "reference",
        _ref: notice.categoryId,
        _weak: true,
      },
    });
  }

  await patch.commit();
  console.log(`✓ ${notice.title}`);
}

const result = await client.fetch(
  `*[_type == "notice" && slug.current in $slugs] | order(title asc){
    title,
    "slug": slug.current,
    "category": category->title,
    "secondary": secondaryCategory->title
  }`,
  { slugs }
);

console.log(JSON.stringify(result, null, 2));
