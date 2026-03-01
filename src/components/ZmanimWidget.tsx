"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ZmanimTimes {
  alotHaShachar: string;
  sunrise: string;
  sofZmanShma: string;
  sofZmanTfilla: string;
  chatzot: string;
  minchaGedola: string;
  sunset: string;
  dusk: string;
}

interface ShabbatItem {
  title: string;
  date: string;
  category: string;
  hebrew?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });
}

const LAT = 51.5726; // Golders Green, NW11
const LNG = -0.1943;
const TZ = "Europe/London";

export default function ZmanimWidget() {
  const [times, setTimes] = useState<ZmanimTimes | null>(null);
  const [candleLighting, setCandleLighting] = useState<string | null>(null);
  const [havdalah, setHavdalah] = useState<string | null>(null);
  const [parasha, setParasha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const base = `latitude=${LAT}&longitude=${LNG}&tzid=${encodeURIComponent(TZ)}`;
    Promise.all([
      fetch(`https://www.hebcal.com/zmanim?cfg=json&${base}`).then((r) => r.json()),
      fetch(`https://www.hebcal.com/shabbat?cfg=json&${base}&M=on&b=18`).then((r) => r.json()),
    ])
      .then(([zmanim, shabbat]) => {
        setTimes(zmanim.times);
        const items: ShabbatItem[] = shabbat.items ?? [];
        const candles = items.find((i) => i.category === "candles");
        const havd = items.find((i) => i.category === "havdalah");
        const parsh = items.find((i) => i.category === "parashat");
        if (candles) setCandleLighting(formatTime(candles.date));
        if (havd) setHavdalah(formatTime(havd.date));
        if (parsh) setParasha(parsh.hebrew ?? parsh.title);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const rows = times
    ? [
        { label: "Dawn (Alot HaShachar)", time: formatTime(times.alotHaShachar) },
        { label: "Sunrise (Hanetz)", time: formatTime(times.sunrise) },
        { label: "Sof Zman Shma (GRA)", time: formatTime(times.sofZmanShma) },
        { label: "Sof Zman Tfilla (GRA)", time: formatTime(times.sofZmanTfilla) },
        { label: "Chatzot", time: formatTime(times.chatzot) },
        { label: "Mincha Gedola", time: formatTime(times.minchaGedola) },
        { label: "Sunset (Shkia)", time: formatTime(times.sunset) },
        { label: "Nightfall (Tzeit)", time: formatTime(times.dusk) },
      ]
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-navy-900 px-5 py-3 flex items-center justify-between">
        <h2 className="font-bold text-white text-sm">Zmanim — NW London</h2>
        <span className="text-navy-300 text-xs">{today}</span>
      </div>

      <div className="p-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Loading times…</p>
        )}

        {error && (
          <p className="text-center text-gray-400 text-sm py-6">
            Times unavailable — please try refreshing.
          </p>
        )}

        {!loading && !error && times && (
          <>
            {/* Zmanim table */}
            <table className="w-full text-sm">
              <tbody>
                {rows.map(({ label, time }) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="py-1.5 pr-2 text-gray-600 leading-tight">{label}</td>
                    <td className="py-1.5 text-right font-semibold text-navy-900 tabular-nums whitespace-nowrap">
                      {time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Shabbat times */}
            {(candleLighting || havdalah) && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 space-y-1.5">
                {parasha && (
                  <p className="text-xs text-amber-700 font-semibold text-center mb-1">
                    {parasha}
                  </p>
                )}
                {candleLighting && (
                  <div className="flex justify-between text-sm font-semibold text-amber-900">
                    <span>🕯️ Candle Lighting</span>
                    <span className="tabular-nums">{candleLighting}</span>
                  </div>
                )}
                {havdalah && (
                  <div className="flex justify-between text-sm font-semibold text-amber-900">
                    <span>✨ Havdalah</span>
                    <span className="tabular-nums">{havdalah}</span>
                  </div>
                )}
              </div>
            )}

            {/* PDF link */}
            <Link
              href="https://kehillanw.org/Mincha_Maariv_Schedule.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-xs text-navy-700 font-semibold hover:text-gold-600 transition-colors"
            >
              Download Mincha/Maariv Zmanim sheet →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
