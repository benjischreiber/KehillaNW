import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      {/* Street wallpaper behind all page content */}
      <main
        className="flex-1 relative"
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
