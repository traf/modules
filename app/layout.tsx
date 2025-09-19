import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const font = localFont({
  src: [{ path: "../public/font.woff2", weight: "500" }],
  variable: "--font",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modul.es"),
  title: "Modules",
  description: "Simple API endpoints.",
  openGraph: {
    type: "website",
    url: "https://modul.es",
    title: "Modules",
    description: "Simple API endpoints.",
    images: [
      {
        url: "https://modul.es/og.png",
        width: 1920,
        height: 1080,
        alt: "Modules",
      },
    ],
  },
  icons: {
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`h-svh bg-black text-white selection:bg-white/10 selection:text-white uppercase antialiased font ${font.variable}`}>
        {children}
      </body>
    </html>
  );
}
