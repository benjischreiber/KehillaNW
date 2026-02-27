"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";

interface HeaderProps {
  topNavCategories?: Category[];
  hebrewDate?: string;
}

export default function Header({ topNavCategories = [], hebrewDate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notices?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const defaultTopNav = [
    { title: "Shuls", slug: { current: "shuls" } },
    { title: "Schools", slug: { current: "schools" } },
    { title: "Shiurim", slug: { current: "shiurim" } },
    { title: "Gemachim", slug: { current: "gemachim" } },
    { title: "Cholim", slug: { current: "cholim" } },
  ];

  const navLinks = topNavCategories.length > 0 ? topNavCategories : defaultTopNav;

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-50 shadow-md">
      {/* Top bar */}
      <div className="border-b border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-gold-400 text-navy-900 font-bold text-sm px-2 py-1 rounded">
              KNW
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">KehillaNW</div>
              <div className="text-xs text-navy-200 leading-tight">Home of the NW London Kehilla</div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="flex w-full rounded-lg overflow-hidden border border-navy-600">
              <input
                type="text"
                placeholder="Search notices…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-navy-800 text-white placeholder-navy-300 text-sm focus:outline-none focus:bg-navy-700"
              />
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-400 px-4 py-2 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-navy-900" />
              </button>
            </div>
          </form>

          {/* Right: date + top nav */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {hebrewDate && (
              <span className="text-xs text-gold-300">{hebrewDate}</span>
            )}
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {navLinks.map((cat) => (
                <Link
                  key={cat.title}
                  href={`/category/${cat.slug.current}`}
                  className="text-gold-300 hover:text-gold-100 transition-colors font-medium"
                >
                  {cat.title}
                </Link>
              ))}
              <Link
                href="/about"
                className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-3 py-1 rounded-full text-xs transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden ml-auto"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
            {navLinks.map((cat) => (
              <Link
                key={cat.title}
                href={`/category/${cat.slug.current}`}
                className="text-gold-300 hover:text-white text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {cat.title}
              </Link>
            ))}
            <Link
              href="/about"
              className="text-gold-300 hover:text-white text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
