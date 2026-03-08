try:
    from darkknight_optimizer._optimizer import Stop, haversine, score_itinerary, rank_itineraries  # noqa: F401

    NATIVE = True
except ImportError:
    from darkknight_optimizer.fallback import Stop, haversine, score_itinerary, rank_itineraries  # noqa: F401

    NATIVE = False
