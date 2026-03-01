"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, X, Grid3X3, Building2, Heart, ShoppingBag, GraduationCap, Users, Sparkles } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { categoryColourMap } from "@/lib/types";

const NAV_CATEGORIES = [
  { title: "Government",    slug: "government",    colour: "blue",   icon: <Building2 className="h-3.5 w-3.5" /> },
  { title: "Support",       slug: "support",       colour: "green",  icon: <Heart className="h-3.5 w-3.5" /> },
  { title: "Shopping",      slug: "shopping",      colour: "purple", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { title: "Education",     slug: "education",     colour: "orange", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { title: "Community",     slug: "community",     colour: "teal",   icon: <Users className="h-3.5 w-3.5" /> },
  { title: "Entertainment", slug: "entertainment", colour: "rose",   icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ||
    (pathname.startsWith("/category/") ? pathname.split("/category/")[1] : "all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notices?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 text-white sticky top-0 z-50 shadow-lg border-b-4 border-gold-500">
      <div className="max-w-7xl mx-auto px-6 md:px-8">

        {/* ── Desktop: logo left, search + categories right ── */}
        <div className="hidden md:grid grid-cols-[auto_1fr] gap-x-8">

          {/* Logo — directly on navy, no white box, white version via filter */}
          <Link
            href="/"
            className="row-span-2 flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logosmall.png"
              alt="KehillaNW.org"
              width={220}
              height={56}
              className="h-14 w-auto brightness-0 invert"
              priority
            />
          </Link>

          {/* Top row: search + links */}
          <div className="flex items-center gap-3 py-3 border-b border-white/10">
            <form onSubmit={handleSearch} className="flex-1 max-w-lg flex">
              <div className="flex w-full rounded-lg overflow-hidden border border-white/20">
                <input
                  type="text"
                  placeholder="Search notices…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15"
                />
                <button type="submit" className="bg-gold-500 hover:bg-gold-400 px-3 py-2 transition-colors" aria-label="Search">
                  <Search className="h-4 w-4 text-navy-900" />
                </button>
              </div>
            </form>
            <Link href="/submit" className="text-gold-300 hover:text-gold-100 text-sm font-medium transition-colors whitespace-nowrap">
              Submit a notice
            </Link>
            <Link href="/about" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap">
              About
            </Link>
          </div>

          {/* Bottom row: category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2">
            <Link
              href="/notices"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                activeCategory === "all"
                  ? "bg-white text-navy-900 border-white shadow-sm"
                  : "text-white/80 border-white/20 bg-white/8 hover:bg-white/15 hover:border-white/50 hover:text-white"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              All Posts
            </Link>
            {NAV_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              const solidClass = categoryColourMap[cat.colour] || "bg-navy-600";
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                    isActive
                      ? `${solidClass} text-white border-transparent shadow-sm`
                      : "text-white/80 border-white/20 bg-white/8 hover:bg-white/15 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {cat.icon}
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="md:hidden flex items-center gap-3 py-2">
          <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/logosmall.png"
              alt="KehillaNW.org"
              width={140}
              height={36}
              className="h-9 w-auto brightness-0 invert"
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
          <button className="shrink-0" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile: category pills row */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2 border-t border-white/10 pt-1.5">
          <Link href="/notices" className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${activeCategory === "all" ? "bg-white text-navy-900 border-white" : "text-white/80 border-white/20 bg-white/8"}`}>
            <Grid3X3 className="h-3 w-3" />All
          </Link>
          {NAV_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const solidClass = categoryColourMap[cat.colour] || "bg-navy-600";
            return (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${isActive ? `${solidClass} text-white border-transparent` : "text-white/80 border-white/20 bg-white/8"}`}>
                {cat.icon}{cat.title}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile expanded menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-800 px-4 py-3 border-t border-white/10 flex gap-4">
          <Link href="/submit" className="text-gold-300 text-sm font-medium" onClick={() => setMenuOpen(false)}>Submit a notice</Link>
          <Link href="/about" className="text-gold-300 text-sm font-medium" onClick={() => setMenuOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
