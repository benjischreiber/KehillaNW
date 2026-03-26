import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="bg-gold-100 border-b border-gold-300 text-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center text-sm font-medium">
          Bear with us whilst we fine tune the new website.
        </div>
      </div>
      {/* Street wallpaper behind all page content */}
      <main
        className="site-shell-main flex-1 relative"
        style={{
          backgroundImage: "url('/street.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/55 pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
