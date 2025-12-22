import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from "./components/Nav";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const font = localFont({
  src: [{ path: "../public/font.woff2", weight: "500" }],
  variable: "--font",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modul.es"),
  title: {
    template: "%s Module",
    default: "Modules"
  },
  description: "Components && utilities",
  openGraph: {
    type: "website",
    url: "https://modul.es",
    title: "Modules",
    description: "Components && utilities",
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
    <html lang="en" className="scroll-smooth">
      <body className={`bg-black h-svh flex flex-col text-white selection:bg-white/20 selection:text-white uppercase antialiased font **:outline-none ${font.variable}`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
