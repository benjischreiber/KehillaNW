import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gold-400 text-navy-900 font-bold text-sm px-2 py-1 rounded">KNW</div>
              <span className="font-bold text-lg">KehillaNW.org</span>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed mb-4">
              Home of the NW London Kehilla. This website was set up by members of the kehilla across
              Golders Green and Hendon to share information widely and in a timely manner.
            </p>
            <p className="text-xs text-navy-300">
              לעילוי נשמת ר׳ שלמה צבי בן ר׳ משה מרדכי גולקר ז׳ל
              <br />
              Mr Hershel Golker z&apos;l — ת.נ.צ.ב.ה
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-gold-400 mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm text-navy-200">
              {[
                { label: "Shuls", href: "/category/shuls" },
                { label: "Schools", href: "/category/schools" },
                { label: "Shiurim", href: "/category/shiurim" },
                { label: "Gemachim", href: "/category/gemachim" },
                { label: "Cholim", href: "/category/cholim" },
                { label: "About", href: "/about" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-gold-400 mb-3 text-sm uppercase tracking-wide">Categories</h3>
            <ul className="space-y-2 text-sm text-navy-200">
              {[
                { label: "Useful Info", href: "/category/useful-info" },
                { label: "Support", href: "/category/support" },
                { label: "Shopping", href: "/category/shopping" },
                { label: "Education", href: "/category/education" },
                { label: "Community", href: "/category/community" },
                { label: "Entertainment", href: "/category/entertainment" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-navy-400">
          <p>© {new Date().getFullYear()} KehillaNW.org · All rights reserved</p>
          <div className="flex gap-4">
            <Link href="/submit" className="hover:text-gold-300 transition-colors">
              Submit a Notice
            </Link>
            <Link href="/about" className="hover:text-gold-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
