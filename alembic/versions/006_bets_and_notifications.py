"""Bets, notifications, score instead of balance

Revision ID: 006
Revises: 005
Create Date: 2026-03-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("trades")
    op.drop_table("holdings")
    op.drop_table("markets")

    op.add_column("circle_members", sa.Column("score", sa.Integer(), nullable=False, server_default="0"))
    op.drop_column("circle_members", "balance")

    op.create_table(
        "bets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("circle_id", sa.Uuid(), nullable=False),
        sa.Column("creator_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(2048), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("is_time_limited", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["circle_id"], ["circles.id"]),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bets_circle_id", "bets", ["circle_id"])
    op.create_index("ix_bets_status", "bets", ["status"])

    op.create_table(
        "bet_options",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("bet_id", sa.Uuid(), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["bet_id"], ["bets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bet_options_bet_id", "bet_options", ["bet_id"])

    op.create_table(
        "bet_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("bet_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("option_id", sa.Uuid(), nullable=False),
        sa.Column("is_double_down", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("entered_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["bet_id"], ["bets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["option_id"], ["bet_options.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bet_id", "user_id", name="uq_bet_entries_bet_user"),
    )
    op.create_index("ix_bet_entries_bet_id", "bet_entries", ["bet_id"])
    op.create_index("ix_bet_entries_user_id", "bet_entries", ["user_id"])

    op.add_column("bets", sa.Column("result_option_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "fk_bets_result_option_id",
        "bets",
        "bet_options",
        ["result_option_id"],
        ["id"],
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("type", sa.String(32), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("bet_id", sa.Uuid(), nullable=True),
        sa.Column("circle_id", sa.Uuid(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["bet_id"], ["bets.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["circle_id"], ["circles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_constraint("fk_bets_result_option_id", "bets", type_="foreignkey")
    op.drop_column("bets", "result_option_id")
    op.drop_table("bet_entries")
    op.drop_table("bet_options")
    op.drop_table("bets")

    op.add_column(
        "circle_members",
        sa.Column("balance", sa.Numeric(12, 2), nullable=False, server_default="10000.00"),
    )
    op.drop_column("circle_members", "score")

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
