"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice, categoryColourMap } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";

interface FeaturedCarouselProps {
  notices: Notice[];
}

export default function FeaturedCarousel({ notices }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 250);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % notices.length);
  }, [current, notices.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + notices.length) % notices.length);
  }, [current, notices.length, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, notices.length]);

  if (!notices.length) return null;

  const notice = notices[current];
  const href = notice.externalLink || `/notices/${notice.slug?.current}`;
  const isExternal = !!notice.externalLink;
  const solidClass =
    notice.categoryColour && categoryColourMap[notice.categoryColour]
      ? categoryColourMap[notice.categoryColour]
      : "bg-navy-600";

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "200px" }}>

      {/* Background: notice image or navy gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {notice.image ? (
          <Image
            src={urlFor(notice.image).width(1400).height(520).url()}
            alt={notice.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700" />
        )}
      </div>

      {/* Left-to-right dark gradient overlay — keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/75 to-transparent" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />

      {/* Slide content */}
      <div
        className="relative max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-8 transition-all duration-300"
        style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(6px)" : "translateY(0)" }}
      >
        <div className="max-w-xl">
          {/* Labels row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">★ Featured</span>
            {notice.categoryTitle && (
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white ${solidClass}`}>
                {notice.categoryTitle}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
            {notice.title}
          </h2>

          {/* Summary */}
          {notice.summary && (
            <p className="text-white/80 text-xs sm:text-sm mb-4 line-clamp-1 leading-relaxed hidden sm:block">
              {notice.summary}
            </p>
          )}

          {/* CTA */}
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-block bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-2 rounded-full text-xs transition-colors shadow-lg"
          >
            Read more →
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {notices.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-colors shadow"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-colors shadow"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {notices.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {notices.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-gold-400 w-6"
                  : "bg-white/40 hover:bg-white/70 w-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide counter — top right */}
      {notices.length > 1 && (
        <div className="absolute top-4 right-5 text-white/50 text-xs font-semibold">
          {current + 1} / {notices.length}
        </div>
      )}
    </section>
  );
}
