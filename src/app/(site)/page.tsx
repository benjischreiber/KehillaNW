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
                    src={urlFor(banner.image).width(1200).height(200).url()}
                    alt={banner.title}
                    fill
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
