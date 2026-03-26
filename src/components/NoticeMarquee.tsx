"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

const AUTO_SCROLL_STEP = 0.9;
const RESUME_DELAY = 1600;

export default function NoticeMarquee({ notices }: { notices: Notice[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldLoop = notices.length > 1;
  const items = shouldLoop ? [...notices, ...notices] : notices;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !shouldLoop) {
      return;
    }

    const pauseTemporarily = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_DELAY);
    };

    const tick = () => {
      if (!pausedRef.current) {
        const loopWidth = scroller.scrollWidth / 2;
        if (loopWidth > 0) {
          if (scroller.scrollLeft >= loopWidth) {
            scroller.scrollLeft -= loopWidth;
          }
          scroller.scrollLeft += AUTO_SCROLL_STEP;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleWheel = () => pauseTemporarily();
    const handlePointerDown = () => pauseTemporarily();
    const handleTouchStart = () => pauseTemporarily();
    const handleMouseEnter = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const handleMouseLeave = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, 250);
    };

    rafRef.current = requestAnimationFrame(tick);
    scroller.addEventListener("wheel", handleWheel, { passive: true });
    scroller.addEventListener("pointerdown", handlePointerDown);
    scroller.addEventListener("touchstart", handleTouchStart, { passive: true });
    scroller.addEventListener("mouseenter", handleMouseEnter);
    scroller.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("pointerdown", handlePointerDown);
      scroller.removeEventListener("touchstart", handleTouchStart);
      scroller.removeEventListener("mouseenter", handleMouseEnter);
      scroller.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [shouldLoop]);

  if (!notices.length) return null;

  const scrollByCards = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth * 0.9, 420),
      behavior: "smooth",
    });
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll notices left"
        onClick={() => scrollByCards(-1)}
        className="hidden md:flex absolute left-2 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-md p-2 hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide touch-pan-x"
        style={{
          WebkitOverflowScrolling: "touch",
          maskImage: "linear-gradient(to right, black 92%, transparent)",
        }}
      >
        {items.map((notice, index) => (
          <div key={`${notice._id}-${index}`} className="w-64 shrink-0 sm:w-72 lg:w-80">
            <NoticeCard notice={notice} size="lg" />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll notices right"
        onClick={() => scrollByCards(1)}
        className="hidden md:flex absolute right-2 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-md p-2 hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
