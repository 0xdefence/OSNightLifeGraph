"""Deterministic natural-language query parser.

Parses plain-English queries into structured filter/plan parameters
using regex + synonym dictionaries + area vocabulary. No LLM dependency.
"""

import re
from dataclasses import dataclass, field


# ── Vocabulary maps ─────────────────────────────────────────────

AREA_SYNONYMS: dict[str, str] = {
    "soho": "soho",
    "shoreditch": "shoreditch",
    "east london": "shoreditch",
    "east end": "shoreditch",
    "camden": "camden",
    "camden town": "camden",
    "peckham": "peckham",
    "hackney": "hackney",
    "covent garden": "covent-garden",
    "covent": "covent-garden",
    "west end": "covent-garden",
    "notting hill": "notting-hill",
    "dalston": "dalston",
    "london bridge": "london-bridge",
    "bermondsey": "london-bridge",
    "borough": "london-bridge",
    "brixton": "brixton",
    "south london": "brixton",
}

VENUE_TYPE_SYNONYMS: dict[str, str] = {
    "restaurant": "restaurant",
    "restaurants": "restaurant",
    "dinner": "restaurant",
    "food": "restaurant",
    "eat": "restaurant",
    "eating": "restaurant",
    "bar": "bar",
    "bars": "bar",
    "cocktails": "bar",
    "cocktail": "bar",
    "drinks": "bar",
    "pub": "bar",
    "wine bar": "bar",
    "club": "club",
    "clubs": "club",
    "clubbing": "club",
    "dancing": "club",
    "nightclub": "club",
    "rave": "club",
}

VIBE_SYNONYMS: dict[str, str] = {
    "romantic": "romantic",
    "romance": "romantic",
    "intimate": "intimate",
    "cosy": "intimate",
    "cozy": "intimate",
    "quiet": "intimate",
    "stylish": "stylish",
    "trendy": "stylish",
    "fancy": "stylish",
    "cool": "stylish",
    "bougie": "bougie",
    "upscale": "bougie",
    "posh": "bougie",
    "luxury": "bougie",
    "luxurious": "bougie",
    "lively": "lively",
    "buzzy": "lively",
    "vibrant": "lively",
    "energetic": "lively",
    "fun": "lively",
    "chaotic": "chaotic",
    "wild": "chaotic",
    "crazy": "chaotic",
    "relaxed": "relaxed",
    "chill": "relaxed",
    "laid back": "relaxed",
    "laid-back": "relaxed",
    "casual": "relaxed",
    "affordable": "affordable",
    "cheap": "affordable",
    "budget": "affordable",
    "inexpensive": "affordable",
    "music": "music-forward",
    "good music": "music-forward",
    "great music": "music-forward",
    "music-forward": "music-forward",
    "wine": "wine-led",
    "wine-led": "wine-led",
    "good wine": "wine-led",
    "date": "date-night",
    "date night": "date-night",
    "date spot": "date-night",
    "second date": "date-night",
    "first date": "date-night",
    "group": "group-friendly",
    "groups": "group-friendly",
    "group-friendly": "group-friendly",
    "friends": "group-friendly",
    "mates": "group-friendly",
    "late": "late-night",
    "late night": "late-night",
    "late-night": "late-night",
    "after midnight": "late-night",
    "all night": "late-night",
}

CUISINE_SYNONYMS: dict[str, str] = {
    "italian": "italian",
    "pasta": "italian",
    "pizza": "italian",
    "japanese": "japanese",
    "sushi": "japanese",
    "ramen": "japanese",
    "french": "french",
    "thai": "thai",
    "korean": "korean",
    "mexican": "mexican",
    "tacos": "mexican",
    "middle eastern": "middle-eastern",
    "turkish": "middle-eastern",
    "lebanese": "middle-eastern",
    "british": "british",
    "steak": "steakhouse",
    "steakhouse": "steakhouse",
    "modern european": "modern-european",
}

GENRE_SYNONYMS: dict[str, str] = {
    "house": "house",
    "house music": "house",
    "techno": "techno",
    "disco": "disco",
    "hip hop": "hip-hop",
    "hip-hop": "hip-hop",
    "hiphop": "hip-hop",
    "rap": "hip-hop",
    "afrobeats": "afrobeats",
    "afro": "afrobeats",
    "jazz": "jazz",
    "live music": "live-music",
    "live band": "live-music",
    "live bands": "live-music",
}

# ── Route intent detection ──────────────────────────────────────

ROUTE_PATTERNS = [
    r"(?:then|→|->|and then|followed by)",
    r"(?:dinner|food|eat).+(?:drinks|cocktails|bar).+(?:club|dancing)",
    r"(?:dinner|food|eat).+(?:drinks|cocktails|bar)",
    r"(?:drinks|cocktails|bar).+(?:club|dancing)",
]

# ── Budget detection ────────────────────────────────────────────

BUDGET_PATTERNS = [
    r"under\s*£?\s*(\d+)",
    r"below\s*£?\s*(\d+)",
    r"less\s+than\s*£?\s*(\d+)",
    r"max\s*£?\s*(\d+)",
    r"£(\d+)\s*(?:budget|max|total|limit)",
    r"budget\s*(?:of\s*)?£?\s*(\d+)",
    r"(\d+)\s*(?:pounds|quid|gbp)",
    r"£(\d+)\s*pp",  # per person
]

PP_PATTERNS = [
    r"£?\s*\d+\s*pp",
    r"£?\s*\d+\s*per\s+person",
    r"£?\s*\d+\s*each",
    r"£?\s*\d+\s*a\s+head",
]

# Party size
PARTY_PATTERNS = [
    r"(\d+)\s*(?:people|persons|of\s+us|mates|friends)",
    r"party\s+of\s+(\d+)",
    r"group\s+of\s+(\d+)",
    r"for\s+(\d+)",
]


@dataclass
class ParsedQuery:
    area: str | None = None
    budget_total: float | None = None
    budget_pp: float | None = None
    party_size: int | None = None
    desired_stops: list[str] = field(default_factory=list)
    vibes: list[str] = field(default_factory=list)
    venue_type: str | None = None
    cuisines: list[str] = field(default_factory=list)
    music_genres: list[str] = field(default_factory=list)
    good_for_date: bool = False
    good_for_group: bool = False
    late_night: bool = False
    is_route: bool = False
    notes: list[str] = field(default_factory=list)
    confidence: float = 0.5


def parse_query(raw: str) -> ParsedQuery:
    q = raw.lower().strip()
    result = ParsedQuery()
    matched_signals = 0

    # ── Area detection ──────────────────────────────────────
    # Check multi-word areas first (longest match wins)
    sorted_areas = sorted(AREA_SYNONYMS.keys(), key=len, reverse=True)
    for area_key in sorted_areas:
        if area_key in q:
            result.area = AREA_SYNONYMS[area_key]
            result.notes.append(f"Detected area: {result.area}")
            matched_signals += 1
            break

    # ── Route intent ────────────────────────────────────────
    for pattern in ROUTE_PATTERNS:
        if re.search(pattern, q):
            result.is_route = True
            result.notes.append("Detected route intent")
            matched_signals += 1
            break

    # ── Desired stops (ordered venue types from query) ──────
    if result.is_route:
        # Extract ordered sequence of venue types
        positions: list[tuple[int, str]] = []
        for word, vtype in VENUE_TYPE_SYNONYMS.items():
            idx = q.find(word)
            if idx >= 0:
                positions.append((idx, vtype))
        # Deduplicate by type, keeping first occurrence order
        seen: set[str] = set()
        for _, vtype in sorted(positions):
            if vtype not in seen:
                result.desired_stops.append(vtype)
                seen.add(vtype)
        if result.desired_stops:
            result.notes.append(f"Detected stops: {' → '.join(result.desired_stops)}")
    else:
        # Single venue type detection
        for word, vtype in sorted(VENUE_TYPE_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True):
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, q):
                result.venue_type = vtype
                matched_signals += 1
                break

    # ── Budget ──────────────────────────────────────────────
    is_pp = any(re.search(p, q) for p in PP_PATTERNS)
    for pattern in BUDGET_PATTERNS:
        m = re.search(pattern, q)
        if m:
            amount = float(m.group(1))
            if is_pp:
                result.budget_pp = amount
                result.notes.append(f"Detected per-person budget: £{amount}")
            else:
                result.budget_total = amount
                result.notes.append(f"Detected total budget: £{amount}")
            matched_signals += 1
            break

    # ── Party size ──────────────────────────────────────────
    for pattern in PARTY_PATTERNS:
        m = re.search(pattern, q)
        if m:
            result.party_size = int(m.group(1))
            result.notes.append(f"Detected party size: {result.party_size}")
            matched_signals += 1
            break

    # Convert per-person to total if we have both pp and party size
    if result.budget_pp and result.party_size:
        result.budget_total = result.budget_pp * result.party_size
        result.notes.append(f"Calculated total budget: £{result.budget_total}")

    # ── Vibes ───────────────────────────────────────────────
    detected_vibes: set[str] = set()
    for phrase, vibe_slug in sorted(VIBE_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True):
        if phrase in q:
            detected_vibes.add(vibe_slug)
    result.vibes = sorted(detected_vibes)
    if result.vibes:
        matched_signals += 1

    # ── Date / group / late flags ───────────────────────────
    date_words = ["date", "romantic", "date night", "date spot", "second date", "first date"]
    if any(w in q for w in date_words):
        result.good_for_date = True
        matched_signals += 1

    group_words = ["group", "friends", "mates", "party of", "people"]
    if any(w in q for w in group_words):
        result.good_for_group = True
        matched_signals += 1

    late_words = ["late", "late night", "after midnight", "all night", "late-night"]
    if any(w in q for w in late_words):
        result.late_night = True
        matched_signals += 1

    # ── Cuisines ────────────────────────────────────────────
    detected_cuisines: set[str] = set()
    for word, slug in sorted(CUISINE_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True):
        if word in q:
            detected_cuisines.add(slug)
    result.cuisines = sorted(detected_cuisines)

    # ── Music genres ────────────────────────────────────────
    detected_genres: set[str] = set()
    for word, slug in sorted(GENRE_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True):
        if word in q:
            detected_genres.add(slug)
    result.music_genres = sorted(detected_genres)

    # ── Confidence ──────────────────────────────────────────
    # More matched signals → higher confidence
    if matched_signals == 0:
        result.confidence = 0.3
    elif matched_signals == 1:
        result.confidence = 0.5
    elif matched_signals == 2:
        result.confidence = 0.65
    elif matched_signals == 3:
        result.confidence = 0.78
    elif matched_signals == 4:
        result.confidence = 0.86
    else:
        result.confidence = min(0.95, 0.86 + matched_signals * 0.02)

    return result
