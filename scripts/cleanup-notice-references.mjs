import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sn3t47dp",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function makeWeakReference(ref) {
  if (!ref?._ref) return null;
  return {
    _type: "reference",
    _ref: ref._ref,
    _weak: true,
  };
}

async function main() {
  const categoryIds = new Set(
    await client.fetch(`*[_type == "category"]._id`)
  );

  const notices = await client.fetch(`
    *[_type == "notice"]{
      _id,
      title,
      visible,
      category,
      secondaryCategory
    }
  `);

  let cleanedRefs = 0;
  let hidOrphans = 0;
  let removedBrokenRefs = 0;

  for (const notice of notices) {
    const hasPrimary = !!notice.category?._ref;
    const hasSecondary = !!notice.secondaryCategory?._ref;
    const primaryValid = hasPrimary && categoryIds.has(notice.category._ref);
    const secondaryValid = hasSecondary && categoryIds.has(notice.secondaryCategory._ref);

    const patch = client.patch(notice._id);
    let changed = false;

    if (primaryValid) {
      const normalized = makeWeakReference(notice.category);
      if (
        notice.category._type !== "reference" ||
        notice.category._weak !== true ||
        notice.category._strengthenOnPublish
      ) {
        patch.set({ category: normalized });
        cleanedRefs += 1;
        changed = true;
      }
    } else if (hasPrimary) {
      patch.unset(["category"]);
      removedBrokenRefs += 1;
      changed = true;
    }

    if (secondaryValid) {
      const normalized = makeWeakReference(notice.secondaryCategory);
      if (
        notice.secondaryCategory._type !== "reference" ||
        notice.secondaryCategory._weak !== true ||
        notice.secondaryCategory._strengthenOnPublish
      ) {
        patch.set({ secondaryCategory: normalized });
        cleanedRefs += 1;
        changed = true;
      }
    } else if (hasSecondary) {
      patch.unset(["secondaryCategory"]);
      removedBrokenRefs += 1;
      changed = true;
    }

    const stillHasValidCategory = primaryValid || secondaryValid;
    if (!stillHasValidCategory && notice.visible !== false) {
      patch.set({ visible: false });
      hidOrphans += 1;
      changed = true;
    }

    if (changed) {
      await patch.commit();
      console.log(`✓ Cleaned ${notice.title}`);
    }
  }

  console.log("");
  console.log(JSON.stringify({
    cleanedRefs,
    removedBrokenRefs,
    hidOrphans,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
