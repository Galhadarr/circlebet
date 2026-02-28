import asyncio
import logging

from app.config import settings
from app.database import async_session
from app.services.market import close_expired_markets

logger = logging.getLogger(__name__)


async def close_expired_markets_loop() -> None:
    while True:
        try:
            async with async_session() as db:
                count = await close_expired_markets(db)
                if count > 0:
                    logger.info("Auto-closed %d expired market(s)", count)
        except Exception:
            logger.exception("Error in market closer loop")
        await asyncio.sleep(settings.MARKET_CLOSE_INTERVAL_SECONDS)
