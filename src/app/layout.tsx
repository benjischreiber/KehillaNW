import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kehillanw.org"),
  title: {
    default: "KehillaNW.org — Home of the NW London Kehilla",
    template: "%s | KehillaNW.org",
  },
  description:
    "Community notices, events, and information for the NW London Jewish community — Golders Green, Hendon, and beyond.",
  icons: {
    icon: "/logosmall.png",
    apple: "/logosmall.png",
    shortcut: "/logosmall.png",
  },
  openGraph: {
    title: "KehillaNW.org — Home of the NW London Kehilla",
    description:
      "Community notices, events, and information for the NW London Jewish community — Golders Green, Hendon, and beyond.",
    url: "https://kehillanw.org",
    siteName: "KehillaNW.org",
    images: [
      {
        url: "/logosmall.png",
        width: 1536,
        height: 1024,
        alt: "KehillaNW.org",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KehillaNW.org — Home of the NW London Kehilla",
    description:
      "Community notices, events, and information for the NW London Jewish community — Golders Green, Hendon, and beyond.",
    images: ["/logosmall.png"],
  },
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
