"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Notice } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface UpcomingTickerProps {
  events: Pick<Notice, "_id" | "title" | "publishDate" | "slug" | "categoryTitle">[];
}

export default function UpcomingTicker({ events }: UpcomingTickerProps) {
  const [idx, setIdx] = useState(0);

  if (!events.length) return null;

  const visible = events.slice(idx, idx + 3);
  const canPrev = idx > 0;
  const canNext = idx + 3 < events.length;

  const formatEventDate = (d: string) => {
    try {
      return format(parseISO(d), "MMM d");
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0 text-gold-400">
          <Calendar className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wide">Upcoming:</span>
        </div>
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          className="shrink-0 disabled:opacity-30 hover:text-gold-400 transition-colors"
          aria-label="Previous events"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-hidden">
          {visible.map((event) => (
            <Link
              key={event._id}
              href={`/notices/${event.slug?.current}`}
              className="flex items-center gap-2 text-sm hover:text-gold-300 transition-colors truncate"
            >
              {event.publishDate && (
                <span className="text-gold-400 font-bold shrink-0 text-xs">
                  {formatEventDate(event.publishDate)}
                </span>
              )}
              <span className="truncate">{event.title}</span>
            </Link>
          ))}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(events.length - 3, i + 1))}
          disabled={!canNext}
          className="shrink-0 disabled:opacity-30 hover:text-gold-400 transition-colors"
          aria-label="Next events"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
