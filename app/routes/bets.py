import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.bet import (
    BetCreate,
    BetDetailResponse,
    BetEndRequest,
    BetEntryCreate,
    BetImageUpdate,
    BetResponse,
    BetUpdate,
)
from app.services import bet as bet_service

router = APIRouter(prefix="/bets", tags=["bets"])


@router.post("", response_model=BetResponse, status_code=201)
async def create_bet(
    req: BetCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.create_bet(db, user, req)


@router.get("/circle/{circle_id}", response_model=list[BetResponse])
async def list_circle_bets(
    circle_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    bet_filter: str = Query("all", alias="filter", description="all | entered | created"),
    status: str | None = Query(None, description="PENDING | ACTIVE | FINISHED"),
):
    return await bet_service.get_circle_bets(db, user, circle_id, list_filter=bet_filter, status_filter=status)


@router.get("/{bet_id}", response_model=BetDetailResponse)
async def get_bet(
    bet_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.get_bet(db, bet_id, user)


@router.post("/{bet_id}/enter", response_model=BetResponse)
async def enter_bet(
    bet_id: uuid.UUID,
    req: BetEntryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.enter_bet(db, user, bet_id, req)


@router.post("/{bet_id}/end", response_model=BetResponse)
async def end_bet(
    bet_id: uuid.UUID,
    req: BetEndRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.end_bet(db, user, bet_id, req)


@router.patch("/{bet_id}", response_model=BetResponse)
async def update_bet(
    bet_id: uuid.UUID,
    req: BetUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.update_bet(db, user, bet_id, req)


@router.patch("/{bet_id}/image", response_model=BetResponse)
async def update_bet_image(
    bet_id: uuid.UUID,
    req: BetImageUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await bet_service.update_bet_image(db, user, bet_id, req)


@router.delete("/{bet_id}", status_code=204)
async def delete_bet(
    bet_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await bet_service.delete_bet(db, user, bet_id)
