import { client } from "@/sanity/lib/client";
import { noticesByCategory } from "@/lib/queries";
import { Notice } from "@/lib/types";
import NoticeCard from "@/components/NoticeCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { groq } from "next-sanity";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await client.fetch<{ title: string }>(
    groq`*[_type == "category" && slug.current == $slug][0]{ title }`,
    { slug }
  ).catch(() => null);
  return {
    title: cat?.title || slug.replace(/-/g, " "),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [notices, catInfo] = await Promise.all([
    client.fetch<Notice[]>(noticesByCategory, { slug }).catch(() => []),
    client.fetch<{ title: string; colour?: string }>(
      groq`*[_type == "category" && slug.current == $slug][0]{ title, colour }`,
      { slug }
    ).catch(() => null),
  ]);

  const title = catInfo?.title || slug.replace(/-/g, " ");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link
        href="/notices"
        className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-gold-600 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All notices
      </Link>

      <h1 className="text-3xl font-bold text-navy-900 mb-8 capitalize">
        {title}
      </h1>

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
