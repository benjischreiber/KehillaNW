"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, X, Home } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category, categoryColourMap } from "@/lib/types";

interface HeaderClientProps {
  categories: Category[];
}

function normalizeCategories(categories: Category[]): Category[] {
  if (!Array.isArray(categories)) return [];

  return categories.flatMap((category) => {
    const title = typeof category?.title === "string" ? category.title.trim() : "";
    const slug = typeof category?.slug?.current === "string" ? category.slug.current.trim() : "";

    if (!title || !slug) return [];

    return [{
      ...category,
      title,
      slug: { current: slug },
      colour: typeof category?.colour === "string" ? category.colour : "navy",
      icon: typeof category?.icon === "string" ? category.icon : undefined,
    }];
  });
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeCategories = normalizeCategories(categories);

  const activeCategory =
    searchParams.get("category") ||
    (pathname.startsWith("/category/") ? pathname.split("/category/")[1] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notices?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="text-white border-b-4 border-gold-500 shadow-xl relative overflow-hidden"
      style={{ backgroundImage: "url('/sky.jpeg')", backgroundSize: "cover", backgroundPosition: "center center" }}
    >
      <div className="absolute inset-0 bg-navy-950/45 pointer-events-none" />

      <div className="hidden md:flex items-stretch gap-6 max-w-7xl mx-auto px-6 py-5 relative">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
              NW London Community
            </p>
            <p className="text-2xl sm:text-3xl font-bold leading-tight mb-1">
              What&apos;s happening in the{" "}
              <span className="text-gold-400" style={{ textShadow: "0 0 18px rgba(234,179,8,0.8), 0 0 40px rgba(234,179,8,0.4)" }}>
                Kehilla
              </span>
            </p>
            <p className="text-navy-200 text-sm">
              Notices, events &amp; useful info
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                pathname === "/"
                  ? "bg-white text-navy-900 border-white shadow-sm"
                  : "bg-white/50 backdrop-blur-sm text-navy-900 border-white/60 hover:bg-white/75"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>

            {safeCategories.map((cat) => {
              const slug = cat.slug.current;
              const isActive = activeCategory === slug;
              const solidClass = categoryColourMap[cat.colour || "navy"] || "bg-navy-600";

              return (
                <Link
                  key={cat._id}
                  href={`/category/${slug}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                    isActive
                      ? `${solidClass} text-white border-transparent shadow-sm`
                      : "bg-white/50 backdrop-blur-sm text-navy-900 border-white/60 hover:bg-white/75"
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.title}
                </Link>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="mt-2">
            <div className="flex rounded-lg overflow-hidden border border-white/20 w-fit">
              <input
                type="text"
                placeholder="Search notices…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 px-3 py-1.5 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15"
              />
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-400 px-2.5 py-1.5 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-navy-900" />
              </button>
            </div>
          </form>
        </div>

        <Link
          href="/"
          className="shrink-0 self-stretch hover:opacity-90 transition-opacity flex items-center bg-white/70 backdrop-blur-sm rounded-2xl px-2"
        >
          <Image
            src="/logo.png"
            alt="KehillaNW — Connecting Our Community"
            width={300}
            height={240}
            className="w-auto"
            style={{ height: "100%", maxHeight: "100%", width: "auto" }}
            priority
          />
        </Link>
      </div>

      <div className="md:hidden px-4 pt-3 pb-2 relative">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="KehillaNW"
              width={120}
              height={96}
              className="h-12 w-auto rounded-lg"
              priority
            />
          </Link>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex w-full rounded-lg overflow-hidden border border-white/20">
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-gold-500 px-3 py-1.5">
                <Search className="h-4 w-4 text-navy-900" />
              </button>
            </div>
          </form>
          <button
            className="shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          <Link
            href="/"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${
              pathname === "/"
                ? "bg-white text-navy-900 border-white"
                : "text-white/80 border-white/20 bg-white/8"
            }`}
          >
            <Home className="h-3 w-3" />
            Home
          </Link>
          {safeCategories.map((cat) => {
            const slug = cat.slug.current;
            const isActive = activeCategory === slug;
            const solidClass = categoryColourMap[cat.colour || "navy"] || "bg-navy-600";

            return (
              <Link
                key={cat._id}
                href={`/category/${slug}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${
                  isActive
                    ? `${solidClass} text-white border-transparent`
                    : "text-white/80 border-white/20 bg-white/8"
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.title}
              </Link>
            );
          })}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy-900/80 px-4 py-3 border-t border-white/10 flex gap-4 relative">
          <Link href="/submit" className="text-gold-300 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Submit a notice
          </Link>
          <Link href="/about" className="text-gold-300 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            About
          </Link>
        </div>
      )}
    </header>
  );
}
