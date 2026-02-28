import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.exceptions import AlreadyMember
from app.models.circle import Circle
from app.models.circle_member import CircleMember
from app.models.user import User
from app.schemas.circle import CircleCreate, CircleResponse


async def create_circle(db: AsyncSession, user: User, req: CircleCreate) -> CircleResponse:
    circle = Circle(
        name=req.name,
        description=req.description,
        invite_token=uuid.uuid4().hex,
        creator_id=user.id,
    )
    db.add(circle)
    await db.flush()

    member = CircleMember(
        user_id=user.id,
        circle_id=circle.id,
        balance=settings.INITIAL_BALANCE,
    )
    db.add(member)
    await db.commit()
    await db.refresh(circle)

    return CircleResponse(
        id=circle.id,
        name=circle.name,
        description=circle.description,
        invite_token=circle.invite_token,
        creator_id=circle.creator_id,
        member_count=1,
        created_at=circle.created_at,
    )


async def get_user_circles(db: AsyncSession, user: User) -> list[CircleResponse]:
    stmt = (
        select(Circle, func.count(CircleMember.user_id).label("member_count"))
        .join(CircleMember, Circle.id == CircleMember.circle_id)
        .where(
            Circle.id.in_(
                select(CircleMember.circle_id).where(CircleMember.user_id == user.id)
            )
        )
        .group_by(Circle.id)
    )
    result = await db.execute(stmt)
    return [
        CircleResponse(
            id=circle.id,
            name=circle.name,
            description=circle.description,
            invite_token=circle.invite_token,
            creator_id=circle.creator_id,
            member_count=count,
            created_at=circle.created_at,
        )
        for circle, count in result.all()
    ]


async def get_circle(db: AsyncSession, circle_id: uuid.UUID, user: User) -> CircleResponse:
    circle = await db.get(Circle, circle_id)
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circle not found")

    count_result = await db.execute(
        select(func.count()).where(CircleMember.circle_id == circle_id)
    )
    member_count = count_result.scalar_one()

    return CircleResponse(
        id=circle.id,
        name=circle.name,
        description=circle.description,
        invite_token=circle.invite_token,
        creator_id=circle.creator_id,
        member_count=member_count,
        created_at=circle.created_at,
    )


async def join_circle(db: AsyncSession, user: User, invite_token: str) -> CircleResponse:
    result = await db.execute(select(Circle).where(Circle.invite_token == invite_token))
    circle = result.scalar_one_or_none()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite link")

    existing = await db.get(CircleMember, (user.id, circle.id))
    if existing:
        raise AlreadyMember()

    member = CircleMember(
        user_id=user.id,
        circle_id=circle.id,
        balance=settings.INITIAL_BALANCE,
    )
    db.add(member)
    await db.commit()

    count_result = await db.execute(
        select(func.count()).where(CircleMember.circle_id == circle.id)
    )
    member_count = count_result.scalar_one()

    return CircleResponse(
        id=circle.id,
        name=circle.name,
        description=circle.description,
        invite_token=circle.invite_token,
        creator_id=circle.creator_id,
        member_count=member_count,
        created_at=circle.created_at,
    )


async def get_circle_members(db: AsyncSession, circle_id: uuid.UUID) -> list[CircleMember]:
    result = await db.execute(
        select(CircleMember)
        .options(selectinload(CircleMember.user))
        .where(CircleMember.circle_id == circle_id)
    )
    return list(result.scalars().all())
