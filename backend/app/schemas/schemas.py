from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ---------- Auth ----------
class UserRegister(BaseModel):
    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ---------- User ----------
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str
    bio: str
    is_superhost: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    id: int
    name: str
    avatar_url: str
    is_superhost: bool

    class Config:
        from_attributes = True


# ---------- Amenity ----------
class AmenityResponse(BaseModel):
    id: int
    name: str
    icon: str
    category: str

    class Config:
        from_attributes = True


# ---------- Listing Image ----------
class ListingImageResponse(BaseModel):
    id: int
    url: str
    caption: str
    display_order: int

    class Config:
        from_attributes = True


class ListingImageCreate(BaseModel):
    url: str
    caption: str = ""
    display_order: int = 0


# ---------- Listing ----------
class ListingCreate(BaseModel):
    title: str
    description: str
    property_type: str = "Entire home"
    category: str = "Trending"
    price_per_night: float
    cleaning_fee: float = 0
    service_fee_percent: float = 14
    city: str
    state: str = ""
    country: str
    address: str = ""
    latitude: float = 0
    longitude: float = 0
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: float = 1
    amenity_ids: list[int] = []
    images: list[ListingImageCreate] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    category: Optional[str] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee_percent: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    amenity_ids: Optional[list[int]] = None
    images: Optional[list[ListingImageCreate]] = None


class ListingCard(BaseModel):
    id: int
    title: str
    city: str
    state: str
    country: str
    price_per_night: float
    rating: float
    review_count: int
    category: str
    property_type: str
    is_guest_favorite: bool
    images: list[ListingImageResponse]
    host: UserBrief
    is_wishlisted: bool = False

    class Config:
        from_attributes = True


class ListingDetail(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    category: str
    price_per_night: float
    cleaning_fee: float
    service_fee_percent: float
    city: str
    state: str
    country: str
    address: str
    latitude: float
    longitude: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    rating: float
    review_count: int
    is_guest_favorite: bool
    images: list[ListingImageResponse]
    amenities: list[AmenityResponse]
    host: UserBrief
    is_wishlisted: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Booking ----------
class BookingCreate(BaseModel):
    listing_id: int
    check_in: str  # YYYY-MM-DD
    check_out: str  # YYYY-MM-DD
    guests: int = 1


class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: str
    check_out: str
    guests: int
    total_price: float
    status: str
    created_at: datetime
    listing: ListingCard
    guest: UserBrief

    class Config:
        from_attributes = True


class BookingBrief(BaseModel):
    id: int
    check_in: str
    check_out: str
    guests: int
    total_price: float
    status: str
    guest: UserBrief

    class Config:
        from_attributes = True


# ---------- Review ----------
class ReviewCreate(BaseModel):
    listing_id: int
    booking_id: Optional[int] = None
    rating: float
    cleanliness: float = 5.0
    accuracy: float = 5.0
    check_in_rating: float = 5.0
    communication: float = 5.0
    location_rating: float = 5.0
    value: float = 5.0
    comment: str


class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: float
    cleanliness: float
    accuracy: float
    check_in_rating: float
    communication: float
    location_rating: float
    value: float
    comment: str
    created_at: datetime
    user: UserBrief

    class Config:
        from_attributes = True


# ---------- Wishlist ----------
class WishlistToggle(BaseModel):
    listing_id: int


class WishlistResponse(BaseModel):
    id: int
    listing_id: int
    listing: ListingCard
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Pagination ----------
class PaginatedListings(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    limit: int
    pages: int
