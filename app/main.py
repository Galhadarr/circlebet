from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.exceptions import CircleBetError, circlebet_error_handler
from app.routes import auth, bets, circles, leaderboard, notifications, uploads

app = FastAPI(title="CircleBet", version="0.1.0")

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
app.include_router(bets.router)
app.include_router(leaderboard.router)
app.include_router(notifications.router)
app.include_router(uploads.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
