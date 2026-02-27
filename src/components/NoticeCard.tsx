import Link from "next/link";
import Image from "next/image";
import { Notice, categoryColourMap, categoryColourTextMap } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";

interface NoticeCardProps {
  notice: Notice;
  size?: "sm" | "md" | "lg";
}

export default function NoticeCard({ notice, size = "md" }: NoticeCardProps) {
  const href = notice.externalLink
    ? notice.externalLink
    : `/notices/${notice.slug?.current}`;
  const isExternal = !!notice.externalLink;

  const badgeClass =
    notice.categoryColour && categoryColourTextMap[notice.categoryColour]
      ? categoryColourTextMap[notice.categoryColour]
      : "text-navy-700 bg-navy-50";

  const placeholderBg =
    notice.categoryColour && categoryColourMap[notice.categoryColour]
      ? categoryColourMap[notice.categoryColour]
      : "bg-navy-700";

  if (size === "lg") {
    return (
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
      >
        <div className="relative h-48 w-full overflow-hidden">
          {notice.image ? (
            <Image
              src={urlFor(notice.image).width(600).height(400).url()}
              alt={notice.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`h-full w-full ${placeholderBg} flex items-center justify-center opacity-90`}>
              <span className="text-white text-4xl font-bold opacity-30 select-none tracking-widest">KNW</span>
            </div>
          )}
          {notice.categoryTitle && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${badgeClass} shadow-sm`}>
              {notice.categoryTitle}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-navy-900 text-lg leading-snug group-hover:text-gold-600 transition-colors mb-2">
            {notice.title}
          </h3>
          {notice.summary && (
            <p className="text-gray-500 text-sm line-clamp-2">{notice.summary}</p>
          )}
          {notice.publishDate && (
            <p className="text-xs text-gray-400 mt-3">{formatDate(notice.publishDate)}</p>
          )}
        </div>
      </Link>
    );
  }

  if (size === "sm") {
    return (
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-navy-50 transition-colors"
      >
        {notice.image ? (
          <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
            <Image
              src={urlFor(notice.image).width(100).height(100).url()}
              alt={notice.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`h-14 w-14 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${badgeClass}`}>
            {notice.categoryTitle?.slice(0, 3) || "KNW"}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-navy-900 group-hover:text-gold-600 transition-colors line-clamp-2">
            {notice.title}
          </h4>
          {notice.summary && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{notice.summary}</p>
          )}
        </div>
      </Link>
    );
  }

  // md (default)
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      {notice.image && (
        <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
          <Image
            src={urlFor(notice.image).width(160).height(160).url()}
            alt={notice.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {notice.categoryTitle && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass} mb-1 inline-block`}>
            {notice.categoryTitle}
          </span>
        )}
        <h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors leading-snug">
          {notice.title}
        </h3>
        {notice.summary && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{notice.summary}</p>
        )}
        {notice.publishDate && (
          <p className="text-xs text-gray-400 mt-2">{formatDate(notice.publishDate)}</p>
        )}
      </div>
    </Link>
  );
}
