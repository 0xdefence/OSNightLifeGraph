"use client";

import type { PlanItinerary } from "@/lib/types";

interface PlanResultProps {
  best: PlanItinerary;
  alternatives: PlanItinerary[];
  onSelectAlternative: (index: number) => void;
  activeIndex: number;
}

export function PlanResult({
  best,
  alternatives,
  onSelectAlternative,
  activeIndex,
}: PlanResultProps) {
  const all = [best, ...alternatives];
  const active = all[activeIndex] ?? best;

  return (
    <div className="space-y-4">
      {/* Plan selector */}
      {all.length > 1 && (
        <div className="flex gap-1">
          {all.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectAlternative(i)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeIndex === i
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {i === 0 ? "Best" : `Alt ${i}`}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>{active.stops.length} stops</span>
        <span>~£{active.total_estimated_spend}</span>
      </div>

      {/* Why this plan */}
      {active.why_this_plan.length > 0 && (
        <ul className="space-y-0.5 text-xs text-gray-500">
          {active.why_this_plan.map((reason, i) => (
            <li key={i}>- {reason}</li>
          ))}
        </ul>
      )}

      {/* Stops */}
      <div className="space-y-2">
        {active.stops.map((stop, i) => (
          <div key={i} className="relative">
            {/* Connector */}
            {i < active.stops.length - 1 && (
              <div className="absolute left-3 top-10 h-[calc(100%)] w-px bg-gray-200" />
            )}

            <div className="flex gap-3">
              {/* Number */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                {stop.stop_order}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stop.venue.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stop.venue.venue_type} · {stop.venue.neighborhood}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    ~£{stop.estimated_spend_gbp}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">{stop.explanation}</p>

                {/* Tags */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {stop.venue.vibe_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Travel to next */}
                {stop.estimated_travel_minutes_to_next != null && (
                  <p className="mt-1.5 text-[10px] text-gray-400">
                    {stop.distance_to_next_km?.toFixed(1)}km ·{" "}
                    {Math.round(stop.estimated_travel_minutes_to_next)} min walk
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
