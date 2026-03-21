import uuid
from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    message: str
    bet_id: uuid.UUID | None
    circle_id: uuid.UUID | None
    is_read: bool
    created_at: datetime
