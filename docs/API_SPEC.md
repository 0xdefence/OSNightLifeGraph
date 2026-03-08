# API_SPEC.md

## General rules
- JSON API
- predictable response shapes
- stable naming
- frontend-friendly payloads
- no leaking raw DB internals into UI unnecessarily

## GET /health
Response:
```json
{
  "status": "ok"
}
```

## GET /filters
Returns available filter data.

Response shape:
```json
{
  "neighborhoods": [],
  "venue_types": [],
  "vibe_tags": [],
  "cuisines": [],
  "music_genres": [],
  "price_bands": [1,2,3,4,5]
}
```

## GET /venues
### Query params
- q
- neighborhood
- venue_type
- vibe_tags[]
- cuisines[]
- music_genres[]
- min_price
- max_price
- good_for_date
- good_for_group
- late_night
- open_after
- lat
- lng
- radius_km
- limit
- offset

### Response
```json
{
  "items": [
    {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "venue_type": "restaurant|bar|club",
      "neighborhood": "Soho",
      "lat": 0,
      "lng": 0,
      "price_band": 3,
      "average_spend_gbp": 35,
      "average_rating": 4.4,
      "good_for_date": true,
      "good_for_group": false,
      "good_for_late_night": false,
      "vibe_tags": ["romantic", "wine-led"],
      "music_genres": [],
      "cuisines": ["Italian"]
    }
  ],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

## GET /venues/{venue_id}
Returns full venue detail.

Must include:
- basic venue data
- opening hours
- nearby venues
- related / similar venues
- upcoming events if any

## POST /query/parse
### Input
```json
{
  "query": "Dinner then cocktails then a club in Shoreditch under 120"
}
```

### Output
```json
{
  "structured_query": {
    "area": "Shoreditch",
    "budget_total": 120,
    "desired_stops": ["restaurant", "bar", "club"],
    "vibes": ["lively", "good music"],
    "venue_type": null,
    "good_for_date": false,
    "good_for_group": false,
    "late_night": true
  },
  "notes": ["Detected route intent", "Detected total budget"],
  "confidence": 0.86
}
```

Rules:
- deterministic parser only
- use regex + synonyms + area vocab
- no external LLM dependency

## POST /plans/generate
### Input
```json
{
  "query": "Dinner then cocktails then a club in Shoreditch under 120",
  "area": "Shoreditch",
  "budget_total": 120,
  "party_size": 2,
  "start_time": "2026-03-13T19:30:00",
  "desired_stops": ["restaurant", "bar", "club"],
  "max_travel_km_between_stops": 3.0,
  "preferences": {
    "vibes": ["fun", "stylish", "good music"],
    "music_genres": ["house"],
    "good_for_date": true
  }
}
```

### Output
```json
{
  "best_itinerary": {
    "total_estimated_spend": 118,
    "total_score": 0.91,
    "stops": [
      {
        "stop_order": 1,
        "venue": {},
        "estimated_spend_gbp": 42,
        "distance_to_next_km": 0.8,
        "estimated_travel_minutes_to_next": 12,
        "explanation": "Chosen because it fits your budget, suits date night, and is close to the next stop."
      }
    ],
    "why_this_plan": [
      "All stops are in or near Shoreditch.",
      "The route stays within budget.",
      "The final stop supports late-night music-led venues."
    ]
  },
  "alternatives": []
}
```

## GET /graph/venue/{venue_id}
Returns a venue-centric graph.

Response shape:
```json
{
  "nodes": [
    { "id": "v1", "label": "Luna Room", "type": "venue" },
    { "id": "n1", "label": "Shoreditch", "type": "neighborhood" }
  ],
  "edges": [
    { "source": "v1", "target": "n1", "type": "LOCATED_IN" }
  ]
}
```

Graph scope for v1:
- venue -> neighborhood
- venue -> vibe tags
- venue -> cuisines
- venue -> music genres
- venue -> events
- venue -> similar venues

## Error handling
Use standard JSON errors with plain messages.
Avoid complex nested error contracts for v1.
