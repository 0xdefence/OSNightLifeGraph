"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVenueDetail } from "@/lib/api";
import { VenueGraph } from "@/components/graph/VenueGraph";
import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface VenueDetailProps {
  slug: string;
  onClose: () => void;
  onSelectVenue: (slug: string) => void;
}

export function VenueDetail({ slug, onClose, onSelectVenue }: VenueDetailProps) {
  const [tab, setTab] = useState<"detail" | "graph">("detail");
  const { data, isLoading } = useQuery({
    queryKey: ["venue", slug],
    queryFn: () => fetchVenueDetail(slug),
  });

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-gray-400">Loading venue...</div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("detail")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              tab === "detail"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Detail
          </button>
          <button
            onClick={() => setTab("graph")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              tab === "graph"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Graph
          </button>
        </div>
      </div>

      {tab === "graph" ? (
        <div className="flex-1 overflow-auto p-4">
          <VenueGraph slug={slug} />
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {/* Name + basics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{data.name}</h2>
            <p className="text-sm text-gray-500">
              {data.venue_type} · {data.neighborhood}
            </p>
            {data.description && (
              <p className="mt-1 text-sm text-gray-600">{data.description}</p>
            )}
          </div>

          {/* Key info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Avg spend</p>
              <p className="font-medium text-gray-900">£{data.average_spend_gbp}</p>
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Rating</p>
              <p className="font-medium text-gray-900">{data.average_rating.toFixed(1)}</p>
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Noise level</p>
              <p className="font-medium text-gray-900">{"●".repeat(data.noise_level)}{"○".repeat(5 - data.noise_level)}</p>
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Bookable</p>
              <p className="font-medium text-gray-900">{data.is_bookable ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* Suitability */}
          <div className="flex flex-wrap gap-1.5">
            {data.good_for_date && (
              <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs text-pink-700">Good for dates</span>
            )}
            {data.good_for_group && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">Good for groups</span>
            )}
            {data.good_for_late_night && (
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-700">Late night</span>
            )}
            {data.dress_code && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
                Dress: {data.dress_code}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {data.vibe_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
            ))}
            {data.cuisines.map((c) => (
              <span key={c} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{c}</span>
            ))}
            {data.music_genres.map((g) => (
              <span key={g} className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">{g}</span>
            ))}
          </div>

          {/* Hours */}
          {data.opening_hours.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Hours</h4>
              <div className="space-y-0.5 text-sm">
                {data.opening_hours.map((h) => (
                  <div key={h.day_of_week} className="flex justify-between text-gray-600">
                    <span>{DAYS[h.day_of_week]}</span>
                    <span>{h.opens_at} – {h.closes_at}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {data.events.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Upcoming events</h4>
              <div className="space-y-1.5">
                {data.events.map((e) => (
                  <div key={e.id} className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(e.start_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      {e.genre && ` · ${e.genre}`}
                      {e.estimated_cover_gbp != null && ` · £${e.estimated_cover_gbp}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar venues */}
          {data.similar_venues.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Similar places</h4>
              <div className="space-y-1">
                {data.similar_venues.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectVenue(s.slug)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="ml-1.5 text-xs text-gray-400">{s.venue_type}</span>
                    </div>
                    <span className="text-xs text-gray-400">{s.reason}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nearby venues */}
          {data.nearby_venues.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Nearby</h4>
              <div className="space-y-1">
                {data.nearby_venues.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onSelectVenue(n.slug)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{n.name}</span>
                      <span className="ml-1.5 text-xs text-gray-400">{n.venue_type}</span>
                    </div>
                    <span className="text-xs text-gray-400">{n.distance_km}km</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Booking */}
          {data.booking_url && (
            <a
              href={data.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-gray-900 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800"
            >
              Book a table
            </a>
          )}
        </div>
      )}
    </div>
  );
}
