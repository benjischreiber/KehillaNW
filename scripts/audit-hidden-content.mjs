import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const activeNoticeFilter = `_type == "notice"
  && (!defined(endDate) || endDate > now())
  && (!defined(visible) || visible == true)
  && (
    (
      defined(category->_id)
      && (!defined(category->visible) || category->visible == true)
      && (!defined(category->parent) || !defined(category->parent->visible) || category->parent->visible == true)
    ) || (
      defined(secondaryCategory->_id)
      && (!defined(secondaryCategory->visible) || secondaryCategory->visible == true)
      && (!defined(secondaryCategory->parent) || !defined(secondaryCategory->parent->visible) || secondaryCategory->parent->visible == true)
    )
  )`;

const [hiddenNotices, activeNoticeIds, hiddenCategories, visibleMainNavIds] =
  await Promise.all([
    client.fetch(`*[_type == "notice" && visible == false]{_id,title}`),
    client.fetch(`*[${activeNoticeFilter}]._id`),
    client.fetch(`*[_type == "category" && visible == false]{_id,title}`),
    client.fetch(
      `*[_type == "category" && showInMainNav == true && (!defined(visible) || visible == true)]._id`
    ),
  ]);

const activeNoticeIdSet = new Set(activeNoticeIds);
const visibleMainNavIdSet = new Set(visibleMainNavIds);

const leakedHiddenNotices = hiddenNotices.filter((notice) =>
  activeNoticeIdSet.has(notice._id)
);

const leakedHiddenCategories = hiddenCategories.filter((category) =>
  visibleMainNavIdSet.has(category._id)
);

const report = {
  hiddenNoticeCount: hiddenNotices.length,
  hiddenCategoryCount: hiddenCategories.length,
  leakedHiddenNotices,
  leakedHiddenCategories,
};

console.log(JSON.stringify(report, null, 2));

if (leakedHiddenNotices.length > 0 || leakedHiddenCategories.length > 0) {
  process.exitCode = 1;
}
