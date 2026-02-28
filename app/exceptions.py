from fastapi import Request
from fastapi.responses import JSONResponse


class CircleBetError(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code


class InsufficientBalance(CircleBetError):
    def __init__(self):
        super().__init__("Insufficient balance", 400)


class MarketNotOpen(CircleBetError):
    def __init__(self):
        super().__init__("Market is not open for trading", 400)


class MarketNotClosed(CircleBetError):
    def __init__(self):
        super().__init__("Market must be closed before resolution", 400)


class NotCircleMember(CircleBetError):
    def __init__(self):
        super().__init__("You are not a member of this circle", 403)


class NotCircleAdmin(CircleBetError):
    def __init__(self):
        super().__init__("Only the circle creator can perform this action", 403)


class SellNotAllowed(CircleBetError):
    def __init__(self):
        super().__init__("Selling shares is not enabled", 400)


class InsufficientShares(CircleBetError):
    def __init__(self):
        super().__init__("Insufficient shares to sell", 400)


class AlreadyMember(CircleBetError):
    def __init__(self):
        super().__init__("Already a member of this circle", 400)


async def circlebet_error_handler(request: Request, exc: CircleBetError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
