import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.trade import TradeHistoryEntry, TradePreviewResponse, TradeRequest, TradeResponse
from app.services.trade import execute_trade, get_trade_history, preview_trade

router = APIRouter(prefix="/markets", tags=["trades"])


@router.post("/{market_id}/trade", response_model=TradeResponse)
async def trade(
    market_id: uuid.UUID,
    req: TradeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await execute_trade(db, user, market_id, req)


@router.post("/{market_id}/trade-preview", response_model=TradePreviewResponse)
async def trade_preview(
    market_id: uuid.UUID,
    req: TradeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await preview_trade(db, market_id, req)


@router.get("/{market_id}/trades", response_model=list[TradeHistoryEntry])
async def trades(
    market_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trade_list = await get_trade_history(db, market_id)
    return [
        TradeHistoryEntry(
            id=t.id,
            user_id=t.user_id,
            display_name=t.user.display_name,
            side=t.side.value,
            direction=t.direction.value,
            amount=t.amount,
            shares=t.shares,
            price_at_trade=t.price_at_trade,
            timestamp=t.timestamp,
        )
        for t in trade_list
    ]
