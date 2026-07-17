"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/types";
import { formatPrice, formatLocation, formatRating } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";

interface Props {
  listing: ListingCardType;
  onWishlistChange?: () => void;
}

export default function ListingCard({ listing, onWishlistChange }: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(listing.is_wishlisted);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 0, url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600", caption: "Placeholder", display_order: 0 }];

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast("Please log in to save listings", "info");
      return;
    }
    try {
      const res = await api.toggleWishlist(listing.id);
      setWishlisted(res.wishlisted);
      showToast(res.wishlisted ? "Saved to wishlist" : "Removed from wishlist", "success");
      onWishlistChange?.();
    } catch {
      showToast("Failed to update wishlist", "error");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link href={`/listings/${listing.id}`} className="block text-decoration-none text-inherit group" id={`listing-card-${listing.id}`}>
      {/* Image Carousel */}
      <div className="relative aspect-[1/0.95] rounded-xl overflow-hidden bg-bg-secondary">
        <img
          src={images[currentImage].url}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Carousel Navigation */}
        {images.length > 1 && (
          <>
            {currentImage > 0 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 rounded-full bg-white/90 border-none cursor-pointer text-base flex items-center justify-center opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-white hover:scale-105 shadow-sm z-10 text-text-primary"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            {currentImage < images.length - 1 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white/90 border-none cursor-pointer text-base flex items-center justify-center opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-white hover:scale-105 shadow-sm z-10 text-text-primary"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-150 ${
                    i === currentImage ? "bg-white w-1.5 h-1.5" : "bg-white/60 w-1.25 h-1.25"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Wishlist Heart */}
        <button
          className="absolute top-2.5 right-2.5 bg-transparent border-none cursor-pointer z-10 transition-transform active:scale-90 hover:scale-110"
          onClick={handleWishlist}
          aria-label="Save to wishlist"
        >
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path
              d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z"
              fill={wishlisted ? "#FF385C" : "rgba(0,0,0,0.5)"}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Guest Favorite Badge */}
        {listing.is_guest_favorite && (
          <div className="absolute top-2.5 left-2.5 bg-white px-2.5 py-1 rounded-pill text-xs font-bold shadow-sm z-10">
            <span>Guest favorite</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
            {formatLocation(listing.city, listing.state, listing.country)}
          </span>
          {listing.rating > 0 && (
            <span className="text-sm font-normal text-text-primary shrink-0 flex items-center gap-0.5">
              ★ {formatRating(listing.rating)}
            </span>
          )}
        </div>
        <div className="text-sm text-text-secondary mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
          {listing.title}
        </div>
        <div className="mt-1">
          <span className="text-sm font-semibold">{formatPrice(listing.price_per_night)}</span>
          <span className="text-sm text-text-secondary"> night</span>
        </div>
      </div>
    </Link>
  );
}
