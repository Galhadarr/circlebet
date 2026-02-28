from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestPortfolio:
    async def test_empty_portfolio(self, client: AsyncClient):
        user = await create_test_user(client)
        resp = await client.get("/portfolio", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        assert resp.json()["holdings"] == []

    async def test_portfolio_after_trade(self, client: AsyncClient):
        user = await create_test_user(client)

        # Create circle + market
        resp = await client.post(
            "/circles",
            json={"name": "Portfolio Circle"},
            headers=auth_headers(user["token"]),
        )
        circle = resp.json()
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        resp = await client.post(
            "/markets",
            json={"circle_id": circle["id"], "title": "Portfolio test", "end_date": end_date},
            headers=auth_headers(user["token"]),
        )
        market = resp.json()

        # Trade
        await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "100"},
            headers=auth_headers(user["token"]),
        )

        # Check portfolio
        resp = await client.get("/portfolio", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        holdings = resp.json()["holdings"]
        assert len(holdings) >= 1
        assert float(holdings[0]["yes_shares"]) > 0
