"""Add image_url to markets

Revision ID: 003
Revises: 002
Create Date: 2026-03-01

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("markets", sa.Column("image_url", sa.String(2048), nullable=True))


def downgrade() -> None:
    op.drop_column("markets", "image_url")
