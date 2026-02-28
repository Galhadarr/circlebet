import pytest
import pytest_asyncio
from httpx import AsyncClient

from tests.conftest import auth_headers, create_test_user


@pytest.mark.asyncio
class TestAuth:
    async def test_register(self, client: AsyncClient):
        resp = await client.post("/auth/register", json={
            "email": "new@example.com",
            "password": "password123",
            "display_name": "New User",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_register_duplicate_email(self, client: AsyncClient):
        user = await create_test_user(client, email="dup@example.com")
        resp = await client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "password123",
            "display_name": "Dup User",
        })
        assert resp.status_code == 409

    async def test_login(self, client: AsyncClient):
        await create_test_user(client, email="login@example.com")
        resp = await client.post("/auth/login", json={
            "email": "login@example.com",
            "password": "testpass123",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_login_wrong_password(self, client: AsyncClient):
        await create_test_user(client, email="wrongpw@example.com")
        resp = await client.post("/auth/login", json={
            "email": "wrongpw@example.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    async def test_me(self, client: AsyncClient):
        user = await create_test_user(client, email="me@example.com", display_name="Me User")
        resp = await client.get("/auth/me", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "me@example.com"
        assert data["display_name"] == "Me User"

    async def test_me_no_token(self, client: AsyncClient):
        resp = await client.get("/auth/me")
        assert resp.status_code == 401
