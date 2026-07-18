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
  badgeText?: string;
  showIncludeFeesBadge?: boolean;
  experienceSchedule?: "today" | "tomorrow";
}

export default function ListingCard({ listing, onWishlistChange, badgeText, showIncludeFeesBadge, experienceSchedule }: Props) {
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

  const isExperience = listing.category === "Experiences" || listing.property_type === "Experience";
  const isOriginal = listing.category === "Originals" || listing.property_type === "Original";
  const isService = listing.category === "Services" || listing.property_type === "Service";

  // Determine top-left badge
  let activeBadge = badgeText;
  if (!activeBadge) {
    if (isOriginal) activeBadge = "Original";
    else if (isService && listing.rating >= 4.9) activeBadge = "Popular";
    else if (isExperience) {
      const now = new Date();
      // Use experienceSchedule prop when provided, or fallback deterministically for All/Search views
      const offsetDays = experienceSchedule === "tomorrow" ? 1 : experienceSchedule === "today" ? 0 : (listing.id % 2 === 0 ? 0 : 1);
      const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
      const dayStr = targetDate.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const times = [
        "7:30 am", "8:15 am", "9:00 am", "9:45 am", "10:30 am", "11:15 am",
        "12:00 pm", "1:30 pm", "2:45 pm", "3:30 pm", "4:15 pm", "5:00 pm",
        "6:30 pm", "7:15 pm", "8:00 pm"
      ];
      // Deterministic pseudo-random selection based on ID so every card has a distinct time
      const timeIndex = Math.abs((listing.id * 7 + 3) ^ (listing.id << 1)) % times.length;
      const timeStr = times[timeIndex];
      
      activeBadge = `${dayStr}, ${dateStr} · ${timeStr}`;
    }
    else if (listing.is_guest_favorite) activeBadge = "Guest favourite";
  }

  return (
    <Link href={`/listings/${listing.id}`} className="block text-decoration-none text-inherit group relative" id={`listing-card-${listing.id}`}>
      {/* Floating include fees badge if requested */}
      {showIncludeFeesBadge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-bg-primary shadow-md border border-border px-3 py-1 rounded-pill flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
          <span className="text-primary text-sm">💎</span>
          <span>Prices include all fees</span>
        </div>
      )}

      {/* Image Carousel */}
      <div className="relative aspect-[1/0.95] rounded-2xl overflow-hidden bg-bg-secondary">
        <img
          src={images[currentImage].url}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
          }}
        />

        {/* Carousel Navigation */}
        {images.length > 1 && (
          <>
            {currentImage > 0 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 rounded-full bg-bg-primary/90 border-none cursor-pointer text-base flex items-center justify-center opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-bg-primary hover:scale-105 shadow-sm z-10 text-text-primary"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            {currentImage < images.length - 1 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-bg-primary/90 border-none cursor-pointer text-base flex items-center justify-center opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-bg-primary hover:scale-105 shadow-sm z-10 text-text-primary"
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

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {isOriginal && (
            <button
              className="w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center text-text-primary hover:scale-105 transition-transform"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              title="Share"
            >
              <svg viewBox="0 0 32 32" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M27 18v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9M16 3v18M9 10l7-7 7 7" />
              </svg>
            </button>
          )}
          <button
            className="bg-transparent border-none cursor-pointer transition-transform active:scale-90 hover:scale-110"
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
        </div>

        {/* Top Left Badge (`Guest favourite`, `Sat · 9:15 am`, `Original`) */}
        {activeBadge && (
          <div className="absolute top-3 left-3 bg-bg-primary px-3 py-1 rounded-pill text-xs font-bold shadow-sm z-10 flex items-center gap-1 text-text-primary">
            {isOriginal && <span className="text-[10px]">✎</span>}
            <span>{activeBadge}</span>
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="pt-3">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
            {isExperience || isOriginal || isService ? listing.title : formatLocation(listing.city, listing.state, listing.country)}
          </span>
          {listing.rating > 0 && (
            <span className="text-sm font-semibold text-text-primary shrink-0 flex items-center gap-1">
              ★ {formatRating(listing.rating)}
            </span>
          )}
        </div>
        <div className="text-sm text-text-secondary mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
          {isService
            ? `From ${formatPrice(listing.price_per_night, listing.country)} / ${((listing as any).max_guests ?? 0) > 5 ? "group" : "guest"}`
            : isExperience
            ? `Hosted in ${listing.city}`
            : isOriginal
            ? "Hosted by the world's most interesting people"
            : listing.title}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          {isService ? (
            <>
              {listing.rating > 0 && (
                <span className="text-sm text-text-secondary">· ★ {formatRating(listing.rating)}</span>
              )}
            </>
          ) : isExperience ? (
            <>
              <span className="text-sm font-bold text-text-primary">From {formatPrice(listing.price_per_night, listing.country)}</span>
              <span className="text-sm text-text-secondary">/ guest</span>
            </>
          ) : isOriginal ? (
            <>
              <span className="text-sm font-bold text-text-primary">{formatPrice(listing.price_per_night, listing.country)}</span>
              <span className="text-sm text-text-secondary">/ night</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-text-primary">{formatPrice(listing.price_per_night * 2, listing.country)}</span>
              <span className="text-sm text-text-secondary">for 2 nights</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
