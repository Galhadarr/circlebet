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
from app.models.trade import Trade, TradeDirection, TradeSide
from app.models.user import User
from app.schemas.market import MarketCreate, MarketDetailResponse, MarketResponse
from app.services import lmsr


def _market_response(
    market: Market,
    yes_volume: Decimal = Decimal("0"),
    no_volume: Decimal = Decimal("0"),
) -> MarketResponse:
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
        yes_volume=yes_volume,
        no_volume=no_volume,
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

    # Per-side volumes and unique bettor counts (BUY trades only)
    side_stats_result = await db.execute(
        select(
            Trade.side,
            func.coalesce(func.sum(Trade.amount), 0).label("volume"),
            func.count(func.distinct(Trade.user_id)).label("bettors"),
        )
        .where(Trade.market_id == market_id, Trade.direction == TradeDirection.BUY)
        .group_by(Trade.side)
    )
    side_stats = {row.side: row for row in side_stats_result.all()}
    yes_stats = side_stats.get(TradeSide.YES)
    no_stats = side_stats.get(TradeSide.NO)
    yes_volume = Decimal(str(yes_stats.volume)) if yes_stats else Decimal("0")
    no_volume = Decimal(str(no_stats.volume)) if no_stats else Decimal("0")
    yes_bettors = yes_stats.bettors if yes_stats else 0
    no_bettors = no_stats.bettors if no_stats else 0

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
        yes_volume=yes_volume,
        no_volume=no_volume,
        yes_bettors=yes_bettors,
        no_bettors=no_bettors,
    )


async def get_circle_markets(db: AsyncSession, circle_id: uuid.UUID) -> list[MarketResponse]:
    result = await db.execute(
        select(Market).where(Market.circle_id == circle_id).order_by(Market.created_at.desc())
    )
    markets = result.scalars().all()
    market_ids = [m.id for m in markets]

    # Batch query per-side volumes for all markets (BUY trades only)
    volume_map: dict[tuple, Decimal] = {}
    if market_ids:
        vol_result = await db.execute(
            select(
                Trade.market_id,
                Trade.side,
                func.coalesce(func.sum(Trade.amount), 0).label("volume"),
            )
            .where(Trade.market_id.in_(market_ids), Trade.direction == TradeDirection.BUY)
            .group_by(Trade.market_id, Trade.side)
        )
        for row in vol_result.all():
            volume_map[(row.market_id, row.side)] = Decimal(str(row.volume))

    return [
        _market_response(
            m,
            yes_volume=volume_map.get((m.id, TradeSide.YES), Decimal("0")),
            no_volume=volume_map.get((m.id, TradeSide.NO), Decimal("0")),
        )
        for m in markets
    ]


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
