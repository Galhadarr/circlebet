import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.exceptions import CircleBetError, circlebet_error_handler
from app.routes import auth, circles, leaderboard, markets, portfolio, trades
from app.tasks.market_closer import close_expired_markets_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(close_expired_markets_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CircleBet", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(CircleBetError, circlebet_error_handler)

app.include_router(auth.router)
app.include_router(circles.router)
app.include_router(markets.router)
app.include_router(trades.router)
app.include_router(portfolio.router)
app.include_router(leaderboard.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
