"""Pure-Python fallback for the C++ optimizer module."""

import math
from dataclasses import dataclass, field


@dataclass
class Stop:
    venue_id: str = ""
    lat: float = 0.0
    lng: float = 0.0
    spend: float = 0.0
    score: float = 0.0


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    return R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def score_itinerary(stops: list[Stop], budget: float, max_travel_km: float) -> float:
    if not stops:
        return 0.0

    total_spend = sum(s.spend for s in stops)
    total_distance = sum(
        haversine(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng)
        for i in range(len(stops) - 1)
    )

    budget_factor = 1.0
    if budget > 0 and total_spend > budget:
        budget_factor = max(0.0, 1.0 - (total_spend - budget) / budget)

    distance_factor = 1.0
    if max_travel_km > 0 and len(stops) > 1:
        avg_leg = total_distance / (len(stops) - 1)
        if avg_leg > max_travel_km:
            distance_factor = max(0.0, 1.0 - (avg_leg - max_travel_km) / max_travel_km)

    avg_venue_score = sum(s.score for s in stops) / len(stops)

    return avg_venue_score * budget_factor * distance_factor


def rank_itineraries(
    candidates: list[list[Stop]], budget: float, max_travel_km: float
) -> list[int]:
    scored = [(score_itinerary(c, budget, max_travel_km), i) for i, c in enumerate(candidates)]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [i for _, i in scored]
