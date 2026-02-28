from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestMarkets:
    async def _create_circle(self, client, token):
        resp = await client.post(
            "/circles",
            json={"name": "Market Test Circle"},
            headers=auth_headers(token),
        )
        return resp.json()

    async def test_create_market(self, client: AsyncClient):
        user = await create_test_user(client)
        circle = await self._create_circle(client, user["token"])
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        resp = await client.post(
            "/markets",
            json={
                "circle_id": circle["id"],
                "title": "Will it rain tomorrow?",
                "description": "Simple weather bet",
                "end_date": end_date,
            },
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Will it rain tomorrow?"
        assert data["status"] == "OPEN"
        assert float(data["price_yes"]) == pytest.approx(0.5, abs=0.01)

    async def test_create_market_past_end_date(self, client: AsyncClient):
        user = await create_test_user(client)
        circle = await self._create_circle(client, user["token"])
        end_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

        resp = await client.post(
            "/markets",
            json={
                "circle_id": circle["id"],
                "title": "Past market",
                "end_date": end_date,
            },
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 400

    async def test_get_market(self, client: AsyncClient):
        user = await create_test_user(client)
        circle = await self._create_circle(client, user["token"])
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        create_resp = await client.post(
            "/markets",
            json={
                "circle_id": circle["id"],
                "title": "Detail test",
                "end_date": end_date,
            },
            headers=auth_headers(user["token"]),
        )
        market_id = create_resp.json()["id"]

        resp = await client.get(
            f"/markets/{market_id}",
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["q_yes"] == "0E-8" or float(data["q_yes"]) == 0
        assert "total_volume" in data

    async def test_list_circle_markets(self, client: AsyncClient):
        user = await create_test_user(client)
        circle = await self._create_circle(client, user["token"])
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        await client.post(
            "/markets",
            json={"circle_id": circle["id"], "title": "Market 1", "end_date": end_date},
            headers=auth_headers(user["token"]),
        )

        resp = await client.get(
            f"/markets/circle/{circle['id']}",
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_non_member_cannot_create_market(self, client: AsyncClient):
        creator = await create_test_user(client, email="mcreator@test.com")
        outsider = await create_test_user(client, email="outsider@test.com")
        circle = await self._create_circle(client, creator["token"])
        end_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        resp = await client.post(
            "/markets",
            json={"circle_id": circle["id"], "title": "Outsider market", "end_date": end_date},
            headers=auth_headers(outsider["token"]),
        )
        assert resp.status_code == 403
