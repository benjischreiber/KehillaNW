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
    <header className="bg-gradient-to-r from-navy-950 to-navy-800 text-white sticky top-0 z-50 shadow-lg">

      {/* ── Top row: logo + search + links ── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-2">

          {/* Logo — spans visually into the category row */}
          <Link href="/" className="shrink-0 bg-white rounded-xl px-2.5 py-1.5 hover:opacity-90 transition-opacity">
            <Image
              src="/logosmall.png"
              alt="KehillaNW.org"
              width={240}
              height={56}
              className="h-11 w-auto"
              priority
            />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:flex">
            <div className="flex w-full rounded-lg overflow-hidden border border-navy-600">
              <input
                type="text"
                placeholder="Search notices…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-navy-800 text-white placeholder-navy-300 text-sm focus:outline-none focus:bg-navy-700"
              />
              <button type="submit" className="bg-gold-500 hover:bg-gold-400 px-4 py-2 transition-colors" aria-label="Search">
                <Search className="h-4 w-4 text-navy-900" />
              </button>
            </div>
          </form>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-3 ml-auto shrink-0">
            <Link href="/submit" className="text-gold-300 hover:text-gold-100 text-sm font-medium transition-colors">
              Submit a notice
            </Link>
            <Link href="/about" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-3 py-1.5 rounded-full text-sm transition-colors">
              About
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden ml-auto" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Category nav row ── */}
      <div className="border-t border-navy-700 border-b-2 border-b-gold-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1.5">
            <Link
              href="/notices"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                activeCategory === "all"
                  ? "bg-white text-navy-900 border-white"
                  : "text-navy-200 border-navy-600 hover:border-navy-400 hover:text-white"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                    isActive
                      ? `${solidClass} text-white border-transparent`
                      : "text-navy-200 border-navy-600 hover:border-navy-400 hover:text-white"
                  }`}
                >
                  {cat.icon}
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-navy-800 px-4 py-4 space-y-3 border-t border-navy-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search notices…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-navy-700 text-white placeholder-navy-300 text-sm rounded-lg focus:outline-none"
            />
            <button type="submit" className="bg-gold-500 text-navy-900 px-3 py-2 rounded-lg">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <nav className="flex flex-wrap gap-3">
            <Link href="/submit" className="text-gold-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>Submit a notice</Link>
            <Link href="/about" className="text-gold-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
