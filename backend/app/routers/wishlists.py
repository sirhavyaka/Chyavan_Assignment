from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.models import User, Listing, Wishlist
from app.schemas.schemas import WishlistToggle, ListingCard, ListingImageResponse, UserBrief
from app.services.auth_service import require_auth

router = APIRouter(prefix="/api/wishlists", tags=["wishlists"])


@router.post("/toggle")
def toggle_wishlist(
    data: WishlistToggle,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == data.listing_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"wishlisted": False, "listing_id": data.listing_id}
    else:
        wishlist = Wishlist(user_id=user.id, listing_id=data.listing_id)
        db.add(wishlist)
        db.commit()
        return {"wishlisted": True, "listing_id": data.listing_id}


@router.get("", response_model=list[ListingCard])
def get_wishlists(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    wishlists = (
        db.query(Wishlist)
        .options(
            joinedload(Wishlist.listing).joinedload(Listing.images),
            joinedload(Wishlist.listing).joinedload(Listing.host),
        )
        .filter(Wishlist.user_id == user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    return [
        ListingCard(
            id=w.listing.id,
            title=w.listing.title,
            city=w.listing.city,
            state=w.listing.state,
            country=w.listing.country,
            price_per_night=w.listing.price_per_night,
            rating=w.listing.rating,
            review_count=w.listing.review_count,
            category=w.listing.category,
            property_type=w.listing.property_type,
            is_guest_favorite=w.listing.is_guest_favorite,
            images=[ListingImageResponse.model_validate(img) for img in w.listing.images],
            host=UserBrief.model_validate(w.listing.host),
            is_wishlisted=True,
        )
        for w in wishlists
    ]
