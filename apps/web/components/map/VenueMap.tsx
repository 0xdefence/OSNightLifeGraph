"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { VenueListItem } from "@/lib/types";

const LONDON_CENTER: [number, number] = [-0.1276, 51.5074];
const DEFAULT_ZOOM = 12;

const TYPE_COLOR: Record<string, string> = {
  restaurant: "#2563eb",
  bar: "#7c3aed",
  club: "#ec4899",
};

interface VenueMapProps {
  venues: VenueListItem[];
  selectedSlug?: string | null;
  onSelectVenue: (slug: string) => void;
}

export function VenueMap({ venues, selectedSlug, onSelectVenue }: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: LONDON_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    venues.forEach((venue) => {
      const isSelected = venue.slug === selectedSlug;
      const color = TYPE_COLOR[venue.venue_type] ?? "#6b7280";

      const el = document.createElement("div");
      el.style.width = isSelected ? "16px" : "10px";
      el.style.height = isSelected ? "16px" : "10px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = color;
      el.style.border = isSelected ? "3px solid #111827" : "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
      el.style.transition = "all 0.15s ease";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([venue.lng, venue.lat])
        .addTo(map);

      el.addEventListener("click", () => onSelectVenue(venue.slug));
      markersRef.current.push(marker);
    });
  }, [venues, selectedSlug, onSelectVenue]);

  // Fly to selected venue
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) return;
    const venue = venues.find((v) => v.slug === selectedSlug);
    if (venue) {
      map.flyTo({ center: [venue.lng, venue.lat], zoom: 14, duration: 800 });
    }
  }, [selectedSlug, venues]);

  return <div ref={containerRef} className="h-full w-full" />;
}
