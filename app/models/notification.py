import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class NotificationType(str, enum.Enum):
    BET_CREATED = "BET_CREATED"
    BET_ENDED = "BET_ENDED"
    NEW_PARTICIPANT = "NEW_PARTICIPANT"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, values_callable=lambda x: [e.value for e in x], native_enum=False, length=32),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    bet_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("bets.id", ondelete="SET NULL"), nullable=True)
    circle_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("circles.id", ondelete="SET NULL"), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="notifications")
