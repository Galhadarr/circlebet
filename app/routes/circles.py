import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.circle import CircleCreate, CircleIconUpdate, CircleMemberResponse, CircleResponse
from app.services.circle import create_circle, get_circle, get_circle_members, get_user_circles, join_circle, update_circle_icon

router = APIRouter(prefix="/circles", tags=["circles"])


@router.post("", response_model=CircleResponse, status_code=201)
async def create(
    req: CircleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_circle(db, user, req)


@router.get("", response_model=list[CircleResponse])
async def list_circles(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_circles(db, user)


@router.get("/{circle_id}", response_model=CircleResponse)
async def get(
    circle_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_circle(db, circle_id, user)


@router.post("/join/{invite_token}", response_model=CircleResponse)
async def join(
    invite_token: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await join_circle(db, user, invite_token)


@router.patch("/{circle_id}/icon", response_model=CircleResponse)
async def update_icon(
    circle_id: uuid.UUID,
    req: CircleIconUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_circle_icon(db, user, circle_id, req.icon_url)


@router.get("/{circle_id}/members", response_model=list[CircleMemberResponse])
async def members(
    circle_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    members = await get_circle_members(db, circle_id)
    return [
        CircleMemberResponse(
            user_id=m.user_id,
            display_name=m.user.display_name,
            balance=m.balance,
            joined_at=m.joined_at,
        )
        for m in members
    ]
