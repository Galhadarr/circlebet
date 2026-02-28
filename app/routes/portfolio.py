from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.portfolio import PortfolioResponse
from app.schemas.trade import UserTradeHistoryEntry
from app.services.portfolio import get_user_portfolio
from app.services.trade import get_user_trade_history

router = APIRouter(tags=["portfolio"])


@router.get("/portfolio", response_model=PortfolioResponse)
async def portfolio(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_portfolio(db, user)


@router.get("/portfolio/trades", response_model=list[UserTradeHistoryEntry])
async def portfolio_trades(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trades = await get_user_trade_history(db, user.id)
    return [
        UserTradeHistoryEntry(
            id=t.id,
            market_id=t.market_id,
            market_title=t.market.title,
            side=t.side.value,
            direction=t.direction.value,
            amount=t.amount,
            shares=t.shares,
            price_at_trade=t.price_at_trade,
            timestamp=t.timestamp,
        )
        for t in trades
    ]
