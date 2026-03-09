from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # venue, neighborhood, vibe_tag, cuisine, music_genre, event, similar_venue


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # LOCATED_IN, HAS_VIBE, HAS_CUISINE, HAS_GENRE, HAS_EVENT, SIMILAR_TO


class VenueGraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
