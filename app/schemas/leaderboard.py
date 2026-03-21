import uuid

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    display_name: str
    score: int
