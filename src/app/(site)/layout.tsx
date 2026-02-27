import { Suspense } from "react";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
