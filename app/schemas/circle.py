import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CircleCreate(BaseModel):
    name: str = Field(min_length=3, max_length=20)
    description: str | None = None
    icon_url: str | None = None


class CircleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    icon_url: str | None = None
    invite_token: str
    creator_id: uuid.UUID
    member_count: int
    market_count: int = 0
    created_at: datetime


class CircleMemberResponse(BaseModel):
    user_id: uuid.UUID
    display_name: str
    balance: Decimal
    joined_at: datetime
