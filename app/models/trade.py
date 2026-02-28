import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TradeSide(str, enum.Enum):
    YES = "YES"
    NO = "NO"


class TradeDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    market_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("markets.id"), nullable=False, index=True)
    side: Mapped[TradeSide] = mapped_column(nullable=False)
    direction: Mapped[TradeDirection] = mapped_column(nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    shares: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    price_at_trade: Mapped[Decimal] = mapped_column(Numeric(10, 8), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(server_default=func.now(), index=True)

    user: Mapped["User"] = relationship()
    market: Mapped["Market"] = relationship(back_populates="trades")
