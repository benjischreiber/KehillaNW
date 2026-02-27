import { client } from "@/sanity/lib/client";
import { noticeBySlug } from "@/lib/queries";
import { Notice, categoryColourTextMap } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { Calendar, ExternalLink, ArrowLeft, Tag, FileText } from "lucide-react";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const notice = await client.fetch<Notice>(noticeBySlug, { slug }).catch(() => null);
  if (!notice) return { title: "Notice Not Found" };
  return {
    title: notice.title,
    description: notice.summary || notice.title,
  };
}

export default async function NoticePage({ params }: Props) {
  const { slug } = await params;
  const notice = await client.fetch<Notice>(noticeBySlug, { slug }).catch(() => null);

  if (!notice) notFound();

  const badgeClass =
    notice.categoryColour && categoryColourTextMap[notice.categoryColour]
      ? categoryColourTextMap[notice.categoryColour]
      : "text-navy-700 bg-navy-50";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/notices"
        className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-gold-600 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notices
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Hero image */}
        {notice.image && (
          <div className="relative h-64 sm:h-80 w-full">
            <Image
              src={urlFor(notice.image).width(900).height(500).url()}
              alt={notice.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 sm:p-10">
          {/* Meta */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {notice.categoryTitle && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${badgeClass}`}>
                <Tag className="h-3 w-3" />
                {notice.categoryTitle}
              </span>
            )}
            {notice.secondaryCategoryTitle && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {notice.secondaryCategoryTitle}
              </span>
            )}
            {notice.publishDate && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {formatDate(notice.publishDate)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3 leading-tight">
            {notice.title}
          </h1>

          {/* Summary */}
          {notice.summary && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 border-gold-400 pl-4">
              {notice.summary}
            </p>
          )}

          {/* CTA buttons */}
          {(notice.pdfUrl || notice.externalLink) && (
            <div className="flex flex-wrap gap-3 mb-8">
              {notice.pdfUrl && (
                <a
                  href={notice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gold-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  View PDF
                </a>
              )}
              {notice.externalLink && (
                <a
                  href={notice.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-navy-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit for more info
                </a>
              )}
            </div>
          )}

          {/* Rich text content */}
          {notice.content && (
            <div className="notice-content">
              <PortableText
                value={notice.content}
                components={{
                  types: {
                    image: ({ value }) => (
                      <div className="my-6 rounded-xl overflow-hidden">
                        <Image
                          src={urlFor(value).width(800).url()}
                          alt={value.alt || ""}
                          width={800}
                          height={500}
                          className="w-full object-cover rounded-xl"
                        />
                      </div>
                    ),
                  },
                }}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 bg-navy-50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 px-6 sm:px-10 py-5 rounded-b-2xl">
            <p className="text-sm text-navy-700 font-semibold mb-1">
              📱 To receive regular updates from KehillaNW.org:
            </p>
            <a
              href="https://chat.whatsapp.com/D79ty6r6Lef5wGZdO30Pvj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 font-semibold hover:underline"
            >
              Join the WhatsApp update group →
            </a>
            <span className="text-sm text-gray-400 mx-3">or</span>
            <a
              href="mailto:posts@kehillaNW.org"
              className="text-sm text-navy-700 font-semibold hover:underline"
            >
              email posts@kehillaNW.org
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
