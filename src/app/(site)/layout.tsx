import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      {/* Sky background behind all page content */}
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: "url('/sky.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/20 pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
