"use client";

import { useEffect, useRef, useState } from "react";
import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

const SPEED = 0.4; // px per frame (~24px/s at 60fps)
const START_DELAY = 3000;
const RESUME_DELAY = 1500;

export default function NoticeScrollUp({ notices }: { notices: Notice[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const shouldLoop = notices.length > 6;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchDevice(media.matches);

    update();
    media.addEventListener?.("change", update);

    return () => {
      media.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!notices.length || !shouldLoop) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const getHalf = () => track.offsetHeight / 2;
    const pauseTemporarily = (delay = RESUME_DELAY) => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, delay);
    };

    const step = () => {
      if (!pausedRef.current) {
        const half = getHalf();
        if (half > 0) {
          if (isTouchDevice) {
            posRef.current += SPEED;
            if (posRef.current >= half) {
              posRef.current -= half;
            }
            wrapper.scrollTop = posRef.current;
          } else {
            posRef.current -= SPEED;
            if (posRef.current <= -half) {
              posRef.current += half;
            }
            track.style.transform = `translateY(${posRef.current}px)`;
          }
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isTouchDevice) return;
      const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 30;
      const half = getHalf();
      posRef.current -= delta;
      const minPos = Math.min(0, wrapper.offsetHeight - half);
      posRef.current = Math.max(minPos, Math.min(0, posRef.current));
      track.style.transform = `translateY(${posRef.current}px)`;
      pauseTemporarily();
    };

    const handleTouchStart = () => pauseTemporarily();
    const handleTouchMove = () => pauseTemporarily();
    const handleScroll = () => {
      if (!isTouchDevice) return;
      const half = getHalf();
      if (half > 0 && wrapper.scrollTop >= half) {
        wrapper.scrollTop -= half;
      }
      posRef.current = wrapper.scrollTop;
      pauseTemporarily();
    };

    if (isTouchDevice) {
      wrapper.scrollTop = posRef.current;
    } else {
      track.style.transform = `translateY(${posRef.current}px)`;
    }

    wrapper.addEventListener("wheel", handleWheel, { passive: true });
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: true });
    wrapper.addEventListener("scroll", handleScroll, { passive: true });

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("scroll", handleScroll);
    };
  }, [isTouchDevice, notices.length, shouldLoop]);

  if (!notices.length) return null;

  const items = shouldLoop ? [...notices, ...notices] : notices;

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "72vh",
        overflowY: shouldLoop && !isTouchDevice ? "hidden" : "auto",
        WebkitOverflowScrolling: "touch",
        maskImage: "linear-gradient(to bottom, black 90%, transparent)",
      }}
    >
      <div ref={trackRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((notice, i) => (
            <NoticeCard key={`${notice._id}-${i}`} notice={notice} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
