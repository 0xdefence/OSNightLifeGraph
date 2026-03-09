export type VenueType = "restaurant" | "bar" | "club";

export interface FilterOption {
  slug: string;
  name: string;
}

export interface FiltersResponse {
  neighborhoods: FilterOption[];
  venue_types: FilterOption[];
  vibe_tags: FilterOption[];
  cuisines: FilterOption[];
  music_genres: FilterOption[];
  price_bands: number[];
}

export interface VenueListItem {
  id: string;
  slug: string;
  name: string;
  venue_type: VenueType;
  neighborhood: string;
  lat: number;
  lng: number;
  price_band: number;
  average_spend_gbp: number;
  average_rating: number;
  good_for_date: boolean;
  good_for_group: boolean;
  good_for_late_night: boolean;
  vibe_tags: string[];
  music_genres: string[];
  cuisines: string[];
}

export interface VenueListResponse {
  items: VenueListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface OpeningHoursItem {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
}

export interface EventItem {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
  genre: string | null;
  estimated_cover_gbp: number | null;
}

export interface NearbyVenueItem {
  id: string;
  slug: string;
  name: string;
  venue_type: string;
  distance_km: number;
}

export interface SimilarVenueItem {
  id: string;
  slug: string;
  name: string;
  venue_type: string;
  similarity_score: number;
  reason: string | null;
}

export interface VenueDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  venue_type: string;
  neighborhood: string;
  neighborhood_slug: string;
  address: string | null;
  lat: number;
  lng: number;
  price_band: number;
  average_spend_gbp: number;
  average_rating: number;
  booking_url: string | null;
  is_bookable: boolean;
  good_for_date: boolean;
  good_for_group: boolean;
  good_for_late_night: boolean;
  closes_after_midnight: boolean;
  noise_level: number;
  dress_code: string | null;
  vibe_tags: string[];
  cuisines: string[];
  music_genres: string[];
  opening_hours: OpeningHoursItem[];
  events: EventItem[];
  nearby_venues: NearbyVenueItem[];
  similar_venues: SimilarVenueItem[];
}

export interface StructuredQuery {
  area: string | null;
  budget_total: number | null;
  desired_stops: string[];
  vibes: string[];
  venue_type: string | null;
  cuisines: string[];
  music_genres: string[];
  good_for_date: boolean;
  good_for_group: boolean;
  late_night: boolean;
}

export interface QueryParseResponse {
  structured_query: StructuredQuery;
  notes: string[];
  confidence: number;
}

export interface StopVenue {
  id: string;
  slug: string;
  name: string;
  venue_type: string;
  neighborhood: string;
  lat: number;
  lng: number;
  price_band: number;
  average_spend_gbp: number;
  average_rating: number;
  vibe_tags: string[];
}

export interface PlanStop {
  stop_order: number;
  venue: StopVenue;
  estimated_spend_gbp: number;
  distance_to_next_km: number | null;
  estimated_travel_minutes_to_next: number | null;
  explanation: string;
}

export interface PlanItinerary {
  total_estimated_spend: number;
  total_score: number;
  stops: PlanStop[];
  why_this_plan: string[];
}

export interface PlanResponse {
  best_itinerary: PlanItinerary;
  alternatives: PlanItinerary[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface VenueGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
