from fastapi import APIRouter

from app.schemas.query import QueryParseRequest, QueryParseResponse, StructuredQuery
from app.services.parser import parse_query

router = APIRouter()


@router.post("/query/parse", response_model=QueryParseResponse)
def parse_user_query(body: QueryParseRequest):
    parsed = parse_query(body.query)
    return QueryParseResponse(
        structured_query=StructuredQuery(
            area=parsed.area,
            budget_total=parsed.budget_total,
            desired_stops=parsed.desired_stops,
            vibes=parsed.vibes,
            venue_type=parsed.venue_type,
            cuisines=parsed.cuisines,
            music_genres=parsed.music_genres,
            good_for_date=parsed.good_for_date,
            good_for_group=parsed.good_for_group,
            late_night=parsed.late_night,
        ),
        notes=parsed.notes,
        confidence=parsed.confidence,
    )
