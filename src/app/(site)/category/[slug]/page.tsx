import { client } from "@/sanity/lib/client";
import { noticesByCategory, categoryWithParent, subcategoriesForParent } from "@/lib/queries";
import { Notice } from "@/lib/types";
import { categoryColourMap, categoryColourTintMap } from "@/lib/types";
import NoticeCard from "@/components/NoticeCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { groq } from "next-sanity";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

interface CatInfo {
  _id: string;
  title: string;
  colour?: string;
  parentSlug?: string;
  parentTitle?: string;
  parentColour?: string;
}

interface SubCat {
  _id: string;
  title: string;
  colour?: string;
  slug: string;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await client
    .fetch<{ title: string }>(
      groq`*[_type == "category" && slug.current == $slug][0]{ title }`,
      { slug }
    )
    .catch(() => null);
  return {
    title: cat?.title || slug.replace(/-/g, " "),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [notices, catInfo] = await Promise.all([
    client.fetch<Notice[]>(noticesByCategory, { slug }).catch(() => []),
    client.fetch<CatInfo>(categoryWithParent, { slug }).catch(() => null),
  ]);

  const isSubcategory = !!catInfo?.parentSlug;
  const parentSlugForSubs = isSubcategory ? catInfo!.parentSlug! : slug;

  const subcategories = await client
    .fetch<SubCat[]>(subcategoriesForParent, { parentSlug: parentSlugForSubs })
    .catch(() => []);

  const title = catInfo?.title || slug.replace(/-/g, " ");
  const colour = catInfo?.colour || catInfo?.parentColour || "blue";
  const solidClass = categoryColourMap[colour] || "bg-navy-700";

  const allHref = isSubcategory ? `/category/${catInfo!.parentSlug}` : `/category/${slug}`;
  const allLabel = isSubcategory ? `All ${catInfo!.parentTitle}` : `All ${title}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-gold-600 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All notices
        </Link>
        {isSubcategory && (
          <>
            <span className="text-gray-400">/</span>
            <Link
              href={`/category/${catInfo!.parentSlug}`}
              className="text-sm text-navy-600 hover:text-gold-600 font-semibold transition-colors"
            >
              {catInfo!.parentTitle}
            </Link>
          </>
        )}
      </div>

      {/* Category heading */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`inline-block w-3 h-8 rounded-full ${solidClass}`} />
        <h1 className="text-3xl font-bold text-navy-900">{title}</h1>
        <span className="text-sm text-gray-400 font-medium">({notices.length} notices)</span>
      </div>

      {/* Subcategory pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={allHref}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              !isSubcategory || slug === parentSlugForSubs
                ? `${solidClass} text-white border-transparent`
                : categoryColourTintMap[colour] || "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {allLabel}
          </Link>
          {subcategories.map((sub) => {
            const subColour = sub.colour || colour;
            const isActiveSub = slug === sub.slug;
            return (
              <Link
                key={sub._id}
                href={`/category/${sub.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                  isActiveSub
                    ? `${categoryColourMap[subColour] || solidClass} text-white border-transparent`
                    : categoryColourTintMap[subColour] || "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      )}

      {/* Notices grid */}
      {notices.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
          <p className="text-gray-500 font-semibold text-lg">No notices in this category yet</p>
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
