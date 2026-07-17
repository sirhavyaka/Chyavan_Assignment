import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_airbnb.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_and_login():
    # 1. Register
    reg_response = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "name": "Test User",
        "password": "password123",
        "avatar_url": "https://example.com/avatar.jpg"
    })
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert reg_data["user"]["email"] == "testuser@example.com"
    assert "access_token" in reg_data

    # 2. Login
    login_response = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "password123"
    })
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "testuser@example.com"

def test_get_listings():
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_get_amenities():
    response = client.get("/api/listings/amenities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_create_and_fetch_listing():
    # Register host
    reg = client.post("/api/auth/register", json={
        "email": "host@example.com",
        "name": "Host User",
        "password": "password123"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create listing
    listing_data = {
        "title": "Cozy Test Cabin",
        "description": "A wonderful cabin in the woods for testing",
        "property_type": "Cabin",
        "category": "Cabins",
        "price_per_night": 120.0,
        "cleaning_fee": 40.0,
        "service_fee_percent": 14.0,
        "city": "Lake Tahoe",
        "state": "CA",
        "country": "United States",
        "address": "123 Pine Way",
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1.0,
        "amenity_ids": [],
        "images": [{"url": "https://example.com/cabin.jpg", "caption": "Front view", "display_order": 0}]
    }
    create_resp = client.post("/api/listings", json=listing_data, headers=headers)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["title"] == "Cozy Test Cabin"
    assert created["price_per_night"] == 120.0

    # Fetch listing by ID
    get_resp = client.get(f"/api/listings/{created['id']}")
    assert get_resp.status_code == 200
    fetched = get_resp.json()
    assert fetched["title"] == "Cozy Test Cabin"
