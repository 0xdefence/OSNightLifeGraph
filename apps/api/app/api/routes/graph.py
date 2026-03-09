from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.graph import VenueGraphResponse
from app.services.graph import build_venue_graph

router = APIRouter()


@router.get("/graph/venue/{venue_id}", response_model=VenueGraphResponse)
def get_venue_graph(venue_id: str, db: Session = Depends(get_db)):
    graph = build_venue_graph(db, venue_id)
    if graph is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    return graph
