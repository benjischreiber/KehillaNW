"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice, categoryColourTextMap } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";

interface FeaturedCarouselProps {
  notices: Notice[];
}

export default function FeaturedCarousel({ notices }: FeaturedCarouselProps) {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const totalPages = Math.ceil(notices.length / perPage);
  const visible = notices.slice(page * perPage, page * perPage + perPage);

  if (!notices.length) return null;

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900">
            Featured <span className="text-gold-500">Notices</span>
          </h2>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-full bg-navy-50 hover:bg-navy-100 disabled:opacity-30 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-navy-900" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 rounded-full bg-navy-50 hover:bg-navy-100 disabled:opacity-30 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 text-navy-900" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visible.map((notice) => {
            const href = notice.externalLink || `/notices/${notice.slug?.current}`;
            const isExternal = !!notice.externalLink;
            const badgeClass =
              notice.categoryColour && categoryColourTextMap[notice.categoryColour]
                ? categoryColourTextMap[notice.categoryColour]
                : "text-navy-700 bg-navy-50";

            return (
              <Link
                key={notice._id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-100"
              >
                <div className="relative h-44 bg-navy-100 overflow-hidden">
                  {notice.image ? (
                    <Image
                      src={urlFor(notice.image).width(400).height(280).url()}
                      alt={notice.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900">
                      <span className="text-white font-bold text-4xl opacity-20">KNW</span>
                    </div>
                  )}
                  {notice.categoryTitle && (
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                      {notice.categoryTitle}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors text-sm leading-snug line-clamp-2">
                    {notice.title}
                  </h3>
                  {notice.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.summary}</p>
                  )}
                  <div className="mt-3 text-xs font-semibold text-gold-600 group-hover:text-gold-500">
                    View →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
