"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type MinyanEntry = {
  time: string;
  id: string;
  name: string;
  address?: string;
  nusach?: string;
  note?: string;
  comments?: string;
};

type ServiceKey = "shacharith" | "mincha" | "maariv";

interface ServiceData {
  list: Record<string, MinyanEntry[]>;
}

function todayDate(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function serviceFromTimes(
  duskIso: string | null,
  chatzotIso: string | null,
): ServiceKey {
  const now = Date.now();
  if (duskIso   && now >= new Date(duskIso).getTime())   return "maariv";
  if (chatzotIso && now >= new Date(chatzotIso).getTime()) return "mincha";
  return "shacharith";
}

const TABS: { key: ServiceKey; en: string; he: string }[] = [
  { key: "shacharith", en: "Shacharit", he: "שחרית" },
  { key: "mincha",     en: "Mincha",    he: "מנחה"  },
  { key: "maariv",     en: "Maariv",    he: "מעריב" },
];

export default function MinyanMavenWidget() {
  // Start with shacharith to avoid server/client hydration mismatch;
  // useEffect sets the correct tab using the visitor's browser time.
  const [active, setActive] = useState<ServiceKey>("shacharith");
  const [lists, setLists] = useState<Record<ServiceKey, Record<string, MinyanEntry[]> | null>>({
    shacharith: null,
    mincha: null,
    maariv: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = todayDate();

    // Fetch zmanim (for shkia/dusk) and minyan times in parallel
    Promise.all([
      fetch(
        `https://www.hebcal.com/zmanim?cfg=json&latitude=51.5726&longitude=-0.1943&tzid=Europe%2FLondon`
      ).then((r) => r.json()).catch(() => null),
      fetch(`/api/minyanim?date=${date}`)
        .then<{ shacharith: ServiceData; mincha: ServiceData; maariv: ServiceData }>((r) => r.json()),
    ]).then(([zmanim, minyanim]) => {
      const dusk    = zmanim?.times?.dusk    ?? null;
      const chatzot = zmanim?.times?.chatzot ?? null;
      setActive(serviceFromTimes(dusk, chatzot));

      setLists({
        shacharith: minyanim.shacharith.list ?? {},
        mincha:     minyanim.mincha.list     ?? {},
        maariv:     minyanim.maariv.list     ?? {},
      });
      setLoading(false);
    }).catch(() => {
      // Fall back to rough fixed-hour logic if fetches fail
      const h = new Date().getHours();
      setActive(h < 12 ? "shacharith" : h < 18 ? "mincha" : "maariv");
      setError(true);
      setLoading(false);
    });
  }, []);

  const current = lists[active] ?? {};
  const times = Object.keys(current).sort();

  // After data loads (or tab changes), scroll to the closest time slot
  useEffect(() => {
    if (loading || !scrollRef.current) return;
    const now = new Date();
    const hhMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    // Find the last time slot that has already started (≤ now)
    let target = times[0] ?? null;
    for (const t of times) {
      if (t <= hhMM) target = t;
      else break;
    }
    if (target) {
      const container = scrollRef.current;
      const el = container.querySelector<HTMLElement>(`[data-time="${target}"]`);
      if (el) {
        // Scroll so target row sits at the top of the container
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop += elTop - containerTop;
      }
    }
  }, [loading, active, times]); // re-runs when tab changes or times update

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="bg-navy-900 px-5 py-3 flex items-center justify-between">
        <h2 className="font-bold text-white text-sm">Minyan Times — GG &amp; Hendon</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 py-2 text-center transition-colors ${
              active === tab.key
                ? "border-b-2 border-navy-900 text-navy-900"
                : "text-gray-400 hover:text-navy-700"
            }`}
          >
            <span className="block text-sm font-semibold">{tab.en}</span>
            <span className="block text-xs">{tab.he}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "18rem" }}>
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Loading times…</p>
        )}
        {error && (
          <p className="text-center text-gray-400 text-sm py-8">Times unavailable</p>
        )}
        {!loading && !error && times.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No times listed today</p>
        )}
        {!loading && !error && times.length > 0 && (
          <div className="divide-y divide-gray-50">
            {times.map((time) =>
              current[time].map((m, i) => (
                <div key={`${time}-${i}`} data-time={i === 0 ? time : undefined} className="flex items-start gap-3 px-4 py-2">
                  <span className="w-11 shrink-0 font-bold text-navy-900 tabular-nums text-sm pt-0.5">
                    {i === 0 ? time : ""}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{m.name}</p>
                    {m.nusach && (
                      <p className="text-xs text-gray-400">{m.nusach}</p>
                    )}
                    {m.note && (
                      <p className="text-xs text-gray-400 italic">{m.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 text-center">
        <Link
          href="https://www.minyanmaven.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-navy-700 font-semibold hover:text-gold-600 transition-colors"
        >
          View full schedule &amp; details on Minyan Maven →
        </Link>
      </div>
    </div>
  );
}
