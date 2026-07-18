"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { ListingDetail, Review } from "@/types";
import { formatPrice, formatRating, formatLocation, calculateNights, timeAgo, pluralize } from "@/lib/utils";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState("Overall rating");

  useEffect(() => {
    async function load() {
      try {
        const [listingData, reviewsData] = await Promise.all([
          api.getListing(Number(id)),
          api.getListingReviews(Number(id)),
        ]);
        setListing(listingData);
        setReviews(reviewsData);
        setWishlisted(listingData.is_wishlisted);
      } catch (err) {
        console.error(err);
        showToast("Failed to load listing", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showToast]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to save listings", "info");
      return;
    }
    if (!listing) return;
    try {
      const res = await api.toggleWishlist(listing.id);
      setWishlisted(res.wishlisted);
      showToast(res.wishlisted ? "Saved to wishlist" : "Removed from wishlist", "success");
    } catch {
      showToast("Failed to update wishlist", "error");
    }
  };

  if (loading || !listing) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 pt-8">
        <div className="skeleton h-8 w-3/5 mb-4" />
        <div className="skeleton h-[420px] rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20">
          <div>
            <div className="skeleton h-6 w-2/5 mb-4" />
            <div className="skeleton h-[200px] mb-4" />
          </div>
          <div className="skeleton h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 2; // Default to 2 for preview if no dates selected
  const nightlyTotal = listing.price_per_night * nights;
  const cleaningFee = listing.cleaning_fee;
  const serviceFee = Math.round(nightlyTotal * (listing.service_fee_percent / 100));
  const totalPrice = nightlyTotal + cleaningFee + serviceFee;

  const handleReserve = () => {
    if (!isAuthenticated) {
      showToast("Please log in to book", "info");
      router.push("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      showToast("Please select check-in and checkout dates", "error");
      return;
    }
    router.push(`/book/${listing.id}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 0, url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200", caption: "Photo", display_order: 0 }];

  const ratingCategories = [
    { icon: "✨", label: "Cleanliness", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.cleanliness, 0) / reviews.length : 4.9 },
    { icon: "🎯", label: "Accuracy", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.accuracy, 0) / reviews.length : 4.9 },
    { icon: "🔑", label: "Check-in", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.check_in_rating, 0) / reviews.length : 5.0 },
    { icon: "💬", label: "Communication", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.communication, 0) / reviews.length : 4.9 },
    { icon: "📍", label: "Location", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.location_rating, 0) / reviews.length : 5.0 },
    { icon: "💎", label: "Value", avg: reviews.length > 0 ? reviews.reduce((s, r) => s + r.value, 0) / reviews.length : 4.8 },
  ];

  const reviewFilterChips = ["Overall rating", "Cleanliness", "Accuracy", "Check-in", "Communication", "Location", "Value"];

  return (
    <div className="bg-bg-primary">
      {/* 1. Sticky Top Anchor Navigation (Image 3) */}
      <div className="sticky top-[var(--header-height)] z-40 bg-bg-primary/95 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 text-sm font-semibold text-text-primary">
            <a href="#photos" className="hover:text-text-primary hover:underline transition-colors py-5 border-b-2 border-transparent hover:border-text-primary">Photos</a>
            <a href="#amenities" className="hover:text-text-primary hover:underline transition-colors py-5 border-b-2 border-transparent hover:border-text-primary">Amenities</a>
            <a href="#reviews" className="hover:text-text-primary hover:underline transition-colors py-5 border-b-2 border-transparent hover:border-text-primary">Reviews</a>
            <a href="#location" className="hover:text-text-primary hover:underline transition-colors py-5 border-b-2 border-transparent hover:border-text-primary">Location</a>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm font-bold">{formatPrice(listing.price_per_night, listing.country)}</span>
              <span className="text-xs text-text-secondary"> night</span>
              {listing.rating > 0 && (
                <div className="text-xs text-text-primary font-semibold">★ {formatRating(listing.rating)}</div>
              )}
            </div>
            <button
              onClick={handleReserve}
              className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:brightness-95 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 pt-6 pb-16" id="photos">
        {/* 2. Title & Action Buttons (Image 3) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{listing.title}</h1>
          <div className="flex items-center gap-4 shrink-0 text-sm font-semibold text-text-primary">
            <button className="flex items-center gap-2 hover:bg-bg-secondary px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
              <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M27 18v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9M16 3v18M9 10l7-7 7 7" />
              </svg>
              <span className="underline">Share</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className="flex items-center gap-2 hover:bg-bg-secondary px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill={wishlisted ? "#FF385C" : "none"} stroke={wishlisted ? "#FF385C" : "currentColor"} strokeWidth="2.5">
                <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z" />
              </svg>
              <span className="underline">{wishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* 3. 5-Photo Bento Grid (Image 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden relative h-[320px] md:h-[460px] mb-10 shadow-sm">
          <div className="cursor-pointer overflow-hidden h-full" onClick={() => setShowAllPhotos(true)}>
            <img src={images[0].url} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {images.slice(1, 5).map((img, i) => (
              <div key={img.id} className="cursor-pointer overflow-hidden h-full relative" onClick={() => setShowAllPhotos(true)}>
                <img src={img.url} alt={img.caption || `Photo ${i + 2}`} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
          <button
            className="absolute bottom-5 right-5 px-4 py-2 bg-bg-primary/95 backdrop-blur-sm border border-border-dark rounded-lg text-sm font-semibold cursor-pointer transition-all hover:scale-105 shadow-md flex items-center gap-2 text-text-primary"
            onClick={() => setShowAllPhotos(true)}
          >
            <span>:::</span>
            <span>Show all {images.length} photos</span>
          </button>
        </div>

        {/* All Photos Modal */}
        {showAllPhotos && (
          <div className="modal-overlay z-50" onClick={() => setShowAllPhotos(false)}>
            <div className="modal-content !max-w-5xl bg-bg-primary p-6 rounded-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-border">
                <button className="text-xl font-bold cursor-pointer bg-transparent border-none" onClick={() => setShowAllPhotos(false)}>✕</button>
                <span className="font-bold text-lg text-text-primary">All photos</span>
                <span />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img) => (
                  <img key={img.id} src={img.url} alt={img.caption} className="w-full rounded-xl object-cover aspect-[4/3] shadow-sm" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Main Two-Column Layout (Image 3 & Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20 items-start">
          {/* Left Column */}
          <div className="min-w-0 flex flex-col gap-8">
            {/* Host Header */}
            <div className="flex justify-between items-start gap-6 pb-8 border-b border-border">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                  {listing.property_type} in {formatLocation(listing.city, listing.state, listing.country)}
                </h2>
                <p className="text-base text-text-secondary">
                  {listing.max_guests} {pluralize(listing.max_guests, "guest")} · {listing.bedrooms} {pluralize(listing.bedrooms, "bedroom")} · {listing.beds} {pluralize(listing.beds, "bed")} · {listing.bathrooms} {pluralize(Math.floor(listing.bathrooms), "bathroom")}
                </p>
                {listing.rating > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-base font-bold text-text-primary">
                    <span>★ {formatRating(listing.rating)}</span>
                    <span>·</span>
                    <a href="#reviews" className="underline hover:text-text-primary font-semibold">{listing.review_count} {pluralize(listing.review_count, "review")}</a>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden relative bg-bg-secondary shadow-md border-2 border-bg-primary">
                  <img src={listing.host.avatar_url} alt={listing.host.name} className="w-full h-full object-cover" />
                  {listing.host.is_superhost && <span className="absolute bottom-0 right-0 bg-bg-primary rounded-full p-0.5 text-xs shadow-sm" title="Superhost">⭐</span>}
                </div>
                <span className="text-xs font-semibold text-text-secondary mt-1.5">Hosted by {listing.host.name.split(" ")[0]}</span>
              </div>
            </div>

            {/* Guest Favorite Wreath Banner (Image 3 & Image 1) */}
            {listing.is_guest_favorite && (
              <div className="border border-border rounded-2xl p-6 bg-bg-secondary shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-center md:text-left">
                    <span className="text-4xl">🌿</span>
                    <div>
                      <span className="text-lg font-extrabold block text-text-primary tracking-tight">Guest favourite</span>
                      <p className="text-xs text-text-secondary mt-0.5 max-w-sm">One of the most loved homes on Airbnb based on ratings, reviews, and reliability</p>
                    </div>
                    <span className="text-4xl">🌿</span>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 bg-bg-primary px-5 py-3 rounded-xl border border-border shadow-xs">
                    <div className="text-center">
                      <strong className="text-2xl font-black block text-text-primary">{formatRating(listing.rating)}</strong>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Rating</span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <strong className="text-2xl font-black block text-text-primary">{listing.review_count}</strong>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="flex flex-col gap-5 pb-8 border-b border-border">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">🎖️</span>
                <div>
                  <strong className="text-base font-semibold block text-text-primary">{listing.host.name.split(" ")[0]} is a Superhost</strong>
                  <p className="text-sm text-text-secondary mt-0.5">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">📍</span>
                <div>
                  <strong className="text-base font-semibold block text-text-primary">Great location</strong>
                  <p className="text-sm text-text-secondary mt-0.5">95% of recent guests gave the location a 5-star rating.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">🔑</span>
                <div>
                  <strong className="text-base font-semibold block text-text-primary">Self check-in</strong>
                  <p className="text-sm text-text-secondary mt-0.5">Check yourself in with the smart lock or keypad.</p>
                </div>
              </div>
            </div>

            {/* About this place */}
            <div className="pb-8 border-b border-border" id="about">
              <h2 className="text-xl font-bold mb-4 text-text-primary">About this place</h2>
              <div className="text-base text-text-primary leading-relaxed space-y-4">
                {listing.description.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Where you'll sleep */}
            <div className="pb-8 border-b border-border">
              <h2 className="text-xl font-bold mb-4 text-text-primary">Where you&apos;ll sleep</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: listing.bedrooms }).map((_, i) => (
                  <div key={i} className="border border-border rounded-xl p-5 bg-bg-primary shadow-xs">
                    <div className="text-3xl mb-3">🛏️</div>
                    <strong className="text-base font-semibold block text-text-primary">Bedroom {i + 1}</strong>
                    <span className="text-sm text-text-secondary">{i === 0 ? "1 queen bed" : "2 double beds"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. What this place offers (Image 2) */}
            <div className="pb-8 border-b border-border" id="amenities">
              <h2 className="text-xl font-bold mb-6 text-text-primary">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(showAllAmenities ? listing.amenities : listing.amenities.slice(0, 10)).map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-4 text-base text-text-primary">
                    <span className="text-2xl w-8 text-center shrink-0">{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
              {listing.amenities.length > 10 && !showAllAmenities && (
                <button
                  className="mt-6 px-6 py-3 border border-text-primary rounded-lg font-semibold text-sm hover:bg-bg-secondary transition-colors cursor-pointer bg-bg-primary text-text-primary"
                  onClick={() => setShowAllAmenities(true)}
                >
                  Show all {listing.amenities.length} amenities
                </button>
              )}
            </div>

            {/* Map Section */}
            <div className="pb-8 border-b border-border" id="location">
              <h2 className="text-xl font-bold mb-2 text-text-primary">Where you&apos;ll be</h2>
              <p className="text-base text-text-secondary mb-6">{formatLocation(listing.city, listing.state, listing.country)}</p>
              <div className="w-full h-[320px] bg-bg-secondary rounded-2xl overflow-hidden relative flex flex-col items-center justify-center gap-3 border border-border shadow-inner">
                <div className="w-16 h-16 rounded-full bg-[#FF385C] text-white flex items-center justify-center text-2xl shadow-xl animate-bounce">
                  🏠
                </div>
                <strong className="text-lg font-bold text-text-primary">{listing.city}, {listing.state}</strong>
                <span className="text-xs text-text-secondary bg-bg-primary/90 px-4 py-1.5 rounded-pill shadow-sm">Exact location provided after booking</span>
              </div>
            </div>
          </div>

          {/* 5. Right Column — Reservation Box (Image 2) */}
          <div className="sticky top-[calc(var(--header-height)+32px)] z-30" id="booking-widget">
            <div className="border border-border rounded-2xl p-6 shadow-xl bg-bg-primary">
              {/* Top line: price and rating */}
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <span className="text-2xl font-bold text-text-primary">{formatPrice(listing.price_per_night, listing.country)}</span>
                  <span className="text-base text-text-secondary"> / night</span>
                </div>
                {listing.rating > 0 && (
                  <div className="text-sm font-semibold flex items-center gap-1 text-text-primary">
                    <span>★ {formatRating(listing.rating)}</span>
                    <span>·</span>
                    <a href="#reviews" className="underline text-text-secondary hover:text-text-primary">{listing.review_count} {pluralize(listing.review_count, "review")}</a>
                  </div>
                )}
              </div>

              {/* Date/Guest Box matching Image 2 */}
              <div className="border border-border-dark rounded-xl mb-4 overflow-hidden shadow-xs">
                <div className="grid grid-cols-2 border-b border-border-dark">
                  <div className="p-3 border-r border-border-dark focus-within:bg-bg-secondary">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-primary mb-1">CHECK-IN</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border-none outline-none text-sm bg-transparent text-text-primary font-semibold p-0 cursor-pointer"
                    />
                  </div>
                  <div className="p-3 focus-within:bg-bg-secondary">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-primary mb-1">CHECKOUT</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full border-none outline-none text-sm bg-transparent text-text-primary font-semibold p-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 focus-within:bg-bg-secondary">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-primary mb-1">GUESTS</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full border-none outline-none text-sm bg-transparent text-text-primary font-semibold p-0 cursor-pointer"
                  >
                    {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {pluralize(n, "guest")}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reserve Button (Image 2) */}
              <button
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:brightness-95 text-white font-bold text-base shadow-md transition-all cursor-pointer border-none"
                onClick={handleReserve}
              >
                Reserve
              </button>

              <p className="text-center text-sm text-text-secondary my-3">
                You won&apos;t be charged yet
              </p>

              {/* Price Breakdown (Image 2) */}
              <div className="space-y-3 pt-2 text-base text-text-primary">
                <div className="flex justify-between">
                  <span className="underline">{formatPrice(listing.price_per_night, listing.country)} × {nights} {pluralize(nights, "night")}</span>
                  <span>{formatPrice(nightlyTotal, listing.country)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>{formatPrice(cleaningFee, listing.country)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Stayscape service fee</span>
                  <span>{formatPrice(serviceFee, listing.country)}</span>
                </div>
                <hr className="border-t border-border my-4" />
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>Total before taxes</span>
                  <span>{formatPrice(totalPrice, listing.country)}</span>
                </div>
              </div>
            </div>

            {/* Report this listing below widget (Image 2) */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary hover:underline cursor-pointer">
              <span>⚑</span>
              <span>Report this listing</span>
            </div>
          </div>
        </div>

        {/* 7. Reviews Section (Image 1) */}
        <div className="pt-16" id="reviews">
          {/* Centered Large Rating & Laurel Header (Image 1) */}
          <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto mb-10 pb-8 border-b border-border">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-4xl">🌿</span>
              <span className="text-5xl font-black text-text-primary tracking-tight">★ {formatRating(listing.rating)}</span>
              <span className="text-4xl">🌿</span>
            </div>
            <strong className="text-xl font-bold block text-text-primary mb-1">Guest favourite</strong>
            <p className="text-sm text-text-secondary">One of the most loved homes on Airbnb based on ratings, reviews, and reliability</p>
          </div>

          {/* 7-Metric Horizontal Breakdown Grid (Image 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 mb-10 pb-10 border-b border-border">
            {ratingCategories.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-text-primary">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
                <div className="flex items-center gap-3 w-40">
                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-text-primary rounded-full" style={{ width: `${(cat.avg / 5) * 100}%` }} />
                  </div>
                  <span className="font-bold w-7 text-right text-text-primary">{cat.avg.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review Filter Chips (Image 1) */}
          <div className="flex flex-wrap items-center gap-3 mb-8 overflow-x-auto pb-2">
            {reviewFilterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveReviewTab(chip)}
                className={`px-4 py-2 rounded-pill text-sm font-semibold transition-all cursor-pointer ${
                  activeReviewTab === chip
                    ? "bg-text-primary text-bg-primary border border-text-primary shadow-sm"
                    : "bg-bg-primary text-text-primary border border-border hover:border-text-primary"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Review Cards Grid (Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 rounded-2xl border border-border bg-bg-primary shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={review.user.avatar_url} alt={review.user.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                    <div>
                      <strong className="block text-base font-bold text-text-primary">{review.user.name}</strong>
                      <p className="text-xs text-text-secondary">{review.user.id % 2 === 0 ? "Mumbai, India" : "Bangalore, India"} · {timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-text-primary mb-2 flex items-center gap-1">
                    <span className="text-amber-500">{"★".repeat(Math.round(review.rating))}</span>
                    <span className="text-border-dark">{"★".repeat(5 - Math.round(review.rating))}</span>
                    <span className="ml-1 text-xs text-text-secondary">· Verified stay</span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-primary mb-4">{review.comment}</p>
                </div>
                <span className="text-xs font-semibold underline text-text-primary cursor-pointer hover:text-text-primary">Show more ›</span>
              </div>
            ))}
          </div>

          {/* Show all reviews outline button (Image 1) */}
          <button className="px-6 py-3 border border-text-primary rounded-lg font-bold text-sm hover:bg-bg-secondary transition-colors cursor-pointer bg-bg-primary text-text-primary">
            Show all {listing.review_count || reviews.length} reviews
          </button>
        </div>
      </div>
    </div>
  );
}
