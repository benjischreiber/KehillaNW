"use client";

import { useEffect, useRef } from "react";
import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

const SPEED = 0.4; // px per frame (~24px/s at 60fps)
const START_DELAY = 3000;
const RESUME_DELAY = 1500;

export default function NoticeScrollUp({ notices }: { notices: Notice[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0); // current translateY offset (px, negative = scrolled down)
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!notices.length) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const getHalf = () => track.offsetHeight / 2;

    const step = () => {
      if (!pausedRef.current) {
        posRef.current -= SPEED;
        const half = getHalf();
        if (half > 0 && posRef.current <= -half) {
          posRef.current += half;
        }
        track.style.transform = `translateY(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const handleWheel = (e: WheelEvent) => {
      const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 30;
      posRef.current -= delta;
      const half = getHalf();
      if (half > 0) {
        posRef.current = posRef.current % half;
        if (posRef.current > 0) posRef.current -= half;
      }
      track.style.transform = `translateY(${posRef.current}px)`;

      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_DELAY);
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: true });

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, [notices.length]);

  if (!notices.length) return null;

  const doubled = [...notices, ...notices];

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "72vh",
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, black 90%, transparent)",
      }}
    >
      <div ref={trackRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doubled.map((notice, i) => (
            <NoticeCard key={`${notice._id}-${i}`} notice={notice} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
