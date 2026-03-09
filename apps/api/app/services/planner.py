"""Itinerary planner service.

Generates night plans by:
1. Finding candidate venues for each desired stop type
2. Scoring candidates by preference match
3. Building candidate itineraries from combinations
4. Scoring itineraries using the optimizer module
5. Returning the best with explanations
"""

import itertools
import math
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Neighborhood,
    Venue,
    VenueType,
    venue_vibe_tags,
    venue_music_genres,
    VibeTag,
    MusicGenre,
)
from app.schemas.plan import (
    Itinerary,
    PlanPreferences,
    PlanRequest,
    PlanResponse,
    PlanStop,
    StopVenue,
)

# Import optimizer (uses Python fallback if C++ not built)
from darkknight_optimizer import Stop as OptimizerStop, rank_itineraries


WALK_SPEED_KMH = 4.5  # average walking speed


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


def _score_venue_for_preferences(venue: Venue, prefs: PlanPreferences) -> float:
    """Score a venue 0-1 based on how well it matches preferences."""
    score = 0.5  # base
    signals = 0

    venue_vibe_names = {t.name for t in venue.vibe_tags}
    venue_genre_names = {g.name for g in venue.music_genres}
    venue_cuisine_names = {c.name for c in venue.cuisines}

    # Vibe match
    if prefs.vibes:
        matched = len(set(prefs.vibes) & venue_vibe_names)
        if matched:
            score += 0.15 * (matched / len(prefs.vibes))
            signals += 1

    # Genre match
    if prefs.music_genres:
        matched = len(set(prefs.music_genres) & venue_genre_names)
        if matched:
            score += 0.1 * (matched / len(prefs.music_genres))
            signals += 1

    # Cuisine match
    if prefs.cuisines:
        matched = len(set(prefs.cuisines) & venue_cuisine_names)
        if matched:
            score += 0.1 * (matched / len(prefs.cuisines))
            signals += 1

    # Date/group match
    if prefs.good_for_date and venue.good_for_date:
        score += 0.1
        signals += 1
    if prefs.good_for_group and venue.good_for_group:
        score += 0.1
        signals += 1

    # Rating bonus
    score += (venue.average_rating - 3.5) * 0.05  # 3.5→0, 4.5→0.05

    # Popularity bonus
    score += venue.popularity_score * 0.05

    return min(1.0, max(0.0, score))


def _get_candidates(
    db: Session,
    venue_type_slug: str,
    area_slug: str | None,
    budget_per_stop: float | None,
    prefs: PlanPreferences,
    limit: int = 10,
) -> list[tuple[Venue, float]]:
    """Get scored candidate venues for a stop type."""
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
        .where(VenueType.slug == venue_type_slug)
    )

    if area_slug:
        # Include venues in the target area and adjacent areas
        query = query.where(Neighborhood.slug == area_slug)

    if budget_per_stop:
        # Allow some headroom
        query = query.where(Venue.average_spend_gbp <= budget_per_stop * 1.3)

    venues = db.execute(query).unique().scalars().all()

    if not venues and area_slug:
        # Fallback: widen to all areas
        query_wide = (
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
            .where(VenueType.slug == venue_type_slug)
        )
        if budget_per_stop:
            query_wide = query_wide.where(Venue.average_spend_gbp <= budget_per_stop * 1.3)
        venues = db.execute(query_wide).unique().scalars().all()

    scored = [(v, _score_venue_for_preferences(v, prefs)) for v in venues]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]


def _venue_to_stop_schema(venue: Venue) -> StopVenue:
    return StopVenue(
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
        vibe_tags=[t.name for t in venue.vibe_tags],
    )


def _explain_stop(venue: Venue, stop_order: int, total_stops: int, prefs: PlanPreferences, budget_per_stop: float | None) -> str:
    """Generate a plain-English explanation for why this venue was chosen."""
    reasons = []

    venue_vibe_names = {t.name for t in venue.vibe_tags}

    # Budget fit
    if budget_per_stop and venue.average_spend_gbp <= budget_per_stop:
        reasons.append("fits your budget")

    # Preference matches
    if prefs.good_for_date and venue.good_for_date:
        reasons.append("suits date night")
    if prefs.good_for_group and venue.good_for_group:
        reasons.append("works well for groups")

    matched_vibes = set(prefs.vibes) & venue_vibe_names
    if matched_vibes:
        reasons.append(f"matches your {', '.join(sorted(matched_vibes))} vibe")

    venue_genre_names = {g.name for g in venue.music_genres}
    matched_genres = set(prefs.music_genres) & venue_genre_names
    if matched_genres:
        reasons.append(f"plays {', '.join(sorted(matched_genres))}")

    # Rating
    if venue.average_rating >= 4.3:
        reasons.append(f"highly rated ({venue.average_rating})")

    # Late-night for last stop
    if stop_order == total_stops and venue.good_for_late_night:
        reasons.append("good for late night")

    if not reasons:
        reasons.append(f"well-reviewed {venue.venue_type.name} in {venue.neighborhood.name}")

    return f"Chosen because it {', '.join(reasons)}."


def _explain_plan(stops: list[tuple[Venue, float]], area_slug: str | None, budget: float | None) -> list[str]:
    """Generate overall plan explanation strings."""
    explanations = []

    if area_slug:
        areas = {v.neighborhood.name for v, _ in stops}
        if len(areas) == 1:
            explanations.append(f"All stops are in {next(iter(areas))}.")
        else:
            explanations.append(f"Stops span {', '.join(sorted(areas))} — all within walking distance.")

    total_spend = sum(v.average_spend_gbp for v, _ in stops)
    if budget:
        if total_spend <= budget:
            explanations.append(f"The route stays within your £{budget:.0f} budget (estimated £{total_spend:.0f} total).")
        else:
            explanations.append(f"Estimated spend is £{total_spend:.0f}, slightly above the £{budget:.0f} budget.")

    # Check for late-night last stop
    if stops:
        last_venue = stops[-1][0]
        if last_venue.good_for_late_night:
            last_vibes = [t.name for t in last_venue.vibe_tags]
            if "music-forward" in last_vibes:
                explanations.append("The final stop supports late-night music-led venues.")
            else:
                explanations.append("The final stop stays open late.")

    return explanations


def generate_plan(db: Session, request: PlanRequest) -> PlanResponse:
    num_stops = len(request.desired_stops)
    budget_per_stop = (request.budget_total / num_stops) if request.budget_total else None

    # Get candidates for each stop type
    candidates_per_stop: list[list[tuple[Venue, float]]] = []
    for stop_type in request.desired_stops:
        candidates = _get_candidates(
            db,
            venue_type_slug=stop_type,
            area_slug=request.area,
            budget_per_stop=budget_per_stop,
            prefs=request.preferences,
            limit=6,
        )
        if not candidates:
            # If no candidates for this type, get any venue of this type
            candidates = _get_candidates(
                db,
                venue_type_slug=stop_type,
                area_slug=None,
                budget_per_stop=None,
                prefs=request.preferences,
                limit=3,
            )
        candidates_per_stop.append(candidates)

    # Build candidate itineraries from combinations
    # Take top candidates per stop to limit combinations
    top_n = min(4, max(2, 12 // num_stops))
    trimmed = [c[:top_n] for c in candidates_per_stop]

    # Generate all combinations
    combo_itineraries: list[list[tuple[Venue, float]]] = []
    for combo in itertools.product(*trimmed):
        # Skip if any venue appears twice
        venue_ids = [v.id for v, _ in combo]
        if len(set(venue_ids)) < len(venue_ids):
            continue
        combo_itineraries.append(list(combo))

    if not combo_itineraries:
        # Fallback: just use the top candidate for each stop
        fallback = []
        for candidates in candidates_per_stop:
            if candidates:
                fallback.append(candidates[0])
        combo_itineraries = [fallback] if fallback else []

    if not combo_itineraries:
        raise ValueError("No venues found matching the plan criteria")

    # Score each itinerary using the optimizer
    optimizer_candidates = []
    for combo in combo_itineraries:
        opt_stops = []
        for venue, pref_score in combo:
            s = OptimizerStop()
            s.venue_id = str(venue.id)
            s.lat = venue.lat
            s.lng = venue.lng
            s.spend = venue.average_spend_gbp
            s.score = pref_score
            opt_stops.append(s)
        optimizer_candidates.append(opt_stops)

    ranked_indices = rank_itineraries(
        optimizer_candidates,
        request.budget_total or 0,
        request.max_travel_km_between_stops,
    )

    # Build response itineraries (best + up to 2 alternatives)
    def _build_itinerary(combo: list[tuple[Venue, float]], rank_score: float) -> Itinerary:
        stops = []
        current_time = request.start_time
        total_spend = 0.0

        for i, (venue, pref_score) in enumerate(combo):
            spend = venue.average_spend_gbp
            total_spend += spend

            # Calculate distance to next
            dist_to_next = None
            travel_minutes = None
            if i + 1 < len(combo):
                next_venue = combo[i + 1][0]
                dist_to_next = round(haversine(venue.lat, venue.lng, next_venue.lat, next_venue.lng), 2)
                travel_minutes = max(5, round(dist_to_next / WALK_SPEED_KMH * 60))

            explanation = _explain_stop(
                venue, i + 1, len(combo), request.preferences, budget_per_stop
            )

            stops.append(PlanStop(
                stop_order=i + 1,
                venue=_venue_to_stop_schema(venue),
                estimated_spend_gbp=spend,
                distance_to_next_km=dist_to_next,
                estimated_travel_minutes_to_next=travel_minutes,
                explanation=explanation,
            ))

        why = _explain_plan(combo, request.area, request.budget_total)

        return Itinerary(
            total_estimated_spend=total_spend,
            total_score=round(rank_score, 2),
            stops=stops,
            why_this_plan=why,
        )

    # Get scores for building itineraries
    from darkknight_optimizer import score_itinerary as opt_score
    results = []
    for idx in ranked_indices[:3]:
        combo = combo_itineraries[idx]
        opt_stops = optimizer_candidates[idx]
        score = opt_score(opt_stops, request.budget_total or 0, request.max_travel_km_between_stops)
        results.append(_build_itinerary(combo, score))

    best = results[0]
    alternatives = results[1:] if len(results) > 1 else []

    return PlanResponse(best_itinerary=best, alternatives=alternatives)
