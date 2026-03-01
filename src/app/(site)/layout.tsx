import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1 pt-8 md:pt-10">{children}</main>
      <Footer />
    </div>
  );
}
