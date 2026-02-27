import { client } from "@/sanity/lib/client";
import { allNoticesQuery, mainNavCategoriesQuery } from "@/lib/queries";
import { Notice, Category } from "@/lib/types";
import NoticeCard from "@/components/NoticeCard";
import Link from "next/link";
import { groq } from "next-sanity";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getNotices(q?: string, category?: string) {
  if (q) {
    return client.fetch<Notice[]>(
      groq`*[_type == "notice" && (title match $q || summary match $q) && (!defined(endDate) || endDate > now())]
      | order(publishDate desc)[0..47]{
        _id, title, slug, summary, publishDate, featured, isEvent, externalLink, image,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "categoryColour": category->colour,
      }`,
      { q: `*${q}*` }
    ).catch(() => []);
  }
  if (category) {
    return client.fetch<Notice[]>(
      groq`*[_type == "notice" && (category->slug.current == $cat || secondaryCategory->slug.current == $cat) && (!defined(endDate) || endDate > now())]
      | order(publishDate desc)[0..47]{
        _id, title, slug, summary, publishDate, featured, isEvent, externalLink, image,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "categoryColour": category->colour,
      }`,
      { cat: category }
    ).catch(() => []);
  }
  return client.fetch<Notice[]>(allNoticesQuery).catch(() => []);
}

export default async function NoticesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, category } = params;
  const [notices, categories] = await Promise.all([
    getNotices(q, category),
    client.fetch<Category[]>(mainNavCategoriesQuery).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">
          {q ? (
            <>Search: <span className="text-gold-500">{q}</span></>
          ) : category ? (
            <>Category: <span className="text-gold-500 capitalize">{category.replace(/-/g, " ")}</span></>
          ) : (
            <>All <span className="text-gold-500">Notices</span></>
          )}
        </h1>
        {(q || category) && (
          <Link href="/notices" className="text-sm text-navy-700 hover:text-gold-600 font-semibold transition-colors">
            ← All notices
          </Link>
        )}
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && !q && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/notices"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !category ? "bg-navy-900 text-white" : "bg-white text-navy-700 border border-gray-200 hover:border-navy-400"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug.current}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                category === cat.slug.current
                  ? "bg-navy-900 text-white"
                  : "bg-white text-navy-700 border border-gray-200 hover:border-navy-400"
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.title}
            </Link>
          ))}
        </div>
      )}

      {notices.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
          <p className="text-gray-500 font-semibold text-lg">No notices found</p>
          {q && <p className="text-gray-400 text-sm mt-2">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} size="lg" />
          ))}
        </div>
      )}
    </div>
  );
}
