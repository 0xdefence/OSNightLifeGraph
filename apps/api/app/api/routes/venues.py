from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.venue import VenueDetail, VenueListResponse
from app.services.search import get_venue_detail, search_venues

router = APIRouter()


@router.get("/venues", response_model=VenueListResponse)
def list_venues(
    q: str | None = None,
    neighborhood: str | None = None,
    venue_type: str | None = None,
    vibe_tags: list[str] = Query(default=[]),
    cuisines: list[str] = Query(default=[]),
    music_genres: list[str] = Query(default=[]),
    min_price: int | None = None,
    max_price: int | None = None,
    good_for_date: bool | None = None,
    good_for_group: bool | None = None,
    late_night: bool | None = None,
    open_after: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return search_venues(
        db,
        q=q,
        neighborhood=neighborhood,
        venue_type=venue_type,
        vibe_tags=vibe_tags or None,
        cuisines=cuisines or None,
        music_genres=music_genres or None,
        min_price=min_price,
        max_price=max_price,
        good_for_date=good_for_date,
        good_for_group=good_for_group,
        late_night=late_night,
        open_after=open_after,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        limit=limit,
        offset=offset,
    )


@router.get("/venues/{venue_id}", response_model=VenueDetail)
def get_venue(venue_id: str, db: Session = Depends(get_db)):
    detail = get_venue_detail(db, venue_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    return detail
