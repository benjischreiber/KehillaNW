"use client";

import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

export default function NoticeScrollUp({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;
  const doubled = [...notices, ...notices];
  const duration = Math.max(40, notices.length * 3); // ~3s per notice

  return (
    <>
      <style>{`
        @keyframes scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-up-track {
          animation: scroll-up ${duration}s linear 3s infinite;
        }
        .scroll-up-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="overflow-hidden relative"
        style={{
          height: "72vh",
          maskImage: "linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="scroll-up-track grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doubled.map((notice, i) => (
            <NoticeCard key={`${notice._id}-${i}`} notice={notice} size="lg" />
          ))}
        </div>
      </div>
    </>
  );
}
