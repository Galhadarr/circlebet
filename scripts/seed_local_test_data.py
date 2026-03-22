"""
Insert dev-only test users, circle memberships, finished bets, and open bets (pending + active) into the local DB.

Usage (from repo root):
  uv run python scripts/seed_local_test_data.py
  # or: PYTHONPATH=. python3 scripts/seed_local_test_data.py

Optional:
  CIRCLE_ID=<uuid>   — target a specific circle (default: first circle in DB)
  FORCE=1            — remove prior DEV_SEED_* bets (reversing score deltas), then re-seed

Requires DATABASE_URL (see app/config.py default for local Postgres).
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid

from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.auth.password import hash_password
from app.database import async_session
from app.models.bet import Bet, BetStatus
from app.models.bet_entry import BetEntry
from app.models.bet_option import BetOption
from app.models.circle import Circle
from app.models.circle_member import CircleMember
from app.models.user import User


DEV_EMAILS = (
    "dev.fake.member1@local.test",
    "dev.fake.member2@local.test",
)
DEV_NAMES = ("DevFakeAlpha", "DevFakeBeta")
DEV_PASSWORD = "password"


def _apply_finish_scores(
    winning_option_id: uuid.UUID,
    entries: list[BetEntry],
    members: dict[uuid.UUID, CircleMember],
) -> None:
    """Mirror app.services.bet.end_bet score updates."""
    for e in entries:
        delta = 2 if e.is_double_down else 1
        cm = members.get(e.user_id)
        if not cm:
            continue
        if e.option_id == winning_option_id:
            cm.score += delta
        else:
            cm.score -= delta


def _reverse_finish_scores(
    winning_option_id: uuid.UUID,
    entries: list[BetEntry],
    members: dict[uuid.UUID, CircleMember],
) -> None:
    for e in entries:
        delta = 2 if e.is_double_down else 1
        cm = members.get(e.user_id)
        if not cm:
            continue
        if e.option_id == winning_option_id:
            cm.score -= delta
        else:
            cm.score += delta


async def _ensure_users_and_memberships(
    db, circle_id: uuid.UUID
) -> tuple[uuid.UUID, uuid.UUID]:
    member_ids: list[uuid.UUID] = []
    for email, name in zip(DEV_EMAILS, DEV_NAMES, strict=True):
        r = await db.execute(select(User).where(User.email == email))
        u = r.scalar_one_or_none()
        if u is None:
            u = User(
                email=email,
                display_name=name,
                password_hash=hash_password(DEV_PASSWORD),
            )
            db.add(u)
            await db.flush()
        member_ids.append(u.id)

        cm = await db.get(CircleMember, (u.id, circle_id))
        if cm is None:
            db.add(CircleMember(user_id=u.id, circle_id=circle_id, score=0))

    await db.flush()
    return member_ids[0], member_ids[1]


async def _load_member_rows(
    db, circle_id: uuid.UUID, user_ids: list[uuid.UUID]
) -> dict[uuid.UUID, CircleMember]:
    members: dict[uuid.UUID, CircleMember] = {}
    for uid in user_ids:
        cm = await db.get(CircleMember, (uid, circle_id))
        if cm is None:
            raise RuntimeError(f"Missing CircleMember for user {uid} in circle {circle_id}")
        members[uid] = cm
    return members


async def _remove_dev_seed_bets_and_reverse_scores(db) -> None:
    r = await db.execute(
        select(Bet)
        .where(Bet.title.startswith("DEV_SEED_"))
        .options(selectinload(Bet.entries), selectinload(Bet.options))
    )
    bets = r.scalars().unique().all()
    for bet in bets:
        if bet.status == BetStatus.FINISHED and bet.result_option_id is not None:
            win_id = bet.result_option_id
            entries = list(bet.entries)
            user_ids = {e.user_id for e in entries}
            members: dict[uuid.UUID, CircleMember] = {}
            for uid in user_ids:
                cm = await db.get(CircleMember, (uid, bet.circle_id))
                if cm is not None:
                    members[uid] = cm
            _reverse_finish_scores(win_id, entries, members)
        bid = bet.id
        bet.result_option_id = None
        await db.flush()
        await db.execute(delete(Bet).where(Bet.id == bid))
    await db.flush()


async def _create_finished_bet(
    db,
    *,
    circle_id: uuid.UUID,
    creator_id: uuid.UUID,
    title: str,
    description: str | None,
    option_labels: tuple[str, str],
    result_index: int,
    entries_spec: list[tuple[uuid.UUID, int, bool]],
    members: dict[uuid.UUID, CircleMember],
) -> None:
    """
    entries_spec: (user_id, option_index 0|1, is_double_down)
    """
    bet = Bet(
        circle_id=circle_id,
        creator_id=creator_id,
        title=title,
        description=description,
        status=BetStatus.FINISHED,
        is_time_limited=False,
        result_option_id=None,
    )
    db.add(bet)
    await db.flush()

    opt0 = BetOption(bet_id=bet.id, label=option_labels[0], position=0)
    opt1 = BetOption(bet_id=bet.id, label=option_labels[1], position=1)
    db.add_all((opt0, opt1))
    await db.flush()

    opts = (opt0, opt1)
    win_id = opts[result_index].id
    bet.result_option_id = win_id

    bet_entries: list[BetEntry] = []
    for user_id, opt_idx, doubled in entries_spec:
        bet_entries.append(
            BetEntry(
                bet_id=bet.id,
                user_id=user_id,
                option_id=opts[opt_idx].id,
                is_double_down=doubled,
            )
        )
    db.add_all(bet_entries)
    await db.flush()

    user_ids_in_bet = {e.user_id for e in bet_entries}
    for uid in user_ids_in_bet:
        if uid not in members:
            m = await db.get(CircleMember, (uid, circle_id))
            if m is None:
                raise RuntimeError(f"No CircleMember for user {uid} in circle")
            members[uid] = m

    _apply_finish_scores(win_id, bet_entries, members)


async def _create_open_bet(
    db,
    *,
    circle_id: uuid.UUID,
    creator_id: uuid.UUID,
    title: str,
    description: str | None,
    option_labels: tuple[str, str],
    status: BetStatus,
    entries_spec: list[tuple[uuid.UUID, int, bool]],
) -> None:
    """PENDING or ACTIVE bet (no result, no score changes)."""
    bet = Bet(
        circle_id=circle_id,
        creator_id=creator_id,
        title=title,
        description=description,
        status=status,
        is_time_limited=False,
        result_option_id=None,
    )
    db.add(bet)
    await db.flush()

    opt0 = BetOption(bet_id=bet.id, label=option_labels[0], position=0)
    opt1 = BetOption(bet_id=bet.id, label=option_labels[1], position=1)
    db.add_all((opt0, opt1))
    await db.flush()

    opts = (opt0, opt1)
    bet_entries: list[BetEntry] = []
    for user_id, opt_idx, doubled in entries_spec:
        bet_entries.append(
            BetEntry(
                bet_id=bet.id,
                user_id=user_id,
                option_id=opts[opt_idx].id,
                is_double_down=doubled,
            )
        )
    db.add_all(bet_entries)
    await db.flush()


async def main() -> None:
    force = os.environ.get("FORCE", "").strip() in ("1", "true", "yes")
    circle_id_env = os.environ.get("CIRCLE_ID", "").strip()

    async with async_session() as db:
        if circle_id_env:
            try:
                circle_uuid = uuid.UUID(circle_id_env)
            except ValueError:
                print("Invalid CIRCLE_ID", file=sys.stderr)
                sys.exit(1)
            circle = await db.get(Circle, circle_uuid)
        else:
            r = await db.execute(select(Circle).limit(1))
            circle = r.scalar_one_or_none()

        if circle is None:
            print("No circle found. Create a circle in the app first, or set CIRCLE_ID.")
            sys.exit(1)

        circle_id = circle.id
        creator_id = circle.creator_id

        if force:
            await _remove_dev_seed_bets_and_reverse_scores(db)

        r = await db.execute(select(Bet.id).where(Bet.title.startswith("DEV_SEED_")).limit(1))
        if r.scalar_one_or_none() is not None:
            print("DEV_SEED bets already exist. Set FORCE=1 to replace them.")
            sys.exit(0)

        m1_id, m2_id = await _ensure_users_and_memberships(db, circle_id)

        member_user_ids = [creator_id, m1_id, m2_id]
        members = await _load_member_rows(db, circle_id, member_user_ids)

        await _create_finished_bet(
            db,
            circle_id=circle_id,
            creator_id=creator_id,
            title="DEV_SEED_Weekend picks",
            description="Fake finished bet for local testing.",
            option_labels=("Home", "Away"),
            result_index=0,
            entries_spec=[
                (creator_id, 0, False),
                (m1_id, 1, False),
                (m2_id, 0, True),
            ],
            members=members,
        )

        await _create_finished_bet(
            db,
            circle_id=circle_id,
            creator_id=creator_id,
            title="DEV_SEED_Weather call",
            description="Another fake finished bet.",
            option_labels=("Rain", "Sun"),
            result_index=1,
            entries_spec=[
                (creator_id, 0, False),
                (m1_id, 1, False),
                (m2_id, 1, False),
            ],
            members=members,
        )

        # Creator-only entry → stays PENDING until someone else picks another option.
        await _create_open_bet(
            db,
            circle_id=circle_id,
            creator_id=creator_id,
            title="DEV_SEED_Waiting for entry",
            description="Pending: log in as a fake member and enter the other side.",
            option_labels=("Option A", "Option B"),
            status=BetStatus.PENDING,
            entries_spec=[
                (creator_id, 0, False),
            ],
        )

        # Created by DevFakeAlpha only — circle owner is not a participant; enter as yourself.
        await _create_open_bet(
            db,
            circle_id=circle_id,
            creator_id=m1_id,
            title="DEV_SEED_Not yours yet",
            description="Pending: only DevFakeAlpha has picked. Join from your account.",
            option_labels=("Left", "Right"),
            status=BetStatus.PENDING,
            entries_spec=[
                (m1_id, 0, False),
            ],
        )

        # Two distinct options represented → ACTIVE (you can still join as another member).
        await _create_open_bet(
            db,
            circle_id=circle_id,
            creator_id=creator_id,
            title="DEV_SEED_Live now",
            description="Active: open for more picks; creator vs DevFakeAlpha.",
            option_labels=("Yes", "No"),
            status=BetStatus.ACTIVE,
            entries_spec=[
                (creator_id, 0, False),
                (m1_id, 1, False),
            ],
        )

        await db.commit()

    print("Done.")
    print(f"  Circle: {circle_id}")
    print(f"  Users: {list(zip(DEV_EMAILS, DEV_NAMES, strict=True))}")
    print(f"  Password for both: {DEV_PASSWORD!r}")
    print(
        "  Bets: 2 finished (Weekend / Weather), "
        "2 pending (Waiting for entry / Not yours yet), 1 active (Live now)"
    )


if __name__ == "__main__":
    asyncio.run(main())
