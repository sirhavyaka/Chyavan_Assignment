"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { ListingDetail, Review, BookedDateRange } from "@/types";
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

  useEffect(() => {
    async function load() {
      try {
        const [listingData, reviewsData] = await Promise.all([
          api.getListing(Number(id)),
          api.getListingReviews(Number(id)),
          api.getListingAvailability(Number(id)),
        ]);
        setListing(listingData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        showToast("Failed to load listing", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showToast]);

  if (loading || !listing) {
    return (
      <div className="container pt-8">
        <div className="skeleton h-8 w-3/5 mb-4" />
        <div className="skeleton h-[400px] rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20">
          <div>
            <div className="skeleton h-6 w-2/5 mb-4" />
            <div className="skeleton h-[200px] mb-4" />
          </div>
          <div className="skeleton h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
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
      showToast("Please select dates", "error");
      return;
    }
    router.push(`/book/${listing.id}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 0, url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200", caption: "Photo", display_order: 0 }];

  const ratingCategories = reviews.length > 0
    ? [
        { label: "Cleanliness", avg: reviews.reduce((s, r) => s + r.cleanliness, 0) / reviews.length },
        { label: "Accuracy", avg: reviews.reduce((s, r) => s + r.accuracy, 0) / reviews.length },
        { label: "Check-in", avg: reviews.reduce((s, r) => s + r.check_in_rating, 0) / reviews.length },
        { label: "Communication", avg: reviews.reduce((s, r) => s + r.communication, 0) / reviews.length },
        { label: "Location", avg: reviews.reduce((s, r) => s + r.location_rating, 0) / reviews.length },
        { label: "Value", avg: reviews.reduce((s, r) => s + r.value, 0) / reviews.length },
      ]
    : [];

  return (
    <div className="container pt-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-5 text-text-primary">{listing.title}</h1>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden relative h-[300px] md:h-[420px] mb-8">
        <div className="cursor-pointer overflow-hidden h-full" onClick={() => setShowAllPhotos(true)}>
          <img src={images[0].url} alt={listing.title} className="w-full h-full object-cover transition-opacity duration-150 hover:opacity-90" />
        </div>
        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {images.slice(1, 5).map((img, i) => (
            <div key={img.id} className="cursor-pointer overflow-hidden h-full" onClick={() => setShowAllPhotos(true)}>
              <img src={img.url} alt={img.caption || `Photo ${i + 2}`} className="w-full h-full object-cover transition-opacity duration-150 hover:opacity-90" />
            </div>
          ))}
        </div>
        <button
          className="absolute bottom-4 right-4 px-4 py-2 bg-white border border-text-primary rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-bg-secondary shadow-sm"
          onClick={() => setShowAllPhotos(true)}
        >
          ▦ Show all photos
        </button>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="modal-overlay" onClick={() => setShowAllPhotos(false)}>
          <div className="modal-content !max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowAllPhotos(false)}>✕</button>
              <span className="font-semibold">All photos</span>
              <span />
            </div>
            <div className="modal-body flex flex-col gap-4">
              {images.map((img) => (
                <img key={img.id} src={img.url} alt={img.caption} className="w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20 items-start">
        {/* Left Column */}
        <div className="min-w-0">
          {/* Host & Property Info */}
          <div className="flex justify-between items-start gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-text-primary">
                {listing.property_type} in {formatLocation(listing.city, listing.state, listing.country)}
              </h2>
              <p className="text-base text-text-secondary">
                {listing.max_guests} {pluralize(listing.max_guests, "guest")} · {listing.bedrooms} {pluralize(listing.bedrooms, "bedroom")} · {listing.beds} {pluralize(listing.beds, "bed")} · {listing.bathrooms} {pluralize(Math.floor(listing.bathrooms), "bath")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 relative bg-bg-secondary">
              <img src={listing.host.avatar_url} alt={listing.host.name} className="w-full h-full object-cover" />
              {listing.host.is_superhost && <span className="absolute bottom-0 right-0 text-sm" title="Superhost">⭐</span>}
            </div>
          </div>

          {listing.is_guest_favorite && (
            <div className="mt-6 border border-border rounded-xl p-5 md:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-3xl">🏆</span>
                <div className="flex-1">
                  <strong className="text-base font-semibold block">Guest favorite</strong>
                  <p className="text-xs text-text-secondary mt-0.5">One of the most loved homes on Stayscape, according to guests</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <strong className="text-xl font-bold block">{formatRating(listing.rating)}</strong>
                    <span className="text-[11px] text-text-secondary">★★★★★</span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <strong className="text-xl font-bold block">{listing.review_count}</strong>
                    <span className="text-[11px] text-text-secondary">{pluralize(listing.review_count, "Review")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <hr className="divider" />

          {/* Host Info */}
          <div className="flex items-center gap-4">
            <img src={listing.host.avatar_url} alt={listing.host.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="text-base font-semibold">Hosted by {listing.host.name}</h3>
              {listing.host.is_superhost && (
                <p className="text-sm text-text-secondary">
                  Superhost · Experienced, highly rated host
                </p>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-5 text-text-primary">About this place</h2>
            {listing.description.split("\n").map((p, i) => (
              <p key={i} className="mb-3 leading-relaxed text-text-primary">{p}</p>
            ))}
          </div>

          <hr className="divider" />

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-5 text-text-primary">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(showAllAmenities ? listing.amenities : listing.amenities.slice(0, 10)).map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-4 text-base">
                  <span className="text-2xl w-8 text-center shrink-0">{amenity.icon}</span>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
            {listing.amenities.length > 10 && !showAllAmenities && (
              <button className="btn btn-outline mt-4" onClick={() => setShowAllAmenities(true)}>
                Show all {listing.amenities.length} amenities
              </button>
            )}
          </div>

          <hr className="divider" />

          {/* Map placeholder */}
          <div>
            <h2 className="text-xl font-semibold mb-5 text-text-primary">Where you&apos;ll be</h2>
            <p className="mb-4 text-text-secondary">
              {formatLocation(listing.city, listing.state, listing.country)}
            </p>
            <div className="w-full h-[200px] bg-bg-secondary rounded-xl flex flex-col items-center justify-center gap-2 text-lg">
              <span className="text-3xl">📍</span>
              <p className="font-medium">{listing.city}, {listing.country}</p>
              <p className="text-xs text-text-secondary">Exact location provided after booking</p>
            </div>
          </div>
        </div>

        {/* Right Column — Booking Widget */}
        <div className="sticky top-[calc(var(--header-height)+24px)]">
          <div className="border border-border rounded-xl p-6 shadow-card bg-bg-primary">
            <div className="mb-4">
              <span className="text-xl font-semibold">{formatPrice(listing.price_per_night)}</span>
              <span className="text-base text-text-secondary"> night</span>
            </div>

            {listing.rating > 0 && (
              <div className="text-sm mb-4">
                ★ {formatRating(listing.rating)} · {listing.review_count} {pluralize(listing.review_count, "review")}
              </div>
            )}

            <div className="border border-border-dark rounded-lg mb-4 overflow-hidden">
              <div className="grid grid-cols-2 border-b border-border-dark">
                <div className="p-2.5 border-r border-border-dark">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary mb-1">CHECK-IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border-none outline-none text-sm bg-transparent text-text-primary p-0"
                  />
                </div>
                <div className="p-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary mb-1">CHECKOUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    className="w-full border-none outline-none text-sm bg-transparent text-text-primary p-0"
                  />
                </div>
              </div>
              <div className="p-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary mb-1">GUESTS</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full border-none outline-none text-sm bg-transparent text-text-primary p-0"
                >
                  {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {pluralize(n, "guest")}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={handleReserve}>
              Reserve
            </button>

            {nights > 0 && (
              <div className="mt-4">
                <p className="text-center text-sm text-text-secondary mb-4">
                  You won&apos;t be charged yet
                </p>
                <div className="flex justify-between text-base mb-3 text-text-primary">
                  <span className="underline">{formatPrice(listing.price_per_night)} × {nights} {pluralize(nights, "night")}</span>
                  <span>{formatPrice(nightlyTotal)}</span>
                </div>
                <div className="flex justify-between text-base mb-3 text-text-primary">
                  <span className="underline">Cleaning fee</span>
                  <span>{formatPrice(cleaningFee)}</span>
                </div>
                <div className="flex justify-between text-base mb-3 text-text-primary">
                  <span className="underline">Stayscape service fee</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <hr className="divider" />
                <div className="flex justify-between text-base font-semibold text-text-primary">
                  <span>Total before taxes</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <hr className="divider mt-12" />
      <div className="pb-12">
        <h2 className="text-xl font-semibold mb-5 text-text-primary">
          {listing.rating > 0 && `★ ${formatRating(listing.rating)} · `}{listing.review_count} {pluralize(listing.review_count, "review")}
        </h2>

        {/* Rating breakdown */}
        {ratingCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-10 mb-8">
            {ratingCategories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0">{cat.label}</span>
                <div className="flex-1 h-1 bg-bg-tertiary rounded overflow-hidden">
                  <div className="h-full bg-text-primary rounded" style={{ width: `${(cat.avg / 5) * 100}%` }} />
                </div>
                <span className="w-8 text-right shrink-0 text-xs">{cat.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <img src={review.user.avatar_url} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <strong className="block text-sm font-semibold">{review.user.name}</strong>
                  <p className="text-xs text-text-secondary">{timeAgo(review.created_at)}</p>
                </div>
              </div>
              <div className="text-xs mb-2 tracking-wider text-text-primary">
                {"★".repeat(Math.round(review.rating))}{"☆".repeat(5 - Math.round(review.rating))}
              </div>
              <p className="text-sm leading-relaxed text-text-primary">{review.comment}</p>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <p className="text-text-secondary mt-4">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
