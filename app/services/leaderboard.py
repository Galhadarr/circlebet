import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.circle_member import CircleMember
from app.schemas.leaderboard import LeaderboardEntry


async def get_circle_leaderboard(
    db: AsyncSession, circle_id: uuid.UUID
) -> list[LeaderboardEntry]:
    result = await db.execute(
        select(CircleMember)
        .options(selectinload(CircleMember.user))
        .where(CircleMember.circle_id == circle_id)
        .order_by(CircleMember.balance.desc())
    )
    members = result.scalars().all()

    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=m.user_id,
            display_name=m.user.display_name,
            balance=m.balance,
        )
        for i, m in enumerate(members)
    ]
