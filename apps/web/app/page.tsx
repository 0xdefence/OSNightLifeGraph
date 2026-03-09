"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVenues, parseQuery } from "@/lib/api";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { VenueCard } from "@/components/venue/VenueCard";
import { VenueDetail } from "@/components/venue/VenueDetail";
import { VenueMap } from "@/components/map/VenueMap";
import Link from "next/link";

type Filters = Record<string, string | undefined>;

export default function ExplorePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Build query params from filters
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v) params[k] = v;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["venues", params],
    queryFn: () => fetchVenues(params),
  });

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilters({});
        return;
      }
      setSearchLoading(true);
      try {
        const result = await parseQuery(query);
        const sq = result.structured_query;
        const next: Filters = {};
        if (sq.area) next.neighborhood = sq.area;
        if (sq.venue_type) next.venue_type = sq.venue_type;
        if (sq.good_for_date) next.good_for_date = "true";
        if (sq.good_for_group) next.good_for_group = "true";
        if (sq.late_night) next.late_night = "true";
        if (sq.budget_total) next.max_price = String(Math.min(5, Math.ceil(sq.budget_total / 30)));
        setFilters(next);
      } finally {
        setSearchLoading(false);
      }
    },
    [],
  );

  const handleSelectVenue = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  const venues = data?.items ?? [];

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">DarkKnight</h1>
          <Link
            href="/plan"
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Plan a night
          </Link>
        </div>
        <div className="mt-3">
          <SearchBar onSearch={handleSearch} isLoading={searchLoading} />
        </div>
        <div className="mt-2">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      </header>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: list or detail */}
        <div className="w-[380px] shrink-0 border-r border-gray-100 bg-white">
          {selectedSlug ? (
            <VenueDetail
              slug={selectedSlug}
              onClose={() => setSelectedSlug(null)}
              onSelectVenue={handleSelectVenue}
            />
          ) : (
            <div className="h-full overflow-auto">
              <div className="border-b border-gray-50 px-4 py-2 text-xs text-gray-400">
                {isLoading
                  ? "Loading..."
                  : `${data?.total ?? 0} venues`}
              </div>
              <div className="space-y-2 p-3">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isSelected={venue.slug === selectedSlug}
                    onClick={() => handleSelectVenue(venue.slug)}
                  />
                ))}
                {!isLoading && venues.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No venues match your filters.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right panel: map */}
        <div className="flex-1">
          <VenueMap
            venues={venues}
            selectedSlug={selectedSlug}
            onSelectVenue={handleSelectVenue}
          />
        </div>
      </div>
    </div>
  );
}
