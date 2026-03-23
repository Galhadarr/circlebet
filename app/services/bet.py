import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import (
    AlreadyEnteredBet,
    BetCannotEnd,
    BetClosedForEntry,
    BetNotEditable,
    BetNotFound,
    NotBetCreator,
    NotCircleMember,
)
from app.models.bet import Bet, BetStatus
from app.models.bet_entry import BetEntry
from app.models.bet_option import BetOption
from app.models.circle_member import CircleMember
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.schemas.bet import (
    BetCreate,
    BetDetailResponse,
    BetEndRequest,
    BetEntryCreate,
    BetEntryResponse,
    BetImageUpdate,
    BetOptionResponse,
    BetResponse,
    BetUpdate,
)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _entry_to_response(e: BetEntry) -> BetEntryResponse:
    return BetEntryResponse(
        id=e.id,
        user_id=e.user_id,
        option_id=e.option_id,
        is_double_down=e.is_double_down,
        entered_at=e.entered_at,
    )


async def _bet_to_response(
    db: AsyncSession, bet: Bet, current_user_id: uuid.UUID | None
) -> BetResponse:
    if not bet.options:
        await db.refresh(bet, ["options"])
    count_result = await db.execute(select(func.count()).select_from(BetEntry).where(BetEntry.bet_id == bet.id))
    entries_count = int(count_result.scalar_one())
    my_entry: BetEntryResponse | None = None
    if current_user_id:
        er = await db.execute(select(BetEntry).where(BetEntry.bet_id == bet.id, BetEntry.user_id == current_user_id))
        row = er.scalar_one_or_none()
        if row:
            my_entry = _entry_to_response(row)
    opts = sorted(bet.options, key=lambda x: x.position)
    return BetResponse(
        id=bet.id,
        circle_id=bet.circle_id,
        creator_id=bet.creator_id,
        title=bet.title,
        description=bet.description,
        image_url=bet.image_url,
        status=bet.status.value,
        is_time_limited=bet.is_time_limited,
        end_time=bet.end_time,
        options=[BetOptionResponse(id=o.id, label=o.label, position=o.position) for o in opts],
        result_option_id=bet.result_option_id,
        entries_count=entries_count,
        created_at=bet.created_at,
        my_entry=my_entry,
    )


async def _notify_bet_created(
    db: AsyncSession, circle_id: uuid.UUID, bet_id: uuid.UUID, title: str, creator_id: uuid.UUID
) -> None:
    result = await db.execute(
        select(CircleMember.user_id).where(
            CircleMember.circle_id == circle_id,
            CircleMember.user_id != creator_id,
        )
    )
    for (uid,) in result.all():
        db.add(
            Notification(
                user_id=uid,
                type=NotificationType.BET_CREATED,
                title="New bet in your circle",
                message=f'A new bet was created: "{title}"',
                bet_id=bet_id,
                circle_id=circle_id,
            )
        )


async def _notify_new_participant(
    db: AsyncSession,
    bet_id: uuid.UUID,
    circle_id: uuid.UUID,
    title: str,
    new_user_id: uuid.UUID,
    display_name: str,
) -> None:
    result = await db.execute(
        select(BetEntry.user_id).where(BetEntry.bet_id == bet_id, BetEntry.user_id != new_user_id)
    )
    for (uid,) in result.all():
        db.add(
            Notification(
                user_id=uid,
                type=NotificationType.NEW_PARTICIPANT,
                title="Someone joined your bet",
                message=f"{display_name} entered a bet in your circle: {title}",
                bet_id=bet_id,
                circle_id=circle_id,
            )
        )


async def _notify_bet_ended(
    db: AsyncSession, bet_id: uuid.UUID, circle_id: uuid.UUID, title: str, result_label: str
) -> None:
    result = await db.execute(select(BetEntry.user_id).where(BetEntry.bet_id == bet_id))
    user_ids = {row[0] for row in result.all()}
    for uid in user_ids:
        db.add(
            Notification(
                user_id=uid,
                type=NotificationType.BET_ENDED,
                title="Bet resolved",
                message=f'"{title}" ended. Result: {result_label}',
                bet_id=bet_id,
                circle_id=circle_id,
            )
        )


async def create_bet(db: AsyncSession, user: User, req: BetCreate) -> BetResponse:
    member = await db.get(CircleMember, (user.id, req.circle_id))
    if not member:
        raise NotCircleMember()

    end_time = _aware(req.end_time)
    if req.is_time_limited and end_time and end_time <= _now_utc():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be in the future")

    bet = Bet(
        circle_id=req.circle_id,
        creator_id=user.id,
        title=req.title.strip(),
        description=req.description,
        image_url=req.image_url,
        status=BetStatus.PENDING,
        is_time_limited=req.is_time_limited,
        end_time=end_time if req.is_time_limited else None,
    )
    db.add(bet)
    await db.flush()

    for i, label in enumerate(req.options):
        db.add(BetOption(bet_id=bet.id, label=label, position=i))
    await db.flush()

    await _notify_bet_created(db, req.circle_id, bet.id, bet.title, user.id)
    await db.commit()
    await db.refresh(bet)
    result = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet.id))
    bet = result.scalar_one()
    return await _bet_to_response(db, bet, user.id)


async def get_bet(db: AsyncSession, bet_id: uuid.UUID, user: User) -> BetDetailResponse:
    result = await db.execute(
        select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet_id)
    )
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()

    member = await db.get(CircleMember, (user.id, bet.circle_id))
    if not member:
        raise NotCircleMember()

    base = await _bet_to_response(db, bet, user.id)
    counts: dict[str, int] = {}
    if bet.status == BetStatus.FINISHED:
        for o in bet.options:
            cnt = await db.execute(
                select(func.count()).select_from(BetEntry).where(BetEntry.option_id == o.id)
            )
            counts[str(o.id)] = int(cnt.scalar_one())
    else:
        for o in bet.options:
            cnt = await db.execute(
                select(func.count()).select_from(BetEntry).where(BetEntry.option_id == o.id)
            )
            counts[str(o.id)] = int(cnt.scalar_one())

    return BetDetailResponse(
        **base.model_dump(),
        option_counts=counts,
    )


async def get_circle_bets(
    db: AsyncSession,
    user: User,
    circle_id: uuid.UUID,
    list_filter: str = "all",
    status_filter: str | None = None,
) -> list[BetResponse]:
    member = await db.get(CircleMember, (user.id, circle_id))
    if not member:
        raise NotCircleMember()

    if list_filter not in ("all", "entered", "created"):
        list_filter = "all"

    stmt = select(Bet).options(selectinload(Bet.options)).where(Bet.circle_id == circle_id)
    if list_filter == "entered":
        sub = select(BetEntry.bet_id).where(BetEntry.user_id == user.id)
        stmt = stmt.where(Bet.id.in_(sub))
    elif list_filter == "created":
        stmt = stmt.where(Bet.creator_id == user.id)

    if status_filter:
        sf = status_filter.upper()
        if sf in ("PENDING", "ACTIVE", "FINISHED"):
            stmt = stmt.where(Bet.status == BetStatus(sf))

    stmt = stmt.order_by(Bet.created_at.desc())
    result = await db.execute(stmt)
    bets = result.scalars().unique().all()
    return [await _bet_to_response(db, b, user.id) for b in bets]


async def enter_bet(db: AsyncSession, user: User, bet_id: uuid.UUID, req: BetEntryCreate) -> BetResponse:
    result = await db.execute(
        select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet_id)
    )
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()

    member = await db.get(CircleMember, (user.id, bet.circle_id))
    if not member:
        raise NotCircleMember()

    if bet.status == BetStatus.FINISHED:
        raise BetClosedForEntry()

    existing = await db.execute(select(BetEntry).where(BetEntry.bet_id == bet.id, BetEntry.user_id == user.id))
    if existing.scalar_one_or_none():
        raise AlreadyEnteredBet()

    if bet.is_time_limited and bet.end_time:
        et = _aware(bet.end_time)
        if et and _now_utc() >= et:
            raise BetClosedForEntry()

    option_ids = {o.id for o in bet.options}
    if req.option_id not in option_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid option for this bet")

    if bet.status == BetStatus.PENDING:
        db.add(
            BetEntry(
                bet_id=bet.id,
                user_id=user.id,
                option_id=req.option_id,
                is_double_down=req.is_double_down,
            )
        )
        await db.flush()
        # Activate only once at least 2 distinct options are represented
        distinct = await db.execute(
            select(func.count(BetEntry.option_id.distinct()))
            .where(BetEntry.bet_id == bet.id)
        )
        if int(distinct.scalar_one()) >= 2:
            bet.status = BetStatus.ACTIVE
    elif bet.status == BetStatus.ACTIVE:
        db.add(
            BetEntry(
                bet_id=bet.id,
                user_id=user.id,
                option_id=req.option_id,
                is_double_down=req.is_double_down,
            )
        )
    else:
        raise BetClosedForEntry()

    await _notify_new_participant(
        db, bet.id, bet.circle_id, bet.title, user.id, user.display_name
    )
    await db.commit()
    await db.refresh(bet)
    result = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet.id))
    bet = result.scalar_one()
    return await _bet_to_response(db, bet, user.id)


async def end_bet(db: AsyncSession, user: User, bet_id: uuid.UUID, req: BetEndRequest) -> BetResponse:
    result = await db.execute(
        select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet_id)
    )
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()
    if bet.creator_id != user.id:
        raise NotBetCreator()
    if bet.status != BetStatus.ACTIVE:
        raise BetCannotEnd()

    entry_count = await db.execute(select(func.count()).select_from(BetEntry).where(BetEntry.bet_id == bet.id))
    if int(entry_count.scalar_one()) < 2:
        raise BetCannotEnd()

    option_ids = {o.id for o in bet.options}
    if req.result_option_id is not None and req.result_option_id not in option_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid result option")

    bet.result_option_id = req.result_option_id
    bet.status = BetStatus.FINISHED

    if req.result_option_id is not None:
        entries_result = await db.execute(select(BetEntry).where(BetEntry.bet_id == bet.id))
        entries = entries_result.scalars().all()
        win_id = req.result_option_id

        for e in entries:
            delta = 2 if e.is_double_down else 1
            cm = await db.get(CircleMember, (e.user_id, bet.circle_id))
            if not cm:
                continue
            if e.option_id == win_id:
                cm.score += delta
            else:
                cm.score -= delta

        result_opt = next((o for o in bet.options if o.id == req.result_option_id), None)
        result_label = result_opt.label if result_opt else "Unknown"
    else:
        result_label = "No result — scores unchanged"

    await _notify_bet_ended(db, bet.id, bet.circle_id, bet.title, result_label)
    await db.commit()
    await db.refresh(bet)
    res = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet.id))
    bet = res.scalar_one()
    return await _bet_to_response(db, bet, user.id)


async def update_bet(db: AsyncSession, user: User, bet_id: uuid.UUID, req: BetUpdate) -> BetResponse:
    result = await db.execute(
        select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet_id)
    )
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()
    if bet.creator_id != user.id:
        raise NotBetCreator()
    if bet.status != BetStatus.PENDING:
        raise BetNotEditable()

    if req.title is not None:
        bet.title = req.title.strip()
    if req.description is not None:
        bet.description = req.description
    if req.image_url is not None:
        bet.image_url = req.image_url
    if req.is_time_limited is not None:
        bet.is_time_limited = req.is_time_limited
    if req.end_time is not None:
        bet.end_time = _aware(req.end_time)
    if bet.is_time_limited and bet.end_time and bet.end_time <= _now_utc():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be in the future")
    if not bet.is_time_limited:
        bet.end_time = None

    if req.options is not None:
        if len(req.options) < 2 or len(req.options) > 5:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Between 2 and 5 options required")
        idx = req.creator_option_index if req.creator_option_index is not None else 0
        if idx < 0 or idx >= len(req.options):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="creator_option_index out of range")
        for label in req.options:
            if not label or not str(label).strip():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Each option must be non-empty")

        await db.execute(delete(BetOption).where(BetOption.bet_id == bet.id))
        await db.flush()
        new_options: list[BetOption] = []
        for i, label in enumerate([x.strip() for x in req.options]):
            opt = BetOption(bet_id=bet.id, label=label, position=i)
            db.add(opt)
            new_options.append(opt)
        await db.flush()
        chosen_id = new_options[idx].id
        ent = await db.execute(
            select(BetEntry).where(BetEntry.bet_id == bet.id, BetEntry.user_id == user.id)
        )
        creator_entry = ent.scalar_one_or_none()
        if creator_entry:
            creator_entry.option_id = chosen_id
            if req.is_double_down is not None:
                creator_entry.is_double_down = req.is_double_down
    elif req.is_double_down is not None:
        ent = await db.execute(select(BetEntry).where(BetEntry.bet_id == bet.id, BetEntry.user_id == user.id))
        e = ent.scalar_one_or_none()
        if e:
            e.is_double_down = req.is_double_down

    await db.commit()
    await db.refresh(bet)
    result = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet.id))
    bet = result.scalar_one()
    return await _bet_to_response(db, bet, user.id)


async def update_bet_image(db: AsyncSession, user: User, bet_id: uuid.UUID, req: BetImageUpdate) -> BetResponse:
    result = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet_id))
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()
    if bet.creator_id != user.id:
        raise NotBetCreator()
    if bet.status == BetStatus.FINISHED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change image on a finished bet")
    bet.image_url = req.image_url
    await db.commit()
    await db.refresh(bet)
    result = await db.execute(select(Bet).options(selectinload(Bet.options)).where(Bet.id == bet.id))
    bet = result.scalar_one()
    return await _bet_to_response(db, bet, user.id)


async def delete_bet(db: AsyncSession, user: User, bet_id: uuid.UUID) -> None:
    result = await db.execute(select(Bet).where(Bet.id == bet_id))
    bet = result.scalar_one_or_none()
    if not bet:
        raise BetNotFound()
    if bet.creator_id != user.id:
        raise NotBetCreator()
    if bet.status != BetStatus.PENDING:
        raise BetNotEditable()
    await db.execute(delete(Bet).where(Bet.id == bet_id))
    await db.commit()
