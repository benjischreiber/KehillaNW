import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KehillaNW.org — Home of the NW London Kehilla",
    template: "%s | KehillaNW.org",
  },
  description:
    "Community notices, events, and information for the NW London Jewish community — Golders Green, Hendon, and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
