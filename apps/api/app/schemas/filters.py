from pydantic import BaseModel


class FilterOption(BaseModel):
    slug: str
    name: str


class FiltersResponse(BaseModel):
    neighborhoods: list[FilterOption]
    venue_types: list[FilterOption]
    vibe_tags: list[FilterOption]
    cuisines: list[FilterOption]
    music_genres: list[FilterOption]
    price_bands: list[int]
