import fs from "node:fs";
import { createClient } from "@sanity/client";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => line.split(/=(.*)/s).slice(0, 2))
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CATEGORY_MERGES = {
  "category-outings-activities": "category-entertainment",
  "legacy-category-58": "category-gemachim",
  "legacy-category-77": "category-halacha",
  "legacy-category-81": "category-pesach",
  "legacy-category-73": "category-purim",
  "legacy-category-64": "category-chanukah",
  "legacy-category-106": "category-chanukah",
  "legacy-category-105": "category-sukkos",
  "legacy-category-93": "category-shavuos",
  "legacy-category-100": "category-tisha-bav",
  "legacy-category-69": "category-tu-bshvat",
  "legacy-category-91": "category-lag-baomer",
  "legacy-category-52": "category-yom-kippur",
};

const CATEGORY_PATCHES = {
  "category-seasonal": {
    title: "Seasonal",
    visible: true,
    showInMainNav: true,
    order: 1.5,
  },
  "category-pesach": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-purim": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-chanukah": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-rosh-hashana": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-yom-kippur": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-sukkos": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-simchas-torah": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-shavuos": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-lag-baomer": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-tu-bshvat": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-tisha-bav": {
    parent: reference("category-seasonal"),
    visible: true,
    showInMainNav: false,
  },
  "category-outings-activities": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-58": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-77": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-81": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-73": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-64": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-106": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-105": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-93": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-100": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-69": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-91": {
    visible: false,
    showInMainNav: false,
  },
  "legacy-category-52": {
    visible: false,
    showInMainNav: false,
  },
};

function reference(id) {
  return {
    _type: "reference",
    _ref: id,
    _weak: true,
  };
}

async function updateNoticeReferences() {
  const sourceIds = Object.keys(CATEGORY_MERGES);
  const notices = await client.fetch(
    `*[_type == "notice" && (category._ref in $sourceIds || secondaryCategory._ref in $sourceIds)]{
      _id,
      title,
      category,
      secondaryCategory
    }`,
    { sourceIds }
  );

  let touched = 0;

  for (const notice of notices) {
    const patch = client.patch(notice._id);
    let changed = false;

    const nextPrimary = CATEGORY_MERGES[notice.category?._ref];
    const nextSecondary = CATEGORY_MERGES[notice.secondaryCategory?._ref];

    if (nextPrimary && nextPrimary !== notice.category?._ref) {
      patch.set({ category: reference(nextPrimary) });
      changed = true;
    }

    if (nextSecondary && nextSecondary !== notice.secondaryCategory?._ref) {
      patch.set({ secondaryCategory: reference(nextSecondary) });
      changed = true;
    }

    if (changed) {
      await patch.commit();
      touched += 1;
      console.log(`Updated notice refs: ${notice.title}`);
    }
  }

  return touched;
}

async function patchCategories() {
  let touched = 0;

  for (const [categoryId, fields] of Object.entries(CATEGORY_PATCHES)) {
    await client.patch(categoryId).set(fields).commit();
    touched += 1;
    console.log(`Patched category: ${categoryId}`);
  }

  return touched;
}

async function main() {
  if (!env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is required");
  }

  const updatedNotices = await updateNoticeReferences();
  const updatedCategories = await patchCategories();

  console.log("");
  console.log(
    JSON.stringify(
      {
        updatedNotices,
        updatedCategories,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
