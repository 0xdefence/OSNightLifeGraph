"""Seed the database with fixture data.

Usage:
    cd apps/api && uv run python -m scripts.seed
"""

import hashlib
import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models import (
    Cuisine,
    Event,
    Itinerary,
    ItineraryStop,
    MusicGenre,
    Neighborhood,
    OpeningHours,
    TransitNode,
    Venue,
    VenueSimilarity,
    VenueType,
    VibeTag,
    venue_cuisines,
    venue_music_genres,
    venue_transit_nodes,
    venue_vibe_tags,
)
from scripts.fixtures import (
    CUISINES,
    EVENTS,
    MUSIC_GENRES,
    NEIGHBORHOODS,
    STREETS,
    TRANSIT_NODES,
    VENUE_TYPES,
    VENUES,
    VIBE_TAGS,
)


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def deterministic_uuid(namespace: str, name: str) -> uuid.UUID:
    """Generate a deterministic UUID from a namespace + name so seeds are idempotent."""
    return uuid.uuid5(uuid.NAMESPACE_DNS, f"darkknight.{namespace}.{name}")


# Offset lat/lng slightly per venue for realistic pin spread
def offset_coords(base_lat: float, base_lng: float, index: int) -> tuple[float, float]:
    """Deterministic small offset so venues in the same area don't stack."""
    seed = hashlib.md5(str(index).encode()).hexdigest()
    dlat = (int(seed[:4], 16) / 65535 - 0.5) * 0.008  # ~±0.004 degrees ≈ 400m
    dlng = (int(seed[4:8], 16) / 65535 - 0.5) * 0.012
    return round(base_lat + dlat, 6), round(base_lng + dlng, 6)


HOUR_PATTERNS = {
    "restaurant": {
        "default": ("12:00", "23:00"),
        "weekend": ("12:00", "23:30"),
    },
    "bar": {
        "default": ("17:00", "00:00"),
        "weekend": ("14:00", "01:00"),
    },
    "bar_late": {
        "default": ("17:00", "02:00"),
        "weekend": ("14:00", "03:00"),
    },
    "club": {
        "default": ("22:00", "03:00"),
        "weekend": ("22:00", "05:00"),
    },
}


def get_hours_pattern(venue_type: str, late_night: bool) -> str:
    if venue_type == "club":
        return "club"
    if venue_type == "bar" and late_night:
        return "bar_late"
    return venue_type


def seed():
    db = SessionLocal()
    try:
        print("Clearing existing data...")
        # Clear in dependency order
        for table in [
            "itinerary_stops", "itineraries", "venue_similarity", "events",
            "opening_hours", "venue_transit_nodes", "venue_music_genres",
            "venue_cuisines", "venue_vibe_tags", "venues", "venue_types",
            "transit_nodes", "music_genres", "cuisines", "vibe_tags", "neighborhoods",
        ]:
            db.execute(text(f"DELETE FROM {table}"))
        db.commit()

        # ── Reference data ──────────────────────────────────────
        print("Seeding neighborhoods...")
        hood_map = {}
        for h in NEIGHBORHOODS:
            obj = Neighborhood(
                id=deterministic_uuid("neighborhood", h["slug"]),
                name=h["name"], slug=h["slug"],
                center_lat=h["lat"], center_lng=h["lng"],
                description=h["description"],
            )
            db.add(obj)
            hood_map[h["slug"]] = obj
        db.flush()

        print("Seeding venue types...")
        vtype_map = {}
        for vt in VENUE_TYPES:
            obj = VenueType(
                id=deterministic_uuid("venue_type", vt["slug"]),
                name=vt["name"], slug=vt["slug"],
            )
            db.add(obj)
            vtype_map[vt["slug"]] = obj
        db.flush()

        print("Seeding vibe tags...")
        vibe_map = {}
        for tag_name in VIBE_TAGS:
            slug = slugify(tag_name)
            obj = VibeTag(
                id=deterministic_uuid("vibe_tag", slug),
                name=tag_name, slug=slug,
            )
            db.add(obj)
            vibe_map[tag_name] = obj
        db.flush()

        print("Seeding cuisines...")
        cuisine_map = {}
        for c in CUISINES:
            slug = slugify(c)
            obj = Cuisine(
                id=deterministic_uuid("cuisine", slug),
                name=c, slug=slug,
            )
            db.add(obj)
            cuisine_map[c] = obj
        db.flush()

        print("Seeding music genres...")
        genre_map = {}
        for g in MUSIC_GENRES:
            slug = slugify(g)
            obj = MusicGenre(
                id=deterministic_uuid("music_genre", slug),
                name=g, slug=slug,
            )
            db.add(obj)
            genre_map[g] = obj
        db.flush()

        print("Seeding transit nodes...")
        transit_map = {}
        for tn in TRANSIT_NODES:
            slug = slugify(tn["name"])
            obj = TransitNode(
                id=deterministic_uuid("transit", slug),
                name=tn["name"], lat=tn["lat"], lng=tn["lng"],
                line_names=tn["lines"],
            )
            db.add(obj)
            transit_map[tn["name"]] = obj
        db.flush()

        # ── Venues ──────────────────────────────────────────────
        print("Seeding venues...")
        venue_map = {}  # name -> Venue
        streets_counter: dict[str, int] = {}

        for i, v in enumerate(VENUES):
            (name, vtype, hood, desc,
             price_band, avg_spend, rating, noise,
             bookable, date, group, late, midnight,
             dress, popularity,
             vibes, cuisines_list, genres_list) = v

            slug = slugify(name)
            hood_obj = hood_map[hood]
            lat, lng = offset_coords(hood_obj.center_lat, hood_obj.center_lng, i)

            # Generate address
            street_idx = streets_counter.get(hood, 0)
            street_list = STREETS[hood]
            street = street_list[street_idx % len(street_list)]
            house_num = 10 + (i * 7) % 190
            address = f"{house_num} {street}, London"
            streets_counter[hood] = street_idx + 1

            venue = Venue(
                id=deterministic_uuid("venue", slug),
                slug=slug, name=name, description=desc,
                venue_type_id=vtype_map[vtype].id,
                neighborhood_id=hood_obj.id,
                address=address, lat=lat, lng=lng,
                price_band=price_band, average_spend_gbp=avg_spend,
                average_rating=rating,
                booking_url=f"https://example.com/book/{slug}" if bookable else None,
                is_bookable=bookable,
                good_for_date=date, good_for_group=group,
                good_for_late_night=late, closes_after_midnight=midnight,
                noise_level=noise, dress_code=dress,
                popularity_score=popularity, source_type="seed",
            )
            db.add(venue)
            db.flush()

            # Vibe tags
            for vibe_name in vibes:
                db.execute(venue_vibe_tags.insert().values(
                    venue_id=venue.id, vibe_tag_id=vibe_map[vibe_name].id
                ))

            # Cuisines
            for c_name in cuisines_list:
                db.execute(venue_cuisines.insert().values(
                    venue_id=venue.id, cuisine_id=cuisine_map[c_name].id
                ))

            # Music genres
            for g_name in genres_list:
                db.execute(venue_music_genres.insert().values(
                    venue_id=venue.id, music_genre_id=genre_map[g_name].id
                ))

            venue_map[name] = venue

        db.flush()

        # ── Opening hours ───────────────────────────────────────
        print("Seeding opening hours...")
        for i, v in enumerate(VENUES):
            name, vtype, hood = v[0], v[1], v[2]
            late = v[11]
            venue = venue_map[name]
            pattern_key = get_hours_pattern(vtype, late)
            pattern = HOUR_PATTERNS[pattern_key]

            for day in range(7):  # 0=Mon to 6=Sun
                is_weekend = day in (4, 5)  # Fri, Sat
                opens, closes = pattern["weekend"] if is_weekend else pattern["default"]
                oh = OpeningHours(
                    id=deterministic_uuid("hours", f"{venue.slug}-{day}"),
                    venue_id=venue.id,
                    day_of_week=day,
                    opens_at=opens,
                    closes_at=closes,
                )
                db.add(oh)

        db.flush()

        # ── Transit node associations ───────────────────────────
        print("Associating venues with transit nodes...")
        # Map neighborhoods to their closest transit nodes
        hood_transit = {
            "soho": ["Tottenham Court Road", "Leicester Square", "Piccadilly Circus"],
            "shoreditch": ["Liverpool Street", "Old Street", "Shoreditch High Street"],
            "camden": ["Camden Town", "Chalk Farm"],
            "peckham": ["Peckham Rye"],
            "hackney": ["Hackney Central", "Hackney Downs"],
            "covent-garden": ["Covent Garden", "Holborn"],
            "notting-hill": ["Notting Hill Gate", "Ladbroke Grove"],
            "dalston": ["Dalston Junction", "Dalston Kingsland"],
            "london-bridge": ["London Bridge", "Borough"],
            "brixton": ["Brixton"],
        }
        for v in VENUES:
            venue = venue_map[v[0]]
            hood = v[2]
            for tn_name in hood_transit.get(hood, []):
                tn = transit_map[tn_name]
                db.execute(venue_transit_nodes.insert().values(
                    venue_id=venue.id, transit_node_id=tn.id
                ))
        db.flush()

        # ── Events ──────────────────────────────────────────────
        print("Seeding events...")
        for ev in EVENTS:
            venue_name, event_name, start_str, end_str, genre, cover = ev
            venue = venue_map[venue_name]
            event = Event(
                id=deterministic_uuid("event", f"{slugify(venue_name)}-{slugify(event_name)}"),
                venue_id=venue.id,
                name=event_name,
                start_at=datetime.fromisoformat(start_str).replace(tzinfo=timezone.utc),
                end_at=datetime.fromisoformat(end_str).replace(tzinfo=timezone.utc),
                genre=genre,
                estimated_cover_gbp=cover if cover > 0 else None,
            )
            db.add(event)
        db.flush()

        # ── Venue similarities ──────────────────────────────────
        print("Seeding venue similarities...")
        similarity_pairs = [
            # Cocktail bars
            ("Bar Termini", "Swift Soho", 0.88, "Both intimate Soho cocktail bars"),
            ("Happiness Forgets", "Coupette", 0.85, "Both acclaimed craft cocktail bars"),
            ("Callooh Callay", "Nightjar", 0.82, "Both Shoreditch speakeasy-style bars"),
            ("Three Sheets", "Happiness Forgets", 0.84, "Both stripped-back cocktail bars"),
            ("Disrepute", "Bermondsey Arts Club", 0.80, "Both late-night stylish cocktail spots"),
            # Wine bars
            ("Noble Rot Soho", "Forza Wine", 0.83, "Both wine-led with food"),
            ("Original Sin", "The Blue Posts", 0.81, "Both intimate wine bars"),
            ("Cora Pearl", "Noble Rot Soho", 0.80, "Both wine-focused Modern European"),
            # Fine dining
            ("The Ledbury", "Core by Clare Smyth", 0.92, "Both Michelin-starred Notting Hill fine dining"),
            ("Bright", "Pidgin", 0.85, "Both Hackney neighbourhood fine dining"),
            ("Spring Restaurant", "Cora Pearl", 0.83, "Both elegant Covent Garden dining"),
            # Late-night clubs
            ("XOYO", "Oslo", 0.87, "Both serious electronic music clubs"),
            ("Corsica Studios", "EGG London", 0.88, "Both multi-room techno institutions"),
            ("Ministry of Sound", "Phonox", 0.82, "Both major London house/techno clubs"),
            ("Oval Space", "Village Underground", 0.84, "Both Hackney warehouse venues"),
            ("Club 414", "Corsica Studios", 0.80, "Both underground techno-focused clubs"),
            # Affordable eats
            ("Padella", "Franco Manca", 0.83, "Both affordable Italian crowd-pleasers"),
            ("Koya Bar", "Mr Bao", 0.80, "Both cheap East Asian comfort food"),
            ("Flat Iron", "Franco Manca", 0.82, "Both affordable no-booking queue spots"),
            # Group-friendly
            ("Peckham Levels", "Pop Brixton", 0.85, "Both community food and drink spaces"),
            ("Queen of Hoxton", "Lost in Brixton", 0.80, "Both rooftop bars with DJ sets"),
            # Live music
            ("Blues Kitchen Camden", "Hootananny", 0.82, "Both live music bars with dancing"),
            ("The Jazz Cafe", "Nightjar", 0.80, "Both venues with live jazz"),
            ("Koko", "Electric Brixton", 0.83, "Both large-format live music and club venues"),
            # Date night
            ("The Palomar", "Gunpowder", 0.81, "Both intimate sharing-plate restaurants"),
            ("Brat", "Hawksmoor Borough", 0.80, "Both premium British-led date restaurants"),
            ("Frenchie", "Petit Pois", 0.84, "Both French-influenced date-night restaurants"),
            # Dalston / Hackney vibes
            ("Dalston Superstore", "The Alibi", 0.80, "Both late-night Dalston bars/clubs"),
            ("Brilliant Corners", "NT's Loft", 0.82, "Both music-focused East London bars"),
            ("Satan's Whiskers", "Dalston Superstore", 0.78, "Both late-night East London with chaotic energy"),
        ]

        for v1_name, v2_name, score, reason in similarity_pairs:
            v1 = venue_map[v1_name]
            v2 = venue_map[v2_name]
            db.execute(
                VenueSimilarity.__table__.insert().values(
                    venue_id=v1.id, similar_venue_id=v2.id,
                    similarity_score=score, reason=reason,
                )
            )
            # Bidirectional
            db.execute(
                VenueSimilarity.__table__.insert().values(
                    venue_id=v2.id, similar_venue_id=v1.id,
                    similarity_score=score, reason=reason,
                )
            )
        db.flush()

        db.commit()
        print(f"\nSeed complete:")
        print(f"  {len(NEIGHBORHOODS)} neighborhoods")
        print(f"  {len(VENUE_TYPES)} venue types")
        print(f"  {len(VIBE_TAGS)} vibe tags")
        print(f"  {len(CUISINES)} cuisines")
        print(f"  {len(MUSIC_GENRES)} music genres")
        print(f"  {len(TRANSIT_NODES)} transit nodes")
        print(f"  {len(VENUES)} venues")
        print(f"  {len(VENUES) * 7} opening hour entries")
        print(f"  {len(EVENTS)} events")
        print(f"  {len(similarity_pairs) * 2} similarity links")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
