import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.market import MarketCreate, MarketDetailResponse, MarketImageUpdate, MarketResponse, ResolveRequest
from app.services.market import create_market, get_circle_markets, get_market, resolve_market, update_market_image

router = APIRouter(prefix="/markets", tags=["markets"])


@router.post("", response_model=MarketResponse, status_code=201)
async def create(
    req: MarketCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_market(db, user, req)


@router.get("/{market_id}", response_model=MarketDetailResponse)
async def get(
    market_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_market(db, market_id)


@router.get("/circle/{circle_id}", response_model=list[MarketResponse])
async def list_by_circle(
    circle_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_circle_markets(db, circle_id)


@router.patch("/{market_id}/image", response_model=MarketResponse)
async def update_image(
    market_id: uuid.UUID,
    req: MarketImageUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_market_image(db, user, market_id, req.image_url)


@router.post("/{market_id}/resolve", response_model=MarketResponse)
async def resolve(
    market_id: uuid.UUID,
    req: ResolveRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await resolve_market(db, user, market_id, req.outcome)
