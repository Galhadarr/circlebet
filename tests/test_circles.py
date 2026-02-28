import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestCircles:
    async def test_create_circle(self, client: AsyncClient):
        user = await create_test_user(client)
        resp = await client.post(
            "/circles",
            json={"name": "Test Circle", "description": "A test circle"},
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Test Circle"
        assert data["member_count"] == 1
        assert data["creator_id"] == user["user_id"]
        assert "invite_token" in data

    async def test_list_circles(self, client: AsyncClient):
        user = await create_test_user(client)
        await client.post(
            "/circles",
            json={"name": "Circle 1"},
            headers=auth_headers(user["token"]),
        )
        resp = await client.get("/circles", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        circles = resp.json()
        assert any(c["name"] == "Circle 1" for c in circles)

    async def test_join_circle(self, client: AsyncClient):
        creator = await create_test_user(client, email="creator@test.com")
        joiner = await create_test_user(client, email="joiner@test.com")

        # Create circle
        resp = await client.post(
            "/circles",
            json={"name": "Join Test"},
            headers=auth_headers(creator["token"]),
        )
        invite_token = resp.json()["invite_token"]

        # Join
        resp = await client.post(
            f"/circles/join/{invite_token}",
            headers=auth_headers(joiner["token"]),
        )
        assert resp.status_code == 200
        assert resp.json()["member_count"] == 2

    async def test_join_circle_already_member(self, client: AsyncClient):
        user = await create_test_user(client)
        resp = await client.post(
            "/circles",
            json={"name": "Already Member"},
            headers=auth_headers(user["token"]),
        )
        invite_token = resp.json()["invite_token"]

        resp = await client.post(
            f"/circles/join/{invite_token}",
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 400

    async def test_join_invalid_token(self, client: AsyncClient):
        user = await create_test_user(client)
        resp = await client.post(
            "/circles/join/invalid-token",
            headers=auth_headers(user["token"]),
        )
        assert resp.status_code == 404
