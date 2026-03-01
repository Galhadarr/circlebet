import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MarketStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    RESOLVED = "RESOLVED"


class MarketOutcome(str, enum.Enum):
    YES = "YES"
    NO = "NO"


class Market(Base):
    __tablename__ = "markets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    circle_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("circles.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    q_yes: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0"))
    q_no: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0"))
    b: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("1000"))
    status: Mapped[MarketStatus] = mapped_column(
        SAEnum(MarketStatus, values_callable=lambda x: [e.value for e in x], native_enum=False),
        default=MarketStatus.OPEN,
        index=True,
    )
    outcome: Mapped[MarketOutcome | None] = mapped_column(
        SAEnum(MarketOutcome, values_callable=lambda x: [e.value for e in x], native_enum=False),
        nullable=True,
    )
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    circle: Mapped["Circle"] = relationship(back_populates="markets")
    creator: Mapped["User"] = relationship()
    holdings: Mapped[list["Holding"]] = relationship(back_populates="market")
    trades: Mapped[list["Trade"]] = relationship(back_populates="market")
