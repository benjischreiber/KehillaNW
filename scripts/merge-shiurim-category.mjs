import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const PRIMARY_ID = "category-shiurim";

const categories = await client.fetch(
  `*[_type == "category" && (
      lower(title) match "shiur*" ||
      slug.current == "shiurim"
    )]{
      _id,
      title,
      "slug": slug.current,
      "parentId": parent._ref
    }`
);

const primary = categories.find((cat) => cat._id === PRIMARY_ID) ||
  categories.find((cat) => cat.slug === "shiurim") ||
  categories[0];

if (!primary) {
  console.log("No Shiurim categories found.");
  process.exit(0);
}

const duplicates = categories.filter((cat) => cat._id !== primary._id);

let movedPrimary = 0;
let movedSecondary = 0;
let reparented = 0;
let deleted = 0;

for (const dup of duplicates) {
  const notices = await client.fetch(
    `*[_type == "notice" && (
        category._ref == $dupId ||
        secondaryCategory._ref == $dupId
      )]{
        _id,
        title,
        "primaryId": category._ref,
        "secondaryId": secondaryCategory._ref
      }`,
    { dupId: dup._id }
  );

  for (const notice of notices) {
    const patch = client.patch(notice._id);
    let changed = false;

    if (notice.primaryId === dup._id) {
      patch.set({
        category: {
          _type: "reference",
          _ref: primary._id,
          _weak: true,
        },
      });
      movedPrimary += 1;
      changed = true;
    }

    if (notice.secondaryId === dup._id) {
      patch.set({
        secondaryCategory: {
          _type: "reference",
          _ref: primary._id,
          _weak: true,
        },
      });
      movedSecondary += 1;
      changed = true;
    }

    if (changed) {
      await patch.commit();
    }
  }

  const childCategories = await client.fetch(
    `*[_type == "category" && parent._ref == $dupId]{_id, title}`,
    { dupId: dup._id }
  );

  for (const child of childCategories) {
    await client
      .patch(child._id)
      .set({
        parent: {
          _type: "reference",
          _ref: primary._id,
          _weak: true,
        },
      })
      .commit();
    reparented += 1;
  }

  const remaining = await client.fetch(
    `count(*[_type == "notice" && (
        category._ref == $dupId ||
        secondaryCategory._ref == $dupId
      )])`,
    { dupId: dup._id }
  );

  if (remaining === 0) {
    await client.delete(dup._id);
    deleted += 1;
  }
}

console.log(
  JSON.stringify(
    {
      primary: { id: primary._id, title: primary.title, slug: primary.slug },
      duplicates: duplicates.map((dup) => ({ id: dup._id, title: dup.title, slug: dup.slug })),
      movedPrimary,
      movedSecondary,
      reparented,
      deleted,
    },
    null,
    2
  )
);
