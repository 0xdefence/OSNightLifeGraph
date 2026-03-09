from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Cuisine, MusicGenre, Neighborhood, VenueType, VibeTag
from app.schemas.filters import FilterOption, FiltersResponse

router = APIRouter()


@router.get("/filters", response_model=FiltersResponse)
def get_filters(db: Session = Depends(get_db)):
    neighborhoods = db.execute(select(Neighborhood).order_by(Neighborhood.name)).scalars().all()
    venue_types = db.execute(select(VenueType).order_by(VenueType.name)).scalars().all()
    vibe_tags = db.execute(select(VibeTag).order_by(VibeTag.name)).scalars().all()
    cuisines = db.execute(select(Cuisine).order_by(Cuisine.name)).scalars().all()
    music_genres = db.execute(select(MusicGenre).order_by(MusicGenre.name)).scalars().all()

    return FiltersResponse(
        neighborhoods=[FilterOption(slug=n.slug, name=n.name) for n in neighborhoods],
        venue_types=[FilterOption(slug=v.slug, name=v.name) for v in venue_types],
        vibe_tags=[FilterOption(slug=v.slug, name=v.name) for v in vibe_tags],
        cuisines=[FilterOption(slug=c.slug, name=c.name) for c in cuisines],
        music_genres=[FilterOption(slug=g.slug, name=g.name) for g in music_genres],
        price_bands=[1, 2, 3, 4, 5],
    )
