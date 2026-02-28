from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestTrades:
    async def _setup_market(self, client, token):
        """Create a circle and market, return (circle, market) dicts."""
        resp = await client.post(
            "/circles",
            json={"name": "Trade Test Circle"},
            headers=auth_headers(token),
        )
        circle = resp.json()
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        resp = await client.post(
            "/markets",
            json={"circle_id": circle["id"], "title": "Trade test", "end_date": end_date},
            headers=auth_headers(token),
        )
        market = resp.json()
        return circle, market

    async def test_buy_yes(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        resp = await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "100"},
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["side"] == "YES"
        assert data["direction"] == "BUY"
        assert float(data["shares"]) > 0
        assert float(data["new_price_yes"]) > 0.5  # price should increase
        assert float(data["new_balance"]) == pytest.approx(9900, abs=1)

    async def test_buy_no(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        resp = await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "NO", "amount": "100"},
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["side"] == "NO"
        assert float(data["new_price_yes"]) < 0.5  # YES price should decrease

    async def test_insufficient_balance(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        resp = await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "99999"},
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 400

    async def test_trade_preview(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        resp = await client.post(
            f"/markets/{market['id']}/trade-preview",
            json={"side": "YES", "amount": "100"},
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert float(data["estimated_shares"]) > 0
        assert float(data["price_impact"]) > 0

    async def test_trade_history(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        # Make a trade
        await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "50"},
            headers=auth_headers(user["token"]),
        )

        resp = await client.get(
            f"/markets/{market['id']}/trades",
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        trades = resp.json()
        assert len(trades) >= 1
        assert trades[0]["side"] == "YES"

    async def test_multiple_trades_affect_price(self, client: AsyncClient):
        user = await create_test_user(client)
        circle, market = await self._setup_market(client, user["token"])

        # Buy YES
        resp1 = await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "100"},
            headers=auth_headers(user["token"]),
        )
        price1 = float(resp1.json()["new_price_yes"])

        # Buy more YES — price should be even higher
        resp2 = await client.post(
            f"/markets/{market['id']}/trade",
            json={"side": "YES", "amount": "100"},
            headers=auth_headers(user["token"]),
        )
        price2 = float(resp2.json()["new_price_yes"])
        assert price2 > price1
