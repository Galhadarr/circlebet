import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.schemas.notification import NotificationResponse


async def get_user_notifications(
    db: AsyncSession, user: User, limit: int = 50, offset: int = 0
) -> list[NotificationResponse]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    rows = result.scalars().all()
    return [_to_response(n) for n in rows]


async def get_unread_count(db: AsyncSession, user: User) -> int:
    result = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == user.id, Notification.is_read.is_(False)
        )
    )
    return int(result.scalar_one())


async def mark_notification_read(db: AsyncSession, user: User, notification_id: uuid.UUID) -> None:
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user.id)
        .values(is_read=True)
    )
    await db.commit()


async def mark_all_read(db: AsyncSession, user: User) -> None:
    await db.execute(
        update(Notification).where(Notification.user_id == user.id).values(is_read=True)
    )
    await db.commit()


def _to_response(n: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=n.id,
        type=n.type.value,
        title=n.title,
        message=n.message,
        bet_id=n.bet_id,
        circle_id=n.circle_id,
        is_read=n.is_read,
        created_at=n.created_at,
    )
