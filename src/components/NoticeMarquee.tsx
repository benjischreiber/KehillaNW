"use client";

import { Notice } from "@/lib/types";
import NoticeCard from "./NoticeCard";

export default function NoticeMarquee({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;
  // Duplicate so the loop is seamless
  const doubled = [...notices, ...notices];

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 150s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, black 90%, transparent)" }}
      >
        <div className="marquee-track flex gap-4 w-max">
          {doubled.map((notice, i) => (
            <div key={`${notice._id}-${i}`} className="w-64 shrink-0">
              <NoticeCard notice={notice} size="lg" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
