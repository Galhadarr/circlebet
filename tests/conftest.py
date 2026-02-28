import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models import *  # noqa: F401, F403

# Use a test database — replace only the database name at the end of the URL
TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + "/circlebet_test"


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


async def create_test_user(client: AsyncClient, email: str = None, display_name: str = "Test User") -> dict:
    """Helper to register a user and return {"user_id", "token", "email"}."""
    email = email or f"test-{uuid.uuid4().hex[:8]}@example.com"
    resp = await client.post("/auth/register", json={
        "email": email,
        "password": "testpass123",
        "display_name": display_name,
    })
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    # Get user info
    resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    user_data = resp.json()

    return {"user_id": user_data["id"], "token": token, "email": email}


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
