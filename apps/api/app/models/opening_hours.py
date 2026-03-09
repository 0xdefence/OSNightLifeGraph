import uuid

from sqlalchemy import ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OpeningHours(Base):
    __tablename__ = "opening_hours"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    venue_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Mon, 6=Sun
    opens_at: Mapped[str] = mapped_column(String(5), nullable=False)  # "18:00"
    closes_at: Mapped[str] = mapped_column(String(5), nullable=False)  # "02:00"

    venue: Mapped["Venue"] = relationship(back_populates="opening_hours")  # noqa: F821
