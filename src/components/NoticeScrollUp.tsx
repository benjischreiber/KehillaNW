"use client";

import { useEffect, useRef } from "react";
import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

const SPEED = 0.5; // px per frame (~30px/s at 60fps)
const START_DELAY = 3000; // ms before auto-scroll begins
const RESUME_DELAY = 1500; // ms after manual scroll stops before auto-scroll resumes

export default function NoticeScrollUp({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;

  const doubled = [...notices, ...notices];
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const step = () => {
      if (!pausedRef.current) {
        container.scrollTop += SPEED;
        // Seamless loop: when past the halfway point, step back by half
        if (container.scrollTop >= container.scrollHeight / 2) {
          container.scrollTop -= container.scrollHeight / 2;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const handleManualScroll = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_DELAY);
    };

    container.addEventListener("wheel", handleManualScroll, { passive: true });
    container.addEventListener("touchmove", handleManualScroll, { passive: true });

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      container.removeEventListener("wheel", handleManualScroll);
      container.removeEventListener("touchmove", handleManualScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto"
      style={{
        height: "72vh",
        maskImage: "linear-gradient(to bottom, black 90%, transparent)",
        scrollbarWidth: "none",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {doubled.map((notice, i) => (
          <NoticeCard key={`${notice._id}-${i}`} notice={notice} size="lg" />
        ))}
      </div>
    </div>
  );
}
