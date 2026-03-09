"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, CalendarRange, Network, Heart, Settings } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();

  const navClass = (path: string) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
      pathname === path
        ? "bg-neutral-900 text-white"
        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
    }`;

  return (
    <header className="flex-none h-14 border-b border-neutral-200 px-5 flex items-center justify-between bg-white z-50">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-2 mr-2"
        >
          <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">DK</span>
          </div>
          DarkKnight
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={navClass("/")}>
            <Search className="w-4 h-4" />
            Explore
          </Link>
          <Link href="/plan" className={navClass("/plan")}>
            <CalendarRange className="w-4 h-4" />
            Planner
          </Link>
          <Link href="/graph" className={navClass("/graph")}>
            <Network className="w-4 h-4" />
            Graph
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
          title="Saved Places"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
