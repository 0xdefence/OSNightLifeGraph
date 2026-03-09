from datetime import datetime

from pydantic import BaseModel


class PlanPreferences(BaseModel):
    vibes: list[str] = []
    music_genres: list[str] = []
    cuisines: list[str] = []
    good_for_date: bool = False
    good_for_group: bool = False


class PlanRequest(BaseModel):
    query: str | None = None
    area: str | None = None
    budget_total: float | None = None
    party_size: int = 2
    start_time: datetime
    desired_stops: list[str] = ["restaurant", "bar", "club"]
    max_travel_km_between_stops: float = 3.0
    preferences: PlanPreferences = PlanPreferences()


class StopVenue(BaseModel):
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
    vibe_tags: list[str]


class PlanStop(BaseModel):
    stop_order: int
    venue: StopVenue
    estimated_spend_gbp: float
    distance_to_next_km: float | None
    estimated_travel_minutes_to_next: int | None
    explanation: str


class Itinerary(BaseModel):
    total_estimated_spend: float
    total_score: float
    stops: list[PlanStop]
    why_this_plan: list[str]


class PlanResponse(BaseModel):
    best_itinerary: Itinerary
    alternatives: list[Itinerary]
