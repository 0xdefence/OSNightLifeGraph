from pydantic import BaseModel


class QueryParseRequest(BaseModel):
    query: str


class StructuredQuery(BaseModel):
    area: str | None
    budget_total: float | None
    desired_stops: list[str]
    vibes: list[str]
    venue_type: str | None
    cuisines: list[str]
    music_genres: list[str]
    good_for_date: bool
    good_for_group: bool
    late_night: bool


class QueryParseResponse(BaseModel):
    structured_query: StructuredQuery
    notes: list[str]
    confidence: float
