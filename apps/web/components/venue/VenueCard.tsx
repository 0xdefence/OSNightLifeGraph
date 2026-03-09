"use client";

import { useState } from "react";
import { Heart, Star } from "lucide-react";
import type { VenueListItem } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  club: "Club",
};

const PRICE_LABEL: Record<number, string> = {
  1: "£",
  2: "££",
  3: "£££",
  4: "££££",
  5: "£££££",
};

interface VenueCardProps {
  venue: VenueListItem;
  isSelected?: boolean;
  onClick: () => void;
}

export function VenueCard({ venue, isSelected, onClick }: VenueCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left transition-all duration-200 group flex gap-3 p-3 rounded-xl border focus:outline-none ${
        isSelected
          ? "bg-white border-neutral-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] z-10"
          : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 flex-none rounded-lg bg-neutral-100 overflow-hidden relative">
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
        <div
          className={`absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 backdrop-blur-sm transition-opacity z-20 shadow-sm ${
            isSaved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isSaved
                ? "fill-red-500 text-red-500"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="font-bold text-sm text-neutral-900 truncate pr-2">
            {venue.name}
          </h3>
          <span className="text-xs font-semibold text-neutral-900 flex-none">
            {PRICE_LABEL[venue.price_band]}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-1.5">
          <span className="flex items-center gap-0.5 text-neutral-700 font-semibold">
            <Star className="w-3 h-3 fill-neutral-700 text-neutral-700" />
            {venue.average_rating.toFixed(1)}
          </span>
          <span className="text-neutral-300">&bull;</span>
          <span className="truncate">
            {TYPE_LABEL[venue.venue_type] ?? venue.venue_type}
          </span>
          <span className="text-neutral-300">&bull;</span>
          <span className="truncate">{venue.neighborhood}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500">
          {venue.vibe_tags.slice(0, 2).map((tag, i) => (
            <span key={tag} className="flex items-center gap-2">
              {i > 0 && (
                <span className="w-0.5 h-0.5 rounded-full bg-neutral-300" />
              )}
              <span className="uppercase tracking-wider">{tag}</span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
