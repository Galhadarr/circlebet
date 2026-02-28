import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import MarketNotClosed, NotCircleAdmin, NotCircleMember
from app.models.circle import Circle
from app.models.circle_member import CircleMember
from app.models.holding import Holding
from app.models.market import Market, MarketOutcome, MarketStatus
from app.models.trade import Trade
from app.models.user import User
from app.schemas.market import MarketCreate, MarketDetailResponse, MarketResponse
from app.services import lmsr


def _market_response(market: Market) -> MarketResponse:
    return MarketResponse(
        id=market.id,
        circle_id=market.circle_id,
        title=market.title,
        description=market.description,
        end_date=market.end_date,
        price_yes=lmsr.price_yes(market.q_yes, market.q_no, market.b),
        price_no=lmsr.price_no(market.q_yes, market.q_no, market.b),
        status=market.status.value,
        outcome=market.outcome.value if market.outcome else None,
        creator_id=market.creator_id,
        created_at=market.created_at,
    )


async def create_market(db: AsyncSession, user: User, req: MarketCreate) -> MarketResponse:
    # Verify membership
    member = await db.get(CircleMember, (user.id, req.circle_id))
    if not member:
        raise NotCircleMember()

    # Ensure we compare timezone-aware datetimes
    end_date = req.end_date if req.end_date.tzinfo else req.end_date.replace(tzinfo=timezone.utc)
    if end_date <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be in the future")

    market = Market(
        circle_id=req.circle_id,
        title=req.title,
        description=req.description,
        end_date=req.end_date,
        q_yes=Decimal("0"),
        q_no=Decimal("0"),
        b=settings.DEFAULT_LIQUIDITY_B,
        creator_id=user.id,
    )
    db.add(market)
    await db.commit()
    await db.refresh(market)
    return _market_response(market)


async def get_market(db: AsyncSession, market_id: uuid.UUID) -> MarketDetailResponse:
    market = await db.get(Market, market_id)
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")

    volume_result = await db.execute(
        select(func.coalesce(func.sum(Trade.amount), 0)).where(Trade.market_id == market_id)
    )
    total_volume = volume_result.scalar_one()

    return MarketDetailResponse(
        id=market.id,
        circle_id=market.circle_id,
        title=market.title,
        description=market.description,
        end_date=market.end_date,
        price_yes=lmsr.price_yes(market.q_yes, market.q_no, market.b),
        price_no=lmsr.price_no(market.q_yes, market.q_no, market.b),
        status=market.status.value,
        outcome=market.outcome.value if market.outcome else None,
        creator_id=market.creator_id,
        created_at=market.created_at,
        total_volume=Decimal(str(total_volume)),
        q_yes=market.q_yes,
        q_no=market.q_no,
        b=market.b,
    )


async def get_circle_markets(db: AsyncSession, circle_id: uuid.UUID) -> list[MarketResponse]:
    result = await db.execute(
        select(Market).where(Market.circle_id == circle_id).order_by(Market.created_at.desc())
    )
    return [_market_response(m) for m in result.scalars().all()]


async def resolve_market(
    db: AsyncSession, user: User, market_id: uuid.UUID, outcome: str
) -> MarketResponse:
    market = await db.get(Market, market_id)
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")

    # Check admin
    circle = await db.get(Circle, market.circle_id)
    if circle.creator_id != user.id:
        raise NotCircleAdmin()

    if market.status != MarketStatus.CLOSED:
        raise MarketNotClosed()

    market.outcome = MarketOutcome(outcome)
    market.status = MarketStatus.RESOLVED

    # Pay out winners
    result = await db.execute(
        select(Holding).where(Holding.market_id == market_id)
    )
    holdings = result.scalars().all()

    for holding in holdings:
        if outcome == "YES":
            payout = holding.yes_shares
        else:
            payout = holding.no_shares

        if payout > 0:
            member = await db.get(CircleMember, (holding.user_id, market.circle_id))
            if member:
                member.balance += payout

        holding.yes_shares = Decimal("0")
        holding.no_shares = Decimal("0")

    await db.commit()
    await db.refresh(market)
    return _market_response(market)


async def close_expired_markets(db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        update(Market)
        .where(Market.status == MarketStatus.OPEN, Market.end_date < now)
        .values(status=MarketStatus.CLOSED)
    )
    await db.commit()
    return result.rowcount
