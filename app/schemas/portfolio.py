import uuid
from decimal import Decimal

from pydantic import BaseModel


class HoldingResponse(BaseModel):
    market_id: uuid.UUID
    market_title: str
    circle_id: uuid.UUID
    status: str
    yes_shares: Decimal
    no_shares: Decimal
    current_price_yes: Decimal
    current_price_no: Decimal
    current_value: Decimal


class PortfolioResponse(BaseModel):
    holdings: list[HoldingResponse]
