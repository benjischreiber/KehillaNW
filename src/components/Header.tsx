"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search, Menu, X,
  Building2, Heart, ShoppingBag, GraduationCap, Users, Sparkles,
} from "lucide-react";
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

  const activeCategory =
    searchParams.get("category") ||
    (pathname.startsWith("/category/") ? pathname.split("/category/")[1] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white border-b-4 border-gold-500 shadow-xl">

      {/* ── Desktop ── */}
      <div className="hidden md:flex items-stretch gap-6 max-w-7xl mx-auto px-6 py-5">

        {/* Left column: brand + pills + search */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Brand headline */}
          <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
            NW London Community
          </p>
          <p className="text-2xl sm:text-3xl font-bold leading-tight mb-1">
            What&apos;s happening in the{" "}
            <span className="text-gold-400">Kehilla</span>
          </p>
          <p className="text-navy-200 text-sm mb-4">
            Notices, events &amp; useful info — updated daily
          </p>

          {/* Category pills — full row, wraps if needed */}
          <div className="flex items-center gap-1.5 flex-wrap mt-auto">
            {NAV_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              const solidClass = categoryColourMap[cat.colour] || "bg-navy-600";
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
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

          {/* Search — below pills */}
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

        {/* Right: logo fills full header height */}
        <Link
          href="/"
          className="shrink-0 self-stretch hover:opacity-90 transition-opacity flex items-center"
        >
          <Image
            src="/logo.png"
            alt="KehillaNW — Connecting Our Community"
            width={300}
            height={240}
            className="rounded-2xl shadow-2xl w-auto"
            style={{ height: "100%", maxHeight: "100%", width: "auto" }}
            priority
          />
        </Link>
      </div>

      {/* ── Mobile ── */}
      <div className="md:hidden px-4 pt-3 pb-2">
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

        {/* Mobile pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {NAV_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const solidClass = categoryColourMap[cat.colour] || "bg-navy-600";
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${
                  isActive
                    ? `${solidClass} text-white border-transparent`
                    : "text-white/80 border-white/20 bg-white/8"
                }`}
              >
                {cat.icon}{cat.title}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile expanded menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-900 px-4 py-3 border-t border-white/10 flex gap-4">
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
