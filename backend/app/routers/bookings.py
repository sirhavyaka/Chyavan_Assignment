from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.models import User, Listing, Booking
from app.schemas.schemas import (
    BookingCreate, BookingResponse, BookingBrief, ListingCard,
    ListingImageResponse, UserBrief
)
from app.services.auth_service import require_auth

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def booking_to_response(booking: Booking) -> BookingResponse:
    listing = booking.listing
    return BookingResponse(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=str(booking.check_in),
        check_out=str(booking.check_out),
        guests=booking.guests,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        listing=ListingCard(
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
        ),
        guest=UserBrief.model_validate(booking.guest),
    )


@router.post("", response_model=BookingResponse)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    # Validate listing exists
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Can't book own listing
    if listing.host_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own listing")

    # Parse and validate dates
    try:
        check_in = date.fromisoformat(data.check_in)
        check_out = date.fromisoformat(data.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    if check_in < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    # Validate guest count
    if data.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {listing.max_guests} guests allowed"
        )

    # Check for overlapping bookings
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.listing_id == data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(
            status_code=409,
            detail="These dates are unavailable — an existing booking overlaps"
        )

    # Calculate total price
    nights = (check_out - check_in).days
    nightly_total = listing.price_per_night * nights
    cleaning = listing.cleaning_fee
    service = round(nightly_total * (listing.service_fee_percent / 100), 2)
    total_price = round(nightly_total + cleaning + service, 2)

    booking = Booking(
        listing_id=data.listing_id,
        guest_id=user.id,
        check_in=check_in,
        check_out=check_out,
        guests=data.guests,
        total_price=total_price,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Reload with relationships
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.guest),
        )
        .filter(Booking.id == booking.id)
        .first()
    )

    return booking_to_response(booking)


@router.get("/my-trips", response_model=list[BookingResponse])
def get_my_trips(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.guest),
        )
        .filter(Booking.guest_id == user.id)
        .order_by(Booking.check_in.desc())
        .all()
    )
    return [booking_to_response(b) for b in bookings]


@router.get("/host-bookings", response_model=list[BookingResponse])
def get_host_bookings(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    bookings = (
        db.query(Booking)
        .join(Listing)
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.guest),
        )
        .filter(Listing.host_id == user.id)
        .order_by(Booking.check_in.desc())
        .all()
    )
    return [booking_to_response(b) for b in bookings]


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.guest),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Only the guest or the host can cancel
    if booking.guest_id != user.id and booking.listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return booking_to_response(booking)
