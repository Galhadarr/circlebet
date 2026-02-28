import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.exceptions import (
    InsufficientBalance,
    InsufficientShares,
    MarketNotOpen,
    NotCircleMember,
    SellNotAllowed,
)
from app.models.circle_member import CircleMember
from app.models.holding import Holding
from app.models.market import Market, MarketStatus
from app.models.trade import Trade, TradeDirection, TradeSide
from app.models.user import User
from app.schemas.trade import TradePreviewResponse, TradeRequest, TradeResponse
from app.services import lmsr


async def execute_trade(
    db: AsyncSession, user: User, market_id: uuid.UUID, req: TradeRequest
) -> TradeResponse:
    # Lock market row
    result = await db.execute(
        select(Market).where(Market.id == market_id).with_for_update()
    )
    market = result.scalar_one_or_none()
    if not market:
        raise MarketNotOpen()

    if market.status != MarketStatus.OPEN:
        raise MarketNotOpen()

    # Verify membership
    member = await db.get(CircleMember, (user.id, market.circle_id))
    if not member:
        raise NotCircleMember()

    # Get or create holding
    holding = await db.get(Holding, (user.id, market_id))
    if not holding:
        holding = Holding(user_id=user.id, market_id=market_id)
        db.add(holding)
        await db.flush()

    price_before = lmsr.price_yes(market.q_yes, market.q_no, market.b)

    if req.direction == "BUY":
        if member.balance < req.amount:
            raise InsufficientBalance()

        shares = lmsr.shares_for_buy(market.q_yes, market.q_no, market.b, req.side, req.amount)

        # Update market state
        if req.side == "YES":
            market.q_yes += shares
            holding.yes_shares += shares
        else:
            market.q_no += shares
            holding.no_shares += shares

        member.balance -= req.amount
        trade_amount = req.amount
        trade_shares = shares

    else:  # SELL
        if not settings.ALLOW_SELL:
            raise SellNotAllowed()

        # For sell, amount = number of shares to sell
        shares_to_sell = req.amount

        if req.side == "YES" and holding.yes_shares < shares_to_sell:
            raise InsufficientShares()
        if req.side == "NO" and holding.no_shares < shares_to_sell:
            raise InsufficientShares()

        currency_received = lmsr.amount_for_sell(
            market.q_yes, market.q_no, market.b, req.side, shares_to_sell
        )

        if req.side == "YES":
            market.q_yes -= shares_to_sell
            holding.yes_shares -= shares_to_sell
        else:
            market.q_no -= shares_to_sell
            holding.no_shares -= shares_to_sell

        member.balance += currency_received
        trade_amount = currency_received
        trade_shares = shares_to_sell

    new_price_yes = lmsr.price_yes(market.q_yes, market.q_no, market.b)
    new_price_no = lmsr.price_no(market.q_yes, market.q_no, market.b)

    trade = Trade(
        user_id=user.id,
        market_id=market_id,
        side=TradeSide(req.side),
        direction=TradeDirection(req.direction),
        amount=trade_amount,
        shares=trade_shares,
        price_at_trade=price_before,
    )
    db.add(trade)
    await db.commit()
    await db.refresh(trade)
    await db.refresh(member)

    return TradeResponse(
        trade_id=trade.id,
        side=req.side,
        direction=req.direction,
        amount=trade_amount,
        shares=trade_shares,
        price_at_trade=price_before,
        new_price_yes=new_price_yes,
        new_price_no=new_price_no,
        new_balance=member.balance,
    )


async def preview_trade(
    db: AsyncSession, market_id: uuid.UUID, req: TradeRequest
) -> TradePreviewResponse:
    market = await db.get(Market, market_id)
    if not market:
        raise MarketNotOpen()

    current_price_yes = lmsr.price_yes(market.q_yes, market.q_no, market.b)

    if req.direction == "BUY":
        estimated_shares = lmsr.shares_for_buy(
            market.q_yes, market.q_no, market.b, req.side, req.amount
        )
        if req.side == "YES":
            new_q_yes = market.q_yes + estimated_shares
            new_q_no = market.q_no
        else:
            new_q_yes = market.q_yes
            new_q_no = market.q_no + estimated_shares
    else:
        estimated_shares = lmsr.amount_for_sell(
            market.q_yes, market.q_no, market.b, req.side, req.amount
        )
        if req.side == "YES":
            new_q_yes = market.q_yes - req.amount
            new_q_no = market.q_no
        else:
            new_q_yes = market.q_yes
            new_q_no = market.q_no - req.amount

    new_price_yes = lmsr.price_yes(new_q_yes, new_q_no, market.b)
    new_price_no = lmsr.price_no(new_q_yes, new_q_no, market.b)
    price_impact = abs(new_price_yes - current_price_yes)

    return TradePreviewResponse(
        estimated_shares=estimated_shares,
        estimated_price_after_yes=new_price_yes,
        estimated_price_after_no=new_price_no,
        price_impact=price_impact,
    )


async def get_trade_history(db: AsyncSession, market_id: uuid.UUID) -> list[Trade]:
    result = await db.execute(
        select(Trade)
        .options(selectinload(Trade.user))
        .where(Trade.market_id == market_id)
        .order_by(Trade.timestamp.desc())
    )
    return list(result.scalars().all())


async def get_user_trade_history(db: AsyncSession, user_id: uuid.UUID) -> list[Trade]:
    result = await db.execute(
        select(Trade)
        .options(selectinload(Trade.market))
        .where(Trade.user_id == user_id)
        .order_by(Trade.timestamp.desc())
    )
    return list(result.scalars().all())
