import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DarkKnight",
  description: "London hospitality discovery and night planning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex h-screen w-full flex-col bg-[#F5F5F5] text-neutral-900 antialiased overflow-hidden`}
      >
        <Providers>
          <TopBar />
          <main className="flex-1 relative overflow-hidden flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
