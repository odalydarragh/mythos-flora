import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mythos Flora | Real-World Botanical & World Folklore RPG",
  description:
    "Explore the outdoors, identify real trees and plants with open-weight AI (Llama-3.2-11B-Vision-Instruct & BioCLIP 2.5), uncover world folklore, and forage physical items to unlock paths.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mythos Flora",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1e8d7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Mountains+of+Christmas:wght@400;700&family=Petrona:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Viaoda+Libre&display=swap"
        />
      </head>
      <body className="antialiased bg-[#f1e8d7] text-[#18221b] selection:bg-[#8a382c] selection:text-[#f1e8d7]">
        {children}
      </body>
    </html>
  );
}
