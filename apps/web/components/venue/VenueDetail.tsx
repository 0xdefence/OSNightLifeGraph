"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVenueDetail } from "@/lib/api";
import { useState } from "react";
import { X, Heart, Star, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface VenueDetailProps {
  slug: string;
  onClose: () => void;
  onSelectVenue: (slug: string) => void;
}

export function VenueDetail({ slug, onClose, onSelectVenue }: VenueDetailProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["venue", slug],
    queryFn: () => fetchVenueDetail(slug),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-neutral-400">Loading venue...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Image header */}
      <div className="relative h-56 w-full bg-neutral-100 flex-none">
        <div className="w-full h-full bg-gradient-to-br from-neutral-300 via-neutral-200 to-neutral-400" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-80" />

        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-7 h-7 rounded bg-white/95 text-neutral-700 flex items-center justify-center hover:text-neutral-900 shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isSaved ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-white/95 text-neutral-700 flex items-center justify-center hover:text-neutral-900 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Title area */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {data.venue_type}
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight leading-none mb-3">
            {data.name}
          </h2>
          <div className="flex items-center gap-x-3 text-sm text-neutral-600 font-medium">
            <span className="flex items-center gap-1 font-bold text-neutral-900">
              <Star className="w-3.5 h-3.5 fill-neutral-900" />
              {data.average_rating.toFixed(1)}
            </span>
            <span className="text-neutral-300">&bull;</span>
            <span>{data.neighborhood}</span>
            <span className="text-neutral-300">&bull;</span>
            <span className="font-semibold text-neutral-900">
              £{data.average_spend_gbp} avg
            </span>
          </div>
        </div>

        {/* About */}
        {data.description && (
          <div>
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              About
            </h4>
            <p className="text-[13px] text-neutral-600 leading-relaxed">
              {data.description}
            </p>
          </div>
        )}

        <div className="h-px bg-neutral-100" />

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <div>
            <span className="text-[11px] text-neutral-500 block mb-1">
              Atmosphere
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {data.vibe_tags.slice(0, 2).join(", ") || "—"}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block mb-1">
              Good For
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {[
                data.good_for_date && "Dates",
                data.good_for_group && "Groups",
                data.good_for_late_night && "Late night",
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block mb-1">
              Hours
            </span>
            <span className="text-xs font-semibold text-green-700">
              {data.opening_hours.length > 0
                ? `Open until ${data.opening_hours[0].closes_at}`
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block mb-1">
              Noise Level
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {"●".repeat(data.noise_level)}
              {"○".repeat(5 - data.noise_level)}
            </span>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Tags */}
        {(data.vibe_tags.length > 0 ||
          data.cuisines.length > 0 ||
          data.music_genres.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {data.vibe_tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {data.cuisines.map((c) => (
              <span
                key={c}
                className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
              >
                {c}
              </span>
            ))}
            {data.music_genres.map((g) => (
              <span
                key={g}
                className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Events */}
        {data.events.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Upcoming Events
            </h4>
            <div className="space-y-1.5">
              {data.events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-neutral-900">{e.name}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(e.start_at).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {e.genre && ` · ${e.genre}`}
                    {e.estimated_cover_gbp != null &&
                      ` · £${e.estimated_cover_gbp}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar venues */}
        {data.similar_venues.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Similar Places
            </h4>
            <div className="space-y-1">
              {data.similar_venues.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectVenue(s.slug)}
                  className="w-full text-left p-3 rounded-xl border border-neutral-200/60 bg-white hover:border-neutral-300 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900">
                      {s.name}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-400 capitalize">
                      {s.venue_type}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">{s.reason}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nearby venues */}
        {data.nearby_venues.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Nearby
            </h4>
            <div className="space-y-1">
              {data.nearby_venues.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onSelectVenue(n.slug)}
                  className="w-full text-left p-3 rounded-xl border border-neutral-200/60 bg-white hover:border-neutral-300 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900">
                      {n.name}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-400 capitalize">
                      {n.venue_type}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {n.distance_km}km
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="p-4 border-t border-neutral-100 bg-white flex gap-3 flex-none">
        <Link
          href={`/graph?venue=${slug}`}
          className="flex-[0.5] flex items-center justify-center h-10 text-xs font-semibold rounded-md bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          View Graph
        </Link>
        <button className="flex-1 h-10 text-xs font-semibold rounded-md flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-black transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add to Plan
        </button>
      </div>
    </div>
  );
}
