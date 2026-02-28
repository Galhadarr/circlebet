import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestLeaderboard:
    async def test_leaderboard(self, client: AsyncClient):
        user1 = await create_test_user(client, email="lb1@test.com", display_name="User 1")
        user2 = await create_test_user(client, email="lb2@test.com", display_name="User 2")

        # Create circle
        resp = await client.post(
            "/circles",
            json={"name": "Leaderboard Circle"},
            headers=auth_headers(user1["token"]),
        )
        circle = resp.json()

        # User 2 joins
        await client.post(
            f"/circles/join/{circle['invite_token']}",
            headers=auth_headers(user2["token"]),
        )

        # Check leaderboard
        resp = await client.get(
            f"/circles/{circle['id']}/leaderboard",
            headers=auth_headers(user1["token"]),
        )
        assert resp.status_code == 200
        entries = resp.json()
        assert len(entries) == 2
        assert entries[0]["rank"] == 1
        assert entries[1]["rank"] == 2
        # Both should have same balance initially
        assert entries[0]["balance"] == entries[1]["balance"]
