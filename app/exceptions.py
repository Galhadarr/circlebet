from fastapi import Request
from fastapi.responses import JSONResponse


class CircleBetError(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code


class NotCircleMember(CircleBetError):
    def __init__(self):
        super().__init__("You are not a member of this circle", 403)


class NotCircleAdmin(CircleBetError):
    def __init__(self):
        super().__init__("Only the circle creator can perform this action", 403)


class AlreadyMember(CircleBetError):
    def __init__(self):
        super().__init__("Already a member of this circle", 400)


class BetNotFound(CircleBetError):
    def __init__(self):
        super().__init__("Bet not found", 404)


class BetNotEditable(CircleBetError):
    def __init__(self):
        super().__init__("Bet can only be edited while pending", 400)


class BetClosedForEntry(CircleBetError):
    def __init__(self):
        super().__init__("This bet is not accepting new entries", 400)


class AlreadyEnteredBet(CircleBetError):
    def __init__(self):
        super().__init__("You have already entered this bet", 400)


class NotBetCreator(CircleBetError):
    def __init__(self):
        super().__init__("Only the bet creator can perform this action", 403)


class BetCannotEnd(CircleBetError):
    def __init__(self):
        super().__init__("Bet must be active with at least two participants before it can be resolved", 400)


async def circlebet_error_handler(request: Request, exc: CircleBetError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
