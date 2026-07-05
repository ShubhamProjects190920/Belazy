"""
Authentication API Tests
Run with: pytest tests/ -v
These tests verify that every auth endpoint works correctly.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import get_db
from main import app

# Use an in-memory SQLite database for testing (no PostgreSQL needed)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)

VALID_USER = {
    "email": "test@example.com",
    "password": "TestPass1",
    "first_name": "John",
    "last_name": "Doe",
}


def test_register_success():
    response = client.post("/api/v1/auth/register", json=VALID_USER)
    assert response.status_code == 201
    assert "message" in response.json()


def test_register_duplicate_email():
    client.post("/api/v1/auth/register", json=VALID_USER)
    response = client.post("/api/v1/auth/register", json=VALID_USER)
    assert response.status_code == 409


def test_register_weak_password():
    response = client.post(
        "/api/v1/auth/register",
        json={**VALID_USER, "password": "weak"},
    )
    assert response.status_code == 422


def test_login_unverified_email():
    client.post("/api/v1/auth/register", json=VALID_USER)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    # Email not verified yet, should be 403
    assert response.status_code == 403


def test_login_wrong_password():
    client.post("/api/v1/auth/register", json=VALID_USER)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": VALID_USER["email"], "password": "WrongPassword1"},
    )
    assert response.status_code == 401


def test_forgot_password_always_succeeds():
    """Should return 200 even if email doesn't exist (security: no email enumeration)."""
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert response.status_code == 200


def test_get_me_unauthorized():
    """Accessing /me without a token should fail."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403  # HTTPBearer returns 403 when no token
