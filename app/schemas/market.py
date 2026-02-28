import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class MarketCreate(BaseModel):
    circle_id: uuid.UUID
    title: str
    description: str | None = None
    end_date: datetime


class MarketResponse(BaseModel):
    id: uuid.UUID
    circle_id: uuid.UUID
    title: str
    description: str | None
    end_date: datetime
    price_yes: Decimal
    price_no: Decimal
    status: str
    outcome: str | None
    creator_id: uuid.UUID
    created_at: datetime
    yes_volume: Decimal = Decimal("0")
    no_volume: Decimal = Decimal("0")


class MarketDetailResponse(MarketResponse):
    total_volume: Decimal
    q_yes: Decimal
    q_no: Decimal
    b: Decimal
    yes_bettors: int = 0
    no_bettors: int = 0


class ResolveRequest(BaseModel):
    outcome: str = Field(pattern="^(YES|NO)$")
