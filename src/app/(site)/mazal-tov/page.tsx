import { client } from "@/sanity/lib/client";
import { allMazalTovQuery } from "@/lib/queries";
import { MazalTov } from "@/lib/types";
import { formatDate, splitAnnouncements } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 300;

export const metadata = {
  title: "Mazal Tov",
};

export default async function MazalTovPage() {
  const items = await client.fetch<MazalTov[]>(allMazalTovQuery).catch(() => []);
  const announcements = items.flatMap((item) =>
    splitAnnouncements(item.content).map((content, index) => ({
      key: `${item._id}-${index}`,
      content,
      publishDate: item.publishDate,
    }))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-700">
            Community Celebrations
          </p>
          <h1 className="text-3xl font-bold text-navy-900">
            Mazal <span className="text-gold-500">Tov</span>
          </h1>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
        >
          ← Back home
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
          <p className="text-gray-500 font-semibold text-lg">No Mazal Tov announcements yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {announcements.map((item) => (
              <div key={item.key} className="px-6 py-5">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{item.content}</p>
                {item.publishDate && (
                  <p className="text-sm text-gray-400 mt-3">{formatDate(item.publishDate)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
