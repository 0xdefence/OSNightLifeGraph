"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "@/lib/api";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

type Filters = Record<string, string | undefined>;
type FilterCategory = "Area" | "Type" | "Price" | "Vibe";

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const PRICE_OPTIONS = ["1", "2", "3", "4", "5"];
const PRICE_LABELS: Record<string, string> = {
  "1": "£",
  "2": "££",
  "3": "£££",
  "4": "££££",
  "5": "£££££",
};

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { data } = useQuery({ queryKey: ["filters"], queryFn: fetchFilters });
  const [activeMenu, setActiveMenu] = useState<FilterCategory | null>(null);

  if (!data) return null;

  const categories: FilterCategory[] = ["Area", "Type", "Price", "Vibe"];

  const categoryKey = (cat: FilterCategory): string => {
    switch (cat) {
      case "Area": return "neighborhood";
      case "Type": return "venue_type";
      case "Price": return "max_price";
      case "Vibe": return "vibe_tags";
    }
  };

  const categoryOptions = (cat: FilterCategory): { value: string; label: string }[] => {
    switch (cat) {
      case "Area":
        return data.neighborhoods.map((n) => ({ value: n.slug, label: n.name }));
      case "Type":
        return data.venue_types.map((v) => ({ value: v.slug, label: v.name }));
      case "Price":
        return PRICE_OPTIONS.map((p) => ({ value: p, label: PRICE_LABELS[p] }));
      case "Vibe":
        return data.vibe_tags.map((v) => ({ value: v.slug, label: v.name }));
    }
  };

  const isActive = (cat: FilterCategory) => !!filters[categoryKey(cat)];
  const isMenuOpen = (cat: FilterCategory) => activeMenu === cat;

  function toggleOption(cat: FilterCategory, value: string) {
    const key = categoryKey(cat);
    onChange({
      ...filters,
      [key]: filters[key] === value ? undefined : value,
    });
  }

  // Quick toggles
  const toggleFlags = [
    { key: "good_for_date", label: "Date" },
    { key: "good_for_group", label: "Groups" },
    { key: "late_night", label: "Late" },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          className="flex-none flex items-center justify-center w-7 h-7 rounded border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          title="More Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-neutral-200 mx-1" />

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveMenu(isMenuOpen(cat) ? null : cat)}
            className={`flex-none flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
              isActive(cat) || isMenuOpen(cat)
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            {cat}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isMenuOpen(cat) ? "rotate-180" : "opacity-50"
              }`}
            />
          </button>
        ))}

        <div className="w-px h-4 bg-neutral-200 mx-1" />

        {toggleFlags.map(({ key, label }) => (
          <button
            key={key}
            onClick={() =>
              onChange({
                ...filters,
                [key]: filters[key] === "true" ? undefined : "true",
              })
            }
            className={`flex-none px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
              filters[key] === "true"
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expanded filter panel */}
      {activeMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setActiveMenu(null)}
          />
          <div className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-lg px-5 py-4 z-40 mt-1 rounded-b-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest">
                {activeMenu}
              </span>
              <button
                onClick={() => setActiveMenu(null)}
                className="p-1 rounded-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions(activeMenu).map((opt) => {
                const key = categoryKey(activeMenu);
                const isSelected = filters[key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(activeMenu, opt.value)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
