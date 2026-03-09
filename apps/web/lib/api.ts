import type {
  FiltersResponse,
  PlanResponse,
  QueryParseResponse,
  VenueDetail,
  VenueGraphResponse,
  VenueListResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function fetchFilters(): Promise<FiltersResponse> {
  return apiFetch("/filters");
}

export function fetchVenues(params: Record<string, string>): Promise<VenueListResponse> {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/venues?${qs}`);
}

export function fetchVenueDetail(slugOrId: string): Promise<VenueDetail> {
  return apiFetch(`/venues/${slugOrId}`);
}

export function parseQuery(query: string): Promise<QueryParseResponse> {
  return apiFetch("/query/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}

export function generatePlan(body: {
  query?: string;
  area?: string;
  budget_total?: number;
  party_size?: number;
  start_time: string;
  desired_stops?: string[];
  max_travel_km_between_stops?: number;
  preferences?: {
    vibes?: string[];
    music_genres?: string[];
    cuisines?: string[];
    good_for_date?: boolean;
    good_for_group?: boolean;
  };
}): Promise<PlanResponse> {
  return apiFetch("/plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchVenueGraph(slugOrId: string): Promise<VenueGraphResponse> {
  return apiFetch(`/graph/venue/${slugOrId}`);
}
