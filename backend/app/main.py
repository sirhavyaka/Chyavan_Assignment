from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import settings
from app.db.database import engine, SessionLocal, Base
from app.models.models import *  # noqa: F401,F403 — ensures all models are registered with Base
from app.routers import auth, listings, bookings, reviews, wishlists
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Run the core seed script
        seed_database(db)
        
        # Import and run the additional seed scripts for extra data
        try:
            from scripts.add_destinations import add_new_destinations
            from scripts.add_experiences_services import add_experiences_and_services
            
            add_new_destinations()
            add_experiences_and_services()
            print("Auto-seeding completed successfully!")
        except Exception as e:
            print(f"Error running additional seed scripts: {e}")
            
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Airbnb Clone REST API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(wishlists.router)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
