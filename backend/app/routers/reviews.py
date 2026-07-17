from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.database import get_db
from app.models.models import User, Listing, Review, Booking
from app.schemas.schemas import ReviewCreate, ReviewResponse, UserBrief
from app.services.auth_service import require_auth

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    # Validate listing exists
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Can't review own listing
    if listing.host_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot review your own listing")

    # Check user has stayed (had a confirmed booking)
    has_booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == data.listing_id,
            Booking.guest_id == user.id,
            Booking.status.in_(["confirmed", "completed"]),
        )
        .first()
    )
    if not has_booking:
        raise HTTPException(status_code=400, detail="You must have a booking to leave a review")

    # Check not already reviewed
    existing = (
        db.query(Review)
        .filter(Review.listing_id == data.listing_id, Review.user_id == user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this listing")

    review = Review(
        listing_id=data.listing_id,
        user_id=user.id,
        booking_id=data.booking_id,
        rating=data.rating,
        cleanliness=data.cleanliness,
        accuracy=data.accuracy,
        check_in_rating=data.check_in_rating,
        communication=data.communication,
        location_rating=data.location_rating,
        value=data.value,
        comment=data.comment,
    )
    db.add(review)

    # Update listing aggregate rating
    db.flush()
    avg_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.listing_id == data.listing_id)
        .scalar()
    )
    review_count = (
        db.query(func.count(Review.id))
        .filter(Review.listing_id == data.listing_id)
        .scalar()
    )
    listing.rating = round(float(avg_rating), 2) if avg_rating else 0
    listing.review_count = review_count or 0

    db.commit()
    db.refresh(review)

    # Reload with user
    review = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.id == review.id)
        .first()
    )

    return ReviewResponse(
        id=review.id,
        listing_id=review.listing_id,
        user_id=review.user_id,
        rating=review.rating,
        cleanliness=review.cleanliness,
        accuracy=review.accuracy,
        check_in_rating=review.check_in_rating,
        communication=review.communication,
        location_rating=review.location_rating,
        value=review.value,
        comment=review.comment,
        created_at=review.created_at,
        user=UserBrief.model_validate(review.user),
    )


@router.get("/listing/{listing_id}", response_model=list[ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        ReviewResponse(
            id=r.id,
            listing_id=r.listing_id,
            user_id=r.user_id,
            rating=r.rating,
            cleanliness=r.cleanliness,
            accuracy=r.accuracy,
            check_in_rating=r.check_in_rating,
            communication=r.communication,
            location_rating=r.location_rating,
            value=r.value,
            comment=r.comment,
            created_at=r.created_at,
            user=UserBrief.model_validate(r.user),
        )
        for r in reviews
    ]
