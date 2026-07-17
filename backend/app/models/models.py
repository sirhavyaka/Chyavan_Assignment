import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, Date,
    ForeignKey, Table, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.database import Base


# ---------- Association table for Listings <-> Amenities (M2M) ----------
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


# ---------- Users ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), default="")
    bio = Column(Text, default="")
    is_superhost = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


# ---------- Listings ----------
class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(100), nullable=False)  # Entire home, Private room, Shared room
    category = Column(String(100), nullable=False, default="Trending")  # Beach, Cabins, Countryside, etc.
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0)
    service_fee_percent = Column(Float, default=14)  # Airbnb-style service fee %
    city = Column(String(255), nullable=False)
    state = Column(String(255), default="")
    country = Column(String(255), nullable=False)
    address = Column(String(500), default="")
    latitude = Column(Float, default=0)
    longitude = Column(Float, default=0)
    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Float, default=1)
    rating = Column(Float, default=0)
    review_count = Column(Integer, default=0)
    is_guest_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("price_per_night > 0", name="positive_price"),
        CheckConstraint("max_guests > 0", name="positive_guests"),
    )


# ---------- Listing Images ----------
class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(1000), nullable=False)
    caption = Column(String(255), default="")
    display_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")


# ---------- Amenities ----------
class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), default="✓")  # Emoji or icon identifier
    category = Column(String(100), default="General")  # Essentials, Features, Safety, etc.

    listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")


# ---------- Bookings ----------
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="confirmed")  # confirmed, cancelled, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

    __table_args__ = (
        CheckConstraint("check_out > check_in", name="valid_dates"),
        CheckConstraint("guests > 0", name="positive_guest_count"),
    )


# ---------- Reviews ----------
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Float, nullable=False)
    cleanliness = Column(Float, default=5.0)
    accuracy = Column(Float, default=5.0)
    check_in_rating = Column(Float, default=5.0)
    communication = Column(Float, default=5.0)
    location_rating = Column(Float, default=5.0)
    value = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")


# ---------- Wishlists ----------
class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlists")
