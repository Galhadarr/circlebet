import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Circle(Base):
    __tablename__ = "circles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    invite_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    creator: Mapped["User"] = relationship(back_populates="created_circles")
    members: Mapped[list["CircleMember"]] = relationship(back_populates="circle")
    markets: Mapped[list["Market"]] = relationship(back_populates="circle")
