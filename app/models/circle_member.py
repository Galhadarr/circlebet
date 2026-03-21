import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CircleMember(Base):
    __tablename__ = "circle_members"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    circle_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("circles.id"), primary_key=True)
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="memberships")
    circle: Mapped["Circle"] = relationship(back_populates="members")
