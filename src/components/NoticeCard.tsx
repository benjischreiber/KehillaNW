import Link from "next/link";
import Image from "next/image";
import { Notice, categoryColourMap, categoryColourTextMap } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { decodeHtmlEntities } from "@/lib/utils";

interface NoticeCardProps {
  notice: Notice;
  size?: "sm" | "md" | "lg";
}

function getLinkLabel(externalLink?: string) {
  if (!externalLink) return null;

  try {
    if (externalLink.startsWith("mailto:")) {
      return externalLink.replace(/^mailto:/i, "");
    }
    if (externalLink.startsWith("tel:")) {
      return externalLink.replace(/^tel:/i, "");
    }

    const url = new URL(externalLink);
    return url.hostname.replace(/^www\./i, "");
  } catch {
    return externalLink
      .replace(/^(https?:\/\/|mailto:|tel:)/i, "")
      .replace(/^www\./i, "");
  }
}

function PdfPreview({
  pdfUrl,
  title,
  badgeClass,
}: {
  pdfUrl: string;
  title: string;
  badgeClass: string;
}) {
  return (
    <div className="relative h-full w-full bg-white">
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
        title={`${title} PDF preview`}
        className="h-full w-full border-0 pointer-events-none"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />
      <div className="pointer-events-none absolute right-3 bottom-3">
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold shadow-sm ${badgeClass}`}>
          PDF
        </span>
      </div>
    </div>
  );
}

function TextPreview({
  title,
  summary,
  externalLink,
  placeholderBg,
}: {
  title: string;
  summary?: string;
  externalLink?: string;
  placeholderBg: string;
}) {
  const linkLabel = getLinkLabel(externalLink);

  return (
    <div className={`relative h-full w-full ${placeholderBg} overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.14))]" />
      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-[75%] rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            {linkLabel ? "External link" : "Notice"}
          </div>
          {linkLabel && (
            <div className="max-w-[45%] truncate rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              {linkLabel}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 text-3xl font-black leading-none text-white/16">
            {linkLabel ? linkLabel.split(".")[0].slice(0, 10).toUpperCase() : "NOTICE"}
          </div>
          <h4 className="line-clamp-3 text-lg font-bold leading-tight text-white">
            {title}
          </h4>
          {summary && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/85">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NoticeCard({ notice, size = "md" }: NoticeCardProps) {
  const decodedTitle = decodeHtmlEntities(notice.title);
  const decodedSummary = notice.summary ? decodeHtmlEntities(notice.summary) : undefined;
  const hasInternalPage = !!notice.slug?.current;
  const href = hasInternalPage
    ? `/notices/${notice.slug.current}`
    : notice.externalLink || "#";
  const isExternal = !hasInternalPage && !!notice.externalLink;

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
        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 h-[280px]"
      >
        <div className="relative h-[208px] w-full overflow-hidden shrink-0">
          {notice.image ? (
            <Image
              src={urlFor(notice.image).width(480).height(320).format("jpg").quality(72).url()}
              alt={decodedTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 18rem, 20rem"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          ) : notice.pdfUrl ? (
            <PdfPreview
              pdfUrl={notice.pdfUrl}
              title={decodedTitle}
              badgeClass={badgeClass}
            />
          ) : (
            <TextPreview
              title={decodedTitle}
              summary={decodedSummary}
              externalLink={notice.externalLink}
              placeholderBg={placeholderBg}
            />
          )}
          {notice.categoryTitle && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${badgeClass} shadow-sm`}>
              {notice.categoryTitle}
            </span>
          )}
        </div>
        <div className="p-3 flex-1 overflow-hidden">
          <h3 className="font-bold text-navy-900 text-sm leading-snug group-hover:text-gold-600 transition-colors line-clamp-2">
            {decodedTitle}
          </h3>
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
              src={urlFor(notice.image).width(96).height(96).format("jpg").quality(70).url()}
              alt={decodedTitle}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`h-14 w-14 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${badgeClass}`}>
            {getLinkLabel(notice.externalLink)?.slice(0, 3).toUpperCase() || notice.categoryTitle?.slice(0, 3) || "TXT"}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-navy-900 group-hover:text-gold-600 transition-colors line-clamp-2">
            {decodedTitle}
          </h4>
          {decodedSummary && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{decodedSummary}</p>
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
      {notice.image ? (
        <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
          <Image
            src={urlFor(notice.image).width(120).height(120).format("jpg").quality(70).url()}
            alt={notice.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : notice.pdfUrl ? (
        <div className={`h-20 w-20 rounded-lg shrink-0 p-2 flex flex-col justify-between ${placeholderBg}`}>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
            PDF
          </span>
          <span className="line-clamp-3 text-xs font-semibold leading-tight text-white">
            {decodedSummary || decodedTitle}
          </span>
        </div>
      ) : (
        <div className={`h-20 w-20 rounded-lg shrink-0 p-2 flex flex-col justify-between ${placeholderBg}`}>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
            {getLinkLabel(notice.externalLink) ? "Link" : "Text"}
          </span>
          <span className="line-clamp-3 text-xs font-semibold leading-tight text-white">
            {getLinkLabel(notice.externalLink) || decodedSummary || decodedTitle}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        {notice.categoryTitle && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass} mb-1 inline-block`}>
            {notice.categoryTitle}
          </span>
        )}
        <h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors leading-snug">
          {decodedTitle}
        </h3>
        {decodedSummary && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{decodedSummary}</p>
        )}
      </div>
    </Link>
  );
}
