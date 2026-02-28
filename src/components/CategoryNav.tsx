"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Category, categoryColourMap, categoryColourTintMap } from "@/lib/types";
import { Grid3X3, Building2, Heart, ShoppingBag, GraduationCap, Users, Sparkles, ChefHat } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "useful-info": <Building2 className="h-4 w-4" />,
  government: <Building2 className="h-4 w-4" />,
  support: <Heart className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  community: <Users className="h-4 w-4" />,
  entertainment: <Sparkles className="h-4 w-4" />,
  recipes: <ChefHat className="h-4 w-4" />,
};

interface CategoryNavProps {
  categories?: Category[];
}

const defaultCategories: Category[] = [
  { _id: "1", title: "Useful Info", slug: { current: "useful-info" }, colour: "blue", showInMainNav: true },
  { _id: "2", title: "Support", slug: { current: "support" }, colour: "green", showInMainNav: true },
  { _id: "3", title: "Shopping", slug: { current: "shopping" }, colour: "purple", showInMainNav: true },
  { _id: "4", title: "Education", slug: { current: "education" }, colour: "orange", showInMainNav: true },
  { _id: "5", title: "Community", slug: { current: "community" }, colour: "teal", showInMainNav: true },
  { _id: "6", title: "Entertainment", slug: { current: "entertainment" }, colour: "rose", showInMainNav: true },
];

export default function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || (pathname.startsWith("/category/") ? pathname.split("/category/")[1] : "all");

  const navCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-[57px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          <Link
            href="/notices"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 border-2 ${
              activeCategory === "all" || (pathname === "/" && !searchParams.get("category"))
                ? "bg-navy-900 text-white border-navy-900"
                : "text-navy-700 border-navy-200 hover:border-navy-400"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            All Posts
          </Link>
          {navCategories.map((cat) => {
            const isActive = activeCategory === cat.slug.current;
            const solidClass = cat.colour ? categoryColourMap[cat.colour] : "bg-navy-700";
            const tintClass = cat.colour ? categoryColourTintMap[cat.colour] : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
            return (
              <Link
                key={cat._id}
                href={`/category/${cat.slug.current}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 border-2 ${
                  isActive
                    ? `${solidClass} text-white border-transparent`
                    : tintClass
                }`}
              >
                {iconMap[cat.slug.current] || null}
                {cat.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
