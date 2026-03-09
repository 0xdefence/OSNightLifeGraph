"use client";

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
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-gray-400 bg-gray-50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {venue.name}
          </h3>
          <p className="text-xs text-gray-500">
            {TYPE_LABEL[venue.venue_type] ?? venue.venue_type} · {venue.neighborhood}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700">
            {venue.average_rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            {PRICE_LABEL[venue.price_band]}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {venue.vibe_tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
          >
            {tag}
          </span>
        ))}
        {venue.cuisines.slice(0, 2).map((c) => (
          <span
            key={c}
            className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-1.5 flex gap-3 text-[11px] text-gray-400">
        <span>~£{venue.average_spend_gbp} avg</span>
        {venue.good_for_date && <span>Good for dates</span>}
        {venue.good_for_late_night && <span>Late night</span>}
      </div>
    </button>
  );
}
