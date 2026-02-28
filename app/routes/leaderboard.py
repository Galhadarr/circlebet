import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry
from app.services.leaderboard import get_circle_leaderboard

router = APIRouter(tags=["leaderboard"])


@router.get("/circles/{circle_id}/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    circle_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_circle_leaderboard(db, circle_id)
