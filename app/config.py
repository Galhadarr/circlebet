from decimal import Decimal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://circlebet:circlebet@localhost:5432/circlebet"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALLOW_SELL: bool = True
    INITIAL_BALANCE: Decimal = Decimal("10000.00")
    DEFAULT_LIQUIDITY_B: Decimal = Decimal("100")
    MARKET_CLOSE_INTERVAL_SECONDS: int = 60
    GOOGLE_CLIENT_ID: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
