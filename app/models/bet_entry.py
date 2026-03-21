import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BetEntry(Base):
    __tablename__ = "bet_entries"
    __table_args__ = (UniqueConstraint("bet_id", "user_id", name="uq_bet_entries_bet_user"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    bet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    option_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bet_options.id"), nullable=False)
    is_double_down: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    entered_at: Mapped[datetime] = mapped_column(server_default=func.now())

    bet: Mapped["Bet"] = relationship(back_populates="entries")
    user: Mapped["User"] = relationship()
    option: Mapped["BetOption"] = relationship(back_populates="entries")
