import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Holding(Base):
    __tablename__ = "holdings"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    market_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("markets.id"), primary_key=True)
    yes_shares: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0"))
    no_shares: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0"))

    user: Mapped["User"] = relationship()
    market: Mapped["Market"] = relationship(back_populates="holdings")
