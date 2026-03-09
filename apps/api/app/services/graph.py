"""Venue-centric graph builder.

Builds a node/edge graph for a single venue showing its relationships:
- venue → neighborhood
- venue → vibe tags
- venue → cuisines
- venue → music genres
- venue → events
- venue → similar venues
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Venue, VenueSimilarity
from app.schemas.graph import GraphEdge, GraphNode, VenueGraphResponse


def build_venue_graph(db: Session, venue_id: str) -> VenueGraphResponse | None:
    # Try slug first, then UUID
    venue = (
        db.execute(
            select(Venue)
            .options(
                joinedload(Venue.venue_type),
                joinedload(Venue.neighborhood),
                joinedload(Venue.vibe_tags),
                joinedload(Venue.cuisines),
                joinedload(Venue.music_genres),
                joinedload(Venue.events),
            )
            .where(Venue.slug == venue_id)
        )
        .unique()
        .scalar_one_or_none()
    )

    if venue is None:
        try:
            import uuid as _uuid
            parsed = _uuid.UUID(venue_id)
            venue = (
                db.execute(
                    select(Venue)
                    .options(
                        joinedload(Venue.venue_type),
                        joinedload(Venue.neighborhood),
                        joinedload(Venue.vibe_tags),
                        joinedload(Venue.cuisines),
                        joinedload(Venue.music_genres),
                        joinedload(Venue.events),
                    )
                    .where(Venue.id == parsed)
                )
                .unique()
                .scalar_one_or_none()
            )
        except ValueError:
            pass

    if venue is None:
        return None

    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    vid = f"v:{venue.id}"

    # Central venue node
    nodes.append(GraphNode(id=vid, label=venue.name, type="venue"))

    # Neighborhood
    nid = f"n:{venue.neighborhood_id}"
    nodes.append(GraphNode(id=nid, label=venue.neighborhood.name, type="neighborhood"))
    edges.append(GraphEdge(source=vid, target=nid, type="LOCATED_IN"))

    # Vibe tags
    for tag in venue.vibe_tags:
        tid = f"vt:{tag.id}"
        nodes.append(GraphNode(id=tid, label=tag.name, type="vibe_tag"))
        edges.append(GraphEdge(source=vid, target=tid, type="HAS_VIBE"))

    # Cuisines
    for cuisine in venue.cuisines:
        cid = f"c:{cuisine.id}"
        nodes.append(GraphNode(id=cid, label=cuisine.name, type="cuisine"))
        edges.append(GraphEdge(source=vid, target=cid, type="HAS_CUISINE"))

    # Music genres
    for genre in venue.music_genres:
        gid = f"g:{genre.id}"
        nodes.append(GraphNode(id=gid, label=genre.name, type="music_genre"))
        edges.append(GraphEdge(source=vid, target=gid, type="HAS_GENRE"))

    # Upcoming events
    now = datetime.now(timezone.utc)
    for event in venue.events:
        if event.end_at > now:
            eid = f"e:{event.id}"
            nodes.append(GraphNode(id=eid, label=event.name, type="event"))
            edges.append(GraphEdge(source=vid, target=eid, type="HAS_EVENT"))

    # Similar venues
    sim_rows = db.execute(
        select(VenueSimilarity, Venue)
        .join(Venue, VenueSimilarity.similar_venue_id == Venue.id)
        .where(VenueSimilarity.venue_id == venue.id)
        .order_by(VenueSimilarity.similarity_score.desc())
        .limit(5)
    ).all()

    for sim, sim_venue in sim_rows:
        svid = f"v:{sim_venue.id}"
        nodes.append(GraphNode(id=svid, label=sim_venue.name, type="similar_venue"))
        edges.append(GraphEdge(source=vid, target=svid, type="SIMILAR_TO"))

    return VenueGraphResponse(nodes=nodes, edges=edges)
