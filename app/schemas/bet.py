import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator


class BetOptionResponse(BaseModel):
    id: uuid.UUID
    label: str
    position: int


class BetEntryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    option_id: uuid.UUID
    is_double_down: bool
    entered_at: datetime


class BetResponse(BaseModel):
    id: uuid.UUID
    circle_id: uuid.UUID
    creator_id: uuid.UUID
    title: str
    description: str | None
    image_url: str | None
    status: str
    is_time_limited: bool
    end_time: datetime | None
    options: list[BetOptionResponse]
    result_option_id: uuid.UUID | None
    entries_count: int
    created_at: datetime
    my_entry: BetEntryResponse | None = None


class BetDetailResponse(BetResponse):
    option_counts: dict[str, int] = Field(default_factory=dict)


class BetCreate(BaseModel):
    circle_id: uuid.UUID
    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    image_url: str | None = None
    is_time_limited: bool = False
    end_time: datetime | None = None
    options: list[str] = Field(min_length=2, max_length=5)

    @field_validator("options")
    @classmethod
    def validate_option_labels(cls, v: list[str]) -> list[str]:
        for label in v:
            if not label or not label.strip():
                raise ValueError("Each option must be a non-empty string")
        return [x.strip() for x in v]

    @model_validator(mode="after")
    def validate_create(self) -> "BetCreate":
        if self.is_time_limited and self.end_time is None:
            raise ValueError("end_time is required when the bet is time limited")
        if not self.is_time_limited and self.end_time is not None:
            raise ValueError("end_time must be null when the bet is not time limited")
        return self


class BetUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    image_url: str | None = None
    is_time_limited: bool | None = None
    end_time: datetime | None = None
    options: list[str] | None = Field(default=None, min_length=2, max_length=5)
    creator_option_index: int | None = Field(default=None, ge=0)
    is_double_down: bool | None = None


class BetImageUpdate(BaseModel):
    image_url: str | None = None


class BetEntryCreate(BaseModel):
    option_id: uuid.UUID
    is_double_down: bool = False


class BetEndRequest(BaseModel):
    """Winning option, or null to close the bet with no winner (no score changes)."""

    result_option_id: uuid.UUID | None
