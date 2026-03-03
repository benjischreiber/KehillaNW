"use client";

import { useEffect, useRef } from "react";
import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

const SPEED = 0.5; // px per frame (~30px/s at 60fps)
const START_DELAY = 3000; // ms before auto-scroll begins

export default function NoticeScrollUp({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;

  const doubled = [...notices, ...notices];
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const step = () => {
      container.scrollTop += SPEED;
      // Seamless loop: when past the halfway point, step back by half
      if (container.scrollTop >= container.scrollHeight / 2) {
        container.scrollTop -= container.scrollHeight / 2;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
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
