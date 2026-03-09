"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "@/lib/api";

interface Filters {
  neighborhood?: string;
  venue_type?: string;
  vibe_tags?: string[];
  min_price?: string;
  max_price?: string;
  good_for_date?: string;
  good_for_group?: string;
  late_night?: string;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { data } = useQuery({ queryKey: ["filters"], queryFn: fetchFilters });

  if (!data) return null;

  function set(key: string, value: string | undefined) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.neighborhood ?? ""}
        onChange={(e) => set("neighborhood", e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      >
        <option value="">All areas</option>
        {data.neighborhoods.map((n) => (
          <option key={n.slug} value={n.slug}>
            {n.name}
          </option>
        ))}
      </select>

      <select
        value={filters.venue_type ?? ""}
        onChange={(e) => set("venue_type", e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      >
        <option value="">All types</option>
        {data.venue_types.map((v) => (
          <option key={v.slug} value={v.slug}>
            {v.name}
          </option>
        ))}
      </select>

      <select
        value={filters.max_price ?? ""}
        onChange={(e) => set("max_price", e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      >
        <option value="">Any price</option>
        <option value="1">£ (budget)</option>
        <option value="2">££</option>
        <option value="3">£££</option>
        <option value="4">££££</option>
        <option value="5">£££££</option>
      </select>

      {[
        { key: "good_for_date", label: "Date night" },
        { key: "good_for_group", label: "Groups" },
        { key: "late_night", label: "Late night" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() =>
            set(key, (filters as Record<string, string | undefined>)[key] === "true" ? undefined : "true")
          }
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            (filters as Record<string, string | undefined>)[key] === "true"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
