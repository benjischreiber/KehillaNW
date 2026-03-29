import { client } from "@/sanity/lib/client";
import {
  recentNoticesQuery,
  activeBannersQuery,
  mazalTovQuery,
  upcomingEventsQuery,
} from "@/lib/queries";
import { Notice, Banner, MazalTov } from "@/lib/types";
import NoticeMarquee from "@/components/NoticeMarquee";
import MazalTovSection from "@/components/MazalTovSection";
import UpcomingTicker from "@/components/UpcomingTicker";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import ZmanimWidget from "@/components/ZmanimWidget";
import MinyanMavenWidget from "@/components/MinyanMavenWidget";
import { CalendarDays, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

export const revalidate = 300;

async function getData() {
  const [recent, banners, mazalTov, upcomingEvents] = await Promise.all([
    client.fetch<Notice[]>(recentNoticesQuery).catch(() => []),
    client.fetch<Banner[]>(activeBannersQuery).catch(() => []),
    client.fetch<MazalTov[]>(mazalTovQuery).catch(() => []),
    client.fetch<Notice[]>(upcomingEventsQuery).catch(() => []),
  ]);
  return { recent, banners, mazalTov, upcomingEvents };
}

export default async function HomePage() {
  const { recent, banners, mazalTov, upcomingEvents } = await getData();

  const formatEventDate = (d?: string) => {
    if (!d) return "";
    try {
      return format(parseISO(d), "EEE d MMM");
    } catch {
      return d;
    }
  };

  return (
    <>
      {upcomingEvents.length > 0 && <UpcomingTicker events={upcomingEvents} />}

      {/* Banner ads */}
      {banners.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-4">
            {banners.map((banner) => (
              <a
                key={banner._id}
                href={banner.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden"
              >
                <div className="relative h-24 sm:h-32 w-full">
                  <Image
                    src={urlFor(banner.image).width(1200).height(200).format("jpg").quality(72).url()}
                    alt={banner.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Recent notices — full width 3-column grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900">
            Recent <span className="text-gold-500">Notices</span>
          </h2>
          <Link
            href="/notices"
            className="text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
            <p className="font-semibold text-lg mb-1">No notices yet</p>
            <p className="text-sm">Notices will appear here once added via the admin.</p>
          </div>
        ) : (
          <NoticeMarquee notices={recent} />
        )}

        {recent.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/notices"
              className="inline-block bg-navy-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-navy-700 transition-colors"
            >
              View all notices
            </Link>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <section className="mt-12 mb-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-navy-900">
                Coming <span className="text-gold-500">Up</span>
              </h2>
              <Link
                href="/notices?events=upcoming"
                className="text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
              >
                View all upcoming events →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {upcomingEvents.slice(0, 4).map((event) => (
                <Link
                  key={event._id}
                  href={`/notices/${event.slug?.current}`}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2 text-gold-600 text-sm font-bold mb-3 uppercase tracking-wide">
                    <CalendarDays className="h-4 w-4" />
                    {formatEventDate(event.eventDate || event.publishDate)}
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 leading-tight mb-2 group-hover:text-gold-600 transition-colors">
                    {event.title}
                  </h3>
                  {event.categoryTitle && (
                    <p className="text-sm text-gray-500 mb-4">{event.categoryTitle}</p>
                  )}
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-gold-600 transition-colors">
                    View event
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Widget row below notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-12 items-stretch">

          {/* Mazal Tov */}
          {mazalTov.length > 0 && (
            <div className="h-full">
              <MazalTovSection items={mazalTov} />
            </div>
          )}

          {/* Zmanim */}
          <div className="h-full">
            <ZmanimWidget />
          </div>

          {/* Minyan Times */}
          <div className="h-full">
            <MinyanMavenWidget />
          </div>

          {/* Submit + WhatsApp */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-2xl p-6 text-center flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg mb-2">Submit a Notice</h3>
              <p className="text-navy-200 text-sm mb-4 leading-relaxed">
                Have something to share with the community?
              </p>
              <Link
                href="/submit"
                className="inline-block bg-gold-500 text-navy-900 font-bold px-6 py-2.5 rounded-full hover:bg-gold-400 transition-colors text-sm"
              >
                Submit a Notice
              </Link>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center flex-1 flex flex-col justify-center">
              <p className="text-green-800 font-semibold text-sm mb-2">📱 Get updates on WhatsApp</p>
              <a
                href="https://chat.whatsapp.com/D79ty6r6Lef5wGZdO30Pvj"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
              >
                Join the WhatsApp Group
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
