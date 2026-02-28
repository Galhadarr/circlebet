import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TradeRequest(BaseModel):
    side: str = Field(pattern="^(YES|NO)$")
    direction: str = Field(default="BUY", pattern="^(BUY|SELL)$")
    amount: Decimal = Field(gt=0)


class TradeResponse(BaseModel):
    trade_id: uuid.UUID
    side: str
    direction: str
    amount: Decimal
    shares: Decimal
    price_at_trade: Decimal
    new_price_yes: Decimal
    new_price_no: Decimal
    new_balance: Decimal


class TradePreviewResponse(BaseModel):
    estimated_shares: Decimal
    estimated_price_after_yes: Decimal
    estimated_price_after_no: Decimal
    price_impact: Decimal


class TradeHistoryEntry(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    display_name: str
    side: str
    direction: str
    amount: Decimal
    shares: Decimal
    price_at_trade: Decimal
    timestamp: datetime


class UserTradeHistoryEntry(BaseModel):
    id: uuid.UUID
    market_id: uuid.UUID
    market_title: str
    side: str
    direction: str
    amount: Decimal
    shares: Decimal
    price_at_trade: Decimal
    timestamp: datetime
