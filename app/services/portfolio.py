from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.holding import Holding
from app.models.market import Market
from app.models.user import User
from app.schemas.portfolio import HoldingResponse, PortfolioResponse
from app.services import lmsr


async def get_user_portfolio(db: AsyncSession, user: User) -> PortfolioResponse:
    result = await db.execute(
        select(Holding)
        .options(selectinload(Holding.market))
        .where(Holding.user_id == user.id)
    )
    holdings = result.scalars().all()

    items = []
    for h in holdings:
        if h.yes_shares == 0 and h.no_shares == 0:
            continue
        market = h.market
        p_yes = lmsr.price_yes(market.q_yes, market.q_no, market.b)
        p_no = lmsr.price_no(market.q_yes, market.q_no, market.b)
        current_value = h.yes_shares * p_yes + h.no_shares * p_no

        items.append(
            HoldingResponse(
                market_id=market.id,
                market_title=market.title,
                circle_id=market.circle_id,
                status=market.status.value,
                yes_shares=h.yes_shares,
                no_shares=h.no_shares,
                current_price_yes=p_yes,
                current_price_no=p_no,
                current_value=current_value,
            )
        )

    return PortfolioResponse(holdings=items)
