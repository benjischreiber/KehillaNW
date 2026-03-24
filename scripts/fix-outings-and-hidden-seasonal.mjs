import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const outingsCategoryId = await client.fetch(
  `*[_type == "category" && slug.current == "outings-activities"][0]._id`
);

if (!outingsCategoryId) {
  throw new Error("Could not find outings-activities category");
}

const entertainmentNotices = await client.fetch(
  `*[_type == "notice" && (!defined(visible) || visible == true) && category->slug.current == "entertainment"]{_id,title}`
);

for (const notice of entertainmentNotices) {
  await client
    .patch(notice._id)
    .set({
      category: {
        _type: "reference",
        _ref: outingsCategoryId,
        _weak: true,
      },
    })
    .commit();
  console.log(`✓ ${notice.title} → outings-activities`);
}

const noticesInHiddenPrimaryCategories = await client.fetch(
  `*[
    _type == "notice"
    && (!defined(visible) || visible == true)
    && defined(category->_id)
    && category->visible == false
  ]{_id,title, "categorySlug": category->slug.current}`
);

for (const notice of noticesInHiddenPrimaryCategories) {
  await client.patch(notice._id).set({ visible: false }).commit();
  console.log(`✓ ${notice.title} hidden because primary category ${notice.categorySlug} is hidden`);
}

console.log(
  JSON.stringify(
    {
      entertainmentMoved: entertainmentNotices.length,
      hiddenCategoryNoticesHidden: noticesInHiddenPrimaryCategories.length,
    },
    null,
    2
  )
);
