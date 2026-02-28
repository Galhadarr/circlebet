"""Add icon_url to circles

Revision ID: 004
Revises: 003
Create Date: 2026-03-01

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("circles", sa.Column("icon_url", sa.String(2048), nullable=True))


def downgrade() -> None:
    op.drop_column("circles", "icon_url")
