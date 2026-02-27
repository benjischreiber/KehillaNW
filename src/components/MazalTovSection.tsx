import { MazalTov } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Gift } from "lucide-react";
import Link from "next/link";

interface MazalTovSectionProps {
  items: MazalTov[];
}

export default function MazalTovSection({ items }: MazalTovSectionProps) {
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-navy-900 px-5 py-3 flex items-center gap-2">
        <Gift className="h-5 w-5 text-gold-400" />
        <h2 className="font-bold text-white">Mazal Tov</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {items.slice(0, 8).map((item) => (
          <div key={item._id} className="px-5 py-3">
            <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
            {item.publishDate && (
              <p className="text-xs text-gray-400 mt-1">{formatDate(item.publishDate)}</p>
            )}
          </div>
        ))}
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <Link href="/notices?category=community" className="text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors">
          Read more →
        </Link>
      </div>
    </div>
  );
}
