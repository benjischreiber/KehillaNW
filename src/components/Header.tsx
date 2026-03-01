"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="bg-gradient-to-r from-navy-950 to-navy-800 text-white sticky top-0 z-50 shadow-lg border-b-2 border-gold-500">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="KehillaNW — Home of the NW London Kehilla"
            width={200}
            height={44}
            className="h-10 w-auto"
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
            <button
              type="submit"
              className="bg-gold-500 hover:bg-gold-400 px-4 py-2 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-navy-900" />
            </button>
          </div>
        </form>

        {/* Right: About + Submit */}
        <div className="hidden md:flex items-center gap-3 ml-auto shrink-0">
          <Link
            href="/submit"
            className="text-gold-300 hover:text-gold-100 text-sm font-medium transition-colors"
          >
            Submit a notice
          </Link>
          <Link
            href="/about"
            className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-3 py-1.5 rounded-full text-sm transition-colors"
          >
            About
          </Link>
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
            <Link href="/submit" className="text-gold-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>Submit a notice</Link>
            <Link href="/about" className="text-gold-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
