import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import Sidebar from "./components/Sidebar";
import Nav from "./components/Nav";
import "./globals.css";

const font = localFont({
  src: [{ path: "../public/font.woff2", weight: "500" }],
  variable: "--font",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modul.es"),
  title: "Modules",
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
      <body className={`bg-black h-svh flex flex-col text-white selection:bg-white/10 selection:text-white uppercase antialiased font **:outline-none ${font.variable}`}>
        <div className="bg-black fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
          <Image src="/modules.png" alt="Modules" className="w-full pointer-events-none scale-110" />
        </div>
        <Nav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
