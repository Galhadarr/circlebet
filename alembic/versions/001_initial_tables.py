"""Initial tables

Revision ID: 001
Revises:
Create Date: 2026-02-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "circles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("invite_token", sa.String(64), nullable=False),
        sa.Column("creator_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_circles_invite_token", "circles", ["invite_token"], unique=True)

    op.create_table(
        "circle_members",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("circle_id", sa.Uuid(), nullable=False),
        sa.Column("balance", sa.Numeric(12, 2), nullable=False, server_default="10000.00"),
        sa.Column("joined_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["circle_id"], ["circles.id"]),
        sa.PrimaryKeyConstraint("user_id", "circle_id"),
    )

    op.create_table(
        "markets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("circle_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("q_yes", sa.Numeric(18, 8), nullable=False, server_default="0"),
        sa.Column("q_no", sa.Numeric(18, 8), nullable=False, server_default="0"),
        sa.Column("b", sa.Numeric(12, 4), nullable=False, server_default="1000"),
        sa.Column("status", sa.String(10), nullable=False, server_default="OPEN"),
        sa.Column("outcome", sa.String(3), nullable=True),
        sa.Column("creator_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["circle_id"], ["circles.id"]),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_markets_status", "markets", ["status"])

    op.create_table(
        "holdings",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("market_id", sa.Uuid(), nullable=False),
        sa.Column("yes_shares", sa.Numeric(18, 8), nullable=False, server_default="0"),
        sa.Column("no_shares", sa.Numeric(18, 8), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["market_id"], ["markets.id"]),
        sa.PrimaryKeyConstraint("user_id", "market_id"),
    )

    op.create_table(
        "trades",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("market_id", sa.Uuid(), nullable=False),
        sa.Column("side", sa.String(3), nullable=False),
        sa.Column("direction", sa.String(4), nullable=False),
        sa.Column("amount", sa.Numeric(12, 4), nullable=False),
        sa.Column("shares", sa.Numeric(18, 8), nullable=False),
        sa.Column("price_at_trade", sa.Numeric(10, 8), nullable=False),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["market_id"], ["markets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trades_user_id", "trades", ["user_id"])
    op.create_index("ix_trades_market_id", "trades", ["market_id"])
    op.create_index("ix_trades_timestamp", "trades", ["timestamp"])


def downgrade() -> None:
    op.drop_table("trades")
    op.drop_table("holdings")
    op.drop_table("markets")
    op.drop_table("circle_members")
    op.drop_table("circles")
    op.drop_table("users")
