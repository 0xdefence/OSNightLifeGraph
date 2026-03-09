from datetime import datetime

from pydantic import BaseModel


class VenueListItem(BaseModel):
    id: str
    slug: str
    name: str
    venue_type: str
    neighborhood: str
    lat: float
    lng: float
    price_band: int
    average_spend_gbp: float
    average_rating: float
    good_for_date: bool
    good_for_group: bool
    good_for_late_night: bool
    vibe_tags: list[str]
    music_genres: list[str]
    cuisines: list[str]


class VenueListResponse(BaseModel):
    items: list[VenueListItem]
    total: int
    limit: int
    offset: int


class OpeningHoursItem(BaseModel):
    day_of_week: int
    opens_at: str
    closes_at: str


class EventItem(BaseModel):
    id: str
    name: str
    start_at: datetime
    end_at: datetime
    genre: str | None
    estimated_cover_gbp: float | None


class NearbyVenueItem(BaseModel):
    id: str
    slug: str
    name: str
    venue_type: str
    distance_km: float


class SimilarVenueItem(BaseModel):
    id: str
    slug: str
    name: str
    venue_type: str
    similarity_score: float
    reason: str | None


class VenueDetail(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None
    venue_type: str
    neighborhood: str
    neighborhood_slug: str
    address: str | None
    lat: float
    lng: float
    price_band: int
    average_spend_gbp: float
    average_rating: float
    booking_url: str | None
    is_bookable: bool
    good_for_date: bool
    good_for_group: bool
    good_for_late_night: bool
    closes_after_midnight: bool
    noise_level: int
    dress_code: str | None
    vibe_tags: list[str]
    cuisines: list[str]
    music_genres: list[str]
    opening_hours: list[OpeningHoursItem]
    events: list[EventItem]
    nearby_venues: list[NearbyVenueItem]
    similar_venues: list[SimilarVenueItem]
