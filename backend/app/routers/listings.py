import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from datetime import date
from app.db.database import get_db
from app.models.models import User, Listing, ListingImage, Amenity, Booking, Wishlist, listing_amenities
from app.schemas.schemas import (
    ListingCreate, ListingUpdate, ListingDetail, ListingCard,
    PaginatedListings, ListingImageCreate, ListingImageResponse, UserBrief,
    AmenityResponse
)
from app.services.auth_service import get_current_user, require_auth

router = APIRouter(prefix="/api/listings", tags=["listings"])


def listing_to_card(listing: Listing, user_id: Optional[int] = None) -> ListingCard:
    """Convert a Listing ORM object to a ListingCard schema."""
    is_wishlisted = False
    if user_id:
        is_wishlisted = any(w.user_id == user_id for w in listing.wishlists)

    return ListingCard(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        price_per_night=listing.price_per_night,
        rating=listing.rating,
        review_count=listing.review_count,
        category=listing.category,
        property_type=listing.property_type,
        is_guest_favorite=listing.is_guest_favorite,
        images=[ListingImageResponse.model_validate(img) for img in listing.images],
        host=UserBrief.model_validate(listing.host),
        is_wishlisted=is_wishlisted,
    )


@router.get("", response_model=PaginatedListings)
def get_listings(
    location: Optional[str] = Query(None, description="Search by city/state/country"),
    check_in: Optional[str] = Query(None, description="Check-in date YYYY-MM-DD"),
    check_out: Optional[str] = Query(None, description="Check-out date YYYY-MM-DD"),
    guests: Optional[int] = Query(None, description="Number of guests"),
    category: Optional[str] = Query(None, description="Listing category"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    property_type: Optional[str] = Query(None),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity IDs"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.host),
        joinedload(Listing.wishlists),
    )

    # Location search (case-insensitive partial match on city, state, country)
    if location:
        loc = f"%{location}%"
        query = query.filter(
            or_(
                Listing.city.ilike(loc),
                Listing.state.ilike(loc),
                Listing.country.ilike(loc),
            )
        )

    # Category filter
    if category:
        query = query.filter(Listing.category == category)

    # Price range
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Property type
    if property_type:
        query = query.filter(Listing.property_type == property_type)

    # Guest capacity
    if guests:
        query = query.filter(Listing.max_guests >= guests)

    # Amenities filter
    if amenities:
        amenity_ids = [int(a.strip()) for a in amenities.split(",") if a.strip()]
        for aid in amenity_ids:
            query = query.filter(
                Listing.amenities.any(Amenity.id == aid)
            )

    # Date availability filter — exclude listings with overlapping confirmed bookings
    if check_in and check_out:
        ci = date.fromisoformat(check_in)
        co = date.fromisoformat(check_out)
        booked_listing_ids = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < co,
                Booking.check_out > ci,
            )
            .distinct()
            .subquery()
        )
        query = query.filter(~Listing.id.in_(db.query(booked_listing_ids.c.listing_id)))

    # Count total before pagination
    total = query.distinct().count()
    pages = math.ceil(total / limit) if total > 0 else 1

    # Paginate
    listings = (
        query.distinct()
        .order_by(Listing.is_guest_favorite.desc(), Listing.rating.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    user_id = current_user.id if current_user else None
    items = [listing_to_card(l, user_id) for l in listings]

    return PaginatedListings(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/amenities", response_model=list[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    """Get all available amenities."""
    return db.query(Amenity).order_by(Amenity.category, Amenity.name).all()


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.host),
            joinedload(Listing.amenities),
            joinedload(Listing.wishlists),
        )
        .filter(Listing.id == listing_id)
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    is_wishlisted = False
    if current_user:
        is_wishlisted = any(w.user_id == current_user.id for w in listing.wishlists)

    return ListingDetail(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee_percent=listing.service_fee_percent,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        address=listing.address,
        latitude=listing.latitude,
        longitude=listing.longitude,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        rating=listing.rating,
        review_count=listing.review_count,
        is_guest_favorite=listing.is_guest_favorite,
        images=[ListingImageResponse.model_validate(img) for img in listing.images],
        amenities=[AmenityResponse.model_validate(a) for a in listing.amenities],
        host=UserBrief.model_validate(listing.host),
        is_wishlisted=is_wishlisted,
        created_at=listing.created_at,
    )


@router.get("/{listing_id}/availability")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    """Return all booked date ranges for a listing."""
    bookings = (
        db.query(Booking)
        .filter(Booking.listing_id == listing_id, Booking.status == "confirmed")
        .all()
    )
    return [
        {"check_in": str(b.check_in), "check_out": str(b.check_out)}
        for b in bookings
    ]


@router.post("", response_model=ListingDetail)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    listing = Listing(
        host_id=user.id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        category=data.category,
        price_per_night=data.price_per_night,
        cleaning_fee=data.cleaning_fee,
        service_fee_percent=data.service_fee_percent,
        city=data.city,
        state=data.state,
        country=data.country,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        bathrooms=data.bathrooms,
    )
    db.add(listing)
    db.flush()

    # Add images
    for img in data.images:
        db.add(ListingImage(
            listing_id=listing.id,
            url=img.url,
            caption=img.caption,
            display_order=img.display_order,
        ))

    # Add amenities
    if data.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
        listing.amenities = amenities

    db.commit()
    db.refresh(listing)

    return get_listing(listing.id, db, user)


@router.put("/{listing_id}", response_model=ListingDetail)
def update_listing(
    listing_id: int,
    data: ListingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update scalar fields
    update_data = data.model_dump(exclude_unset=True, exclude={"amenity_ids", "images"})
    for key, value in update_data.items():
        setattr(listing, key, value)

    # Update amenities
    if data.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
        listing.amenities = amenities

    # Update images (replace all)
    if data.images is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for img in data.images:
            db.add(ListingImage(
                listing_id=listing_id,
                url=img.url,
                caption=img.caption,
                display_order=img.display_order,
            ))

    db.commit()
    db.refresh(listing)
    return get_listing(listing.id, db, user)


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(listing)
    db.commit()
    return {"detail": "Listing deleted"}
