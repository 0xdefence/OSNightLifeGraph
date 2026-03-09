"""Venue search and detail service."""

import math
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Cuisine,
    Event,
    MusicGenre,
    Neighborhood,
    OpeningHours,
    Venue,
    VenueSimilarity,
    VenueType,
    VibeTag,
    venue_cuisines,
    venue_music_genres,
    venue_vibe_tags,
)
from app.schemas.venue import (
    EventItem,
    NearbyVenueItem,
    OpeningHoursItem,
    SimilarVenueItem,
    VenueDetail,
    VenueListItem,
    VenueListResponse,
)


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def _venue_to_list_item(venue: Venue) -> VenueListItem:
    return VenueListItem(
        id=str(venue.id),
        slug=venue.slug,
        name=venue.name,
        venue_type=venue.venue_type.name,
        neighborhood=venue.neighborhood.name,
        lat=venue.lat,
        lng=venue.lng,
        price_band=venue.price_band,
        average_spend_gbp=venue.average_spend_gbp,
        average_rating=venue.average_rating,
        good_for_date=venue.good_for_date,
        good_for_group=venue.good_for_group,
        good_for_late_night=venue.good_for_late_night,
        vibe_tags=[t.name for t in venue.vibe_tags],
        music_genres=[g.name for g in venue.music_genres],
        cuisines=[c.name for c in venue.cuisines],
    )


def search_venues(
    db: Session,
    *,
    q: str | None = None,
    neighborhood: str | None = None,
    venue_type: str | None = None,
    vibe_tags: list[str] | None = None,
    cuisines: list[str] | None = None,
    music_genres: list[str] | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    good_for_date: bool | None = None,
    good_for_group: bool | None = None,
    late_night: bool | None = None,
    open_after: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    limit: int = 20,
    offset: int = 0,
) -> VenueListResponse:
    query = (
        select(Venue)
        .join(Venue.venue_type)
        .join(Venue.neighborhood)
        .options(
            joinedload(Venue.venue_type),
            joinedload(Venue.neighborhood),
            joinedload(Venue.vibe_tags),
            joinedload(Venue.cuisines),
            joinedload(Venue.music_genres),
        )
    )

    # Free-text search using pg_trgm similarity on name/description
    if q:
        search_term = f"%{q}%"
        query = query.where(
            Venue.name.ilike(search_term) | Venue.description.ilike(search_term)
        )

    if neighborhood:
        query = query.where(Neighborhood.slug == neighborhood)

    if venue_type:
        query = query.where(VenueType.slug == venue_type)

    if min_price is not None:
        query = query.where(Venue.price_band >= min_price)

    if max_price is not None:
        query = query.where(Venue.price_band <= max_price)

    if good_for_date is not None:
        query = query.where(Venue.good_for_date == good_for_date)

    if good_for_group is not None:
        query = query.where(Venue.good_for_group == good_for_group)

    if late_night is not None:
        query = query.where(Venue.good_for_late_night == late_night)

    # Filter by vibe tags (venue must have ALL specified tags)
    if vibe_tags:
        for tag_slug in vibe_tags:
            tag_subq = (
                select(venue_vibe_tags.c.venue_id)
                .join(VibeTag, venue_vibe_tags.c.vibe_tag_id == VibeTag.id)
                .where(VibeTag.slug == tag_slug)
            )
            query = query.where(Venue.id.in_(tag_subq))

    # Filter by cuisines (venue must have ANY of specified cuisines)
    if cuisines:
        cuisine_subq = (
            select(venue_cuisines.c.venue_id)
            .join(Cuisine, venue_cuisines.c.cuisine_id == Cuisine.id)
            .where(Cuisine.slug.in_(cuisines))
        )
        query = query.where(Venue.id.in_(cuisine_subq))

    # Filter by music genres (venue must have ANY of specified genres)
    if music_genres:
        genre_subq = (
            select(venue_music_genres.c.venue_id)
            .join(MusicGenre, venue_music_genres.c.music_genre_id == MusicGenre.id)
            .where(MusicGenre.slug.in_(music_genres))
        )
        query = query.where(Venue.id.in_(genre_subq))

    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar() or 0

    # Apply ordering and pagination
    query = query.order_by(Venue.popularity_score.desc(), Venue.average_rating.desc())
    query = query.offset(offset).limit(limit)

    venues = db.execute(query).unique().scalars().all()

    # Post-filter by radius if lat/lng provided
    items = []
    for v in venues:
        if lat is not None and lng is not None and radius_km is not None:
            dist = haversine(lat, lng, v.lat, v.lng)
            if dist > radius_km:
                continue
        items.append(_venue_to_list_item(v))

    return VenueListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


def _venue_detail_query():
    return (
        select(Venue)
        .options(
            joinedload(Venue.venue_type),
            joinedload(Venue.neighborhood),
            joinedload(Venue.vibe_tags),
            joinedload(Venue.cuisines),
            joinedload(Venue.music_genres),
            joinedload(Venue.opening_hours),
            joinedload(Venue.events),
        )
    )


def get_venue_detail(db: Session, venue_id: str) -> VenueDetail | None:
    # Try slug first (most common from frontend), then UUID
    venue = (
        db.execute(_venue_detail_query().where(Venue.slug == venue_id))
        .unique()
        .scalar_one_or_none()
    )

    if venue is None:
        try:
            import uuid as _uuid
            parsed = _uuid.UUID(venue_id)
            venue = (
                db.execute(_venue_detail_query().where(Venue.id == parsed))
                .unique()
                .scalar_one_or_none()
            )
        except ValueError:
            pass

    if venue is None:
        return None

    # Nearby venues (same neighborhood, excluding self)
    nearby_rows = (
        db.execute(
            select(Venue)
            .options(joinedload(Venue.venue_type))
            .where(Venue.neighborhood_id == venue.neighborhood_id)
            .where(Venue.id != venue.id)
            .order_by(Venue.popularity_score.desc())
            .limit(5)
        )
        .unique()
        .scalars()
        .all()
    )
    nearby = [
        NearbyVenueItem(
            id=str(n.id),
            slug=n.slug,
            name=n.name,
            venue_type=n.venue_type.name,
            distance_km=round(haversine(venue.lat, venue.lng, n.lat, n.lng), 2),
        )
        for n in nearby_rows
    ]

    # Similar venues
    sim_rows = db.execute(
        select(VenueSimilarity, Venue)
        .join(Venue, VenueSimilarity.similar_venue_id == Venue.id)
        .options(joinedload(Venue.venue_type))
        .where(VenueSimilarity.venue_id == venue.id)
        .order_by(VenueSimilarity.similarity_score.desc())
        .limit(5)
    ).unique().all()

    similar = [
        SimilarVenueItem(
            id=str(v.id),
            slug=v.slug,
            name=v.name,
            venue_type=v.venue_type.name,
            similarity_score=sim.similarity_score,
            reason=sim.reason,
        )
        for sim, v in sim_rows
    ]

    # Opening hours sorted by day
    hours = sorted(venue.opening_hours, key=lambda h: h.day_of_week)

    # Upcoming events
    now = datetime.now(timezone.utc)
    upcoming = [e for e in venue.events if e.end_at > now]
    upcoming.sort(key=lambda e: e.start_at)

    return VenueDetail(
        id=str(venue.id),
        slug=venue.slug,
        name=venue.name,
        description=venue.description,
        venue_type=venue.venue_type.name,
        neighborhood=venue.neighborhood.name,
        neighborhood_slug=venue.neighborhood.slug,
        address=venue.address,
        lat=venue.lat,
        lng=venue.lng,
        price_band=venue.price_band,
        average_spend_gbp=venue.average_spend_gbp,
        average_rating=venue.average_rating,
        booking_url=venue.booking_url,
        is_bookable=venue.is_bookable,
        good_for_date=venue.good_for_date,
        good_for_group=venue.good_for_group,
        good_for_late_night=venue.good_for_late_night,
        closes_after_midnight=venue.closes_after_midnight,
        noise_level=venue.noise_level,
        dress_code=venue.dress_code,
        vibe_tags=[t.name for t in venue.vibe_tags],
        cuisines=[c.name for c in venue.cuisines],
        music_genres=[g.name for g in venue.music_genres],
        opening_hours=[
            OpeningHoursItem(
                day_of_week=h.day_of_week,
                opens_at=h.opens_at,
                closes_at=h.closes_at,
            )
            for h in hours
        ],
        events=[
            EventItem(
                id=str(e.id),
                name=e.name,
                start_at=e.start_at,
                end_at=e.end_at,
                genre=e.genre,
                estimated_cover_gbp=e.estimated_cover_gbp,
            )
            for e in upcoming
        ],
        nearby_venues=nearby,
        similar_venues=similar,
    )
