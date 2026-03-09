import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# --- Join tables ---

venue_vibe_tags = Table(
    "venue_vibe_tags",
    Base.metadata,
    Column("venue_id", ForeignKey("venues.id", ondelete="CASCADE"), primary_key=True),
    Column("vibe_tag_id", ForeignKey("vibe_tags.id", ondelete="CASCADE"), primary_key=True),
)

venue_cuisines = Table(
    "venue_cuisines",
    Base.metadata,
    Column("venue_id", ForeignKey("venues.id", ondelete="CASCADE"), primary_key=True),
    Column("cuisine_id", ForeignKey("cuisines.id", ondelete="CASCADE"), primary_key=True),
)

venue_music_genres = Table(
    "venue_music_genres",
    Base.metadata,
    Column("venue_id", ForeignKey("venues.id", ondelete="CASCADE"), primary_key=True),
    Column("music_genre_id", ForeignKey("music_genres.id", ondelete="CASCADE"), primary_key=True),
)

venue_transit_nodes = Table(
    "venue_transit_nodes",
    Base.metadata,
    Column("venue_id", ForeignKey("venues.id", ondelete="CASCADE"), primary_key=True),
    Column("transit_node_id", ForeignKey("transit_nodes.id", ondelete="CASCADE"), primary_key=True),
)


# --- VenueType ---

class VenueType(Base):
    __tablename__ = "venue_types"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)

    venues: Mapped[list["Venue"]] = relationship(back_populates="venue_type")


# --- Venue ---

class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    venue_type_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("venue_types.id"), nullable=False)
    neighborhood_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("neighborhoods.id"), nullable=False)

    address: Mapped[str | None] = mapped_column(String(300))
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)

    price_band: Mapped[int] = mapped_column(Integer, nullable=False)
    average_spend_gbp: Mapped[float] = mapped_column(Float, nullable=False)
    average_rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    booking_url: Mapped[str | None] = mapped_column(String(500))
    is_bookable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    good_for_date: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    good_for_group: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    good_for_late_night: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    closes_after_midnight: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    noise_level: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    dress_code: Mapped[str | None] = mapped_column(String(100))
    popularity_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    source_type: Mapped[str] = mapped_column(String(30), nullable=False, default="seed")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    venue_type: Mapped["VenueType"] = relationship(back_populates="venues")
    neighborhood: Mapped["Neighborhood"] = relationship(back_populates="venues")  # noqa: F821
    opening_hours: Mapped[list["OpeningHours"]] = relationship(back_populates="venue")  # noqa: F821
    events: Mapped[list["Event"]] = relationship(back_populates="venue")  # noqa: F821

    vibe_tags: Mapped[list["VibeTag"]] = relationship(secondary=venue_vibe_tags)  # noqa: F821
    cuisines: Mapped[list["Cuisine"]] = relationship(secondary=venue_cuisines)  # noqa: F821
    music_genres: Mapped[list["MusicGenre"]] = relationship(secondary=venue_music_genres)  # noqa: F821
    transit_nodes: Mapped[list["TransitNode"]] = relationship(secondary=venue_transit_nodes)  # noqa: F821
