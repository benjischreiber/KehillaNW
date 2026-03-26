import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">KehillaNW.org</span>
          <span className="text-navy-300 text-sm hidden sm:inline">· Home of the NW London Kehilla</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-navy-300">
          <Link href="/submit" className="hover:text-gold-300 transition-colors">Submit a Notice</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-gold-300 transition-colors">About</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} KehillaNW.org</span>
        </div>
      </div>
      <div className="border-t border-navy-600 py-2 text-center text-xs text-navy-300">
        <div className="px-4 sm:hidden">
          <div className="font-medium text-white/90">In memory of Mr Hershel Golker z&apos;l</div>
          <div className="mt-1 leading-relaxed">לעילוי נשמת ר׳ שלמה צבי בן ר׳ משה מרדכי גולקר ז׳ל — ת.נ.צ.ב.ה</div>
        </div>
        <div className="hidden sm:block">
          לעילוי נשמת ר׳ שלמה צבי בן ר׳ משה מרדכי גולקר ז׳ל &nbsp;·&nbsp; In memory of Mr Hershel Golker z&apos;l — ת.נ.צ.ב.ה
        </div>
      </div>
    </footer>
  );
}
