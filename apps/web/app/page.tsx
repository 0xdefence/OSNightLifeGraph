"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVenues, parseQuery } from "@/lib/api";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { VenueCard } from "@/components/venue/VenueCard";
import { VenueDetail } from "@/components/venue/VenueDetail";
import { VenueMap } from "@/components/map/VenueMap";
import { ChevronDown, Check } from "lucide-react";

type Filters = Record<string, string | undefined>;

export default function ExplorePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Best Match");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v) params[k] = v;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["venues", params],
    queryFn: () => fetchVenues(params),
  });

  const handleSearch = useCallback(async (query: string) => {
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
      if (sq.budget_total)
        next.max_price = String(Math.min(5, Math.ceil(sq.budget_total / 30)));
      setFilters(next);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSelectVenue = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  const venues = data?.items ?? [];

  return (
    <div className="flex w-full h-full bg-white relative font-sans antialiased text-neutral-900">
      {/* Left Panel - 440px */}
      <div className="w-[440px] flex-none border-r border-neutral-200 flex flex-col h-full bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Header & Search */}
        <div className="px-5 pt-5 pb-3 border-b border-neutral-100 flex flex-col gap-3 flex-none bg-white z-30">
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">
            Explore
          </h1>
          <SearchBar onSearch={handleSearch} isLoading={searchLoading} />
          <FilterPanel filters={filters} onChange={setFilters} />

          {/* Results toolbar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-medium text-neutral-500">
              Showing{" "}
              <span className="font-bold text-neutral-900">
                {isLoading ? "..." : data?.total ?? 0}
              </span>{" "}
              results
            </span>

            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="text-[10px] font-semibold flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors px-1.5 py-1 rounded hover:bg-neutral-50"
              >
                Sort: {sortOption}
                <ChevronDown
                  className={`w-3 h-3 ml-0.5 transition-transform ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-md shadow-lg py-1 z-50">
                    {["Best Match", "Highest Rated", "Distance"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortOption(opt);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center justify-between ${
                          sortOption === opt
                            ? "text-neutral-900 font-bold bg-neutral-50"
                            : "text-neutral-600 font-medium hover:bg-neutral-50"
                        }`}
                      >
                        {opt}
                        {sortOption === opt && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 relative bg-[#FAFAFA]/50">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm text-neutral-400">Loading...</span>
            </div>
          ) : venues.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                No venues found
              </h3>
              <p className="text-xs text-neutral-500">
                Try removing some filters.
              </p>
            </div>
          ) : (
            venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isSelected={selectedSlug === venue.slug}
                onClick={() => handleSelectVenue(venue.slug)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-[#F0F0F0] overflow-hidden">
        <VenueMap
          venues={venues}
          selectedSlug={selectedSlug}
          onSelectVenue={handleSelectVenue}
        />
      </div>

      {/* Detail Drawer */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-[400px] bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.08)] border-l border-neutral-200 transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 flex flex-col ${
          selectedSlug ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedSlug && (
          <VenueDetail
            slug={selectedSlug}
            onClose={() => setSelectedSlug(null)}
            onSelectVenue={handleSelectVenue}
          />
        )}
      </div>
    </div>
  );
}
