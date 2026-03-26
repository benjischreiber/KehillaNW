import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "KehillaNW.org",
  description: "Notices, events and useful info for the NW London Jewish community.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId="G-LVT4FL9EJS" />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
