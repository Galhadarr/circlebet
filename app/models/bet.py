import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BetStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    FINISHED = "FINISHED"


class Bet(Base):
    __tablename__ = "bets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    circle_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("circles.id"), nullable=False, index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    status: Mapped[BetStatus] = mapped_column(
        SAEnum(BetStatus, values_callable=lambda x: [e.value for e in x], native_enum=False, length=20),
        default=BetStatus.PENDING,
        nullable=False,
        index=True,
    )
    is_time_limited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    result_option_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("bet_options.id", use_alter=True, name="fk_bets_result_option_id"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    circle: Mapped["Circle"] = relationship(back_populates="bets")
    creator: Mapped["User"] = relationship(foreign_keys=[creator_id])
    options: Mapped[list["BetOption"]] = relationship(
        back_populates="bet",
        cascade="all, delete-orphan",
        order_by="BetOption.position",
        foreign_keys="BetOption.bet_id",
    )
    entries: Mapped[list["BetEntry"]] = relationship(
        back_populates="bet",
        cascade="all, delete-orphan",
    )
    result_option: Mapped["BetOption | None"] = relationship(
        foreign_keys=[result_option_id],
        post_update=True,
    )
