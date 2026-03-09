import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    query_text: Mapped[str | None] = mapped_column(Text)
    area_name: Mapped[str | None] = mapped_column(String(100))
    budget_total: Mapped[float | None] = mapped_column(Float)
    party_size: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_estimated_spend: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    stops: Mapped[list["ItineraryStop"]] = relationship(
        back_populates="itinerary", order_by="ItineraryStop.stop_order"
    )


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    itinerary_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False
    )
    stop_order: Mapped[int] = mapped_column(Integer, nullable=False)
    venue_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("venues.id"), nullable=False)
    estimated_arrival_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    estimated_departure_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    estimated_spend_gbp: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    explanation: Mapped[str | None] = mapped_column(Text)

    itinerary: Mapped["Itinerary"] = relationship(back_populates="stops")
    venue: Mapped["Venue"] = relationship()  # noqa: F821
