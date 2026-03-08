export type VenueType = "restaurant" | "bar" | "club";

export type PriceBand = 1 | 2 | 3 | 4 | 5;

export interface VenueListItem {
  id: string;
  slug: string;
  name: string;
  venue_type: VenueType;
  neighborhood: string;
  lat: number;
  lng: number;
  price_band: PriceBand;
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

export interface HealthResponse {
  status: "ok";
}
