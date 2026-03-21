"""Unique display_name on users

Revision ID: 007
Revises: 006
Create Date: 2026-03-22

"""
from typing import Sequence, Union

from alembic import op

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint("uq_users_display_name", "users", ["display_name"])


def downgrade() -> None:
    op.drop_constraint("uq_users_display_name", "users", type_="unique")
