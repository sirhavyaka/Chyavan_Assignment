"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { ListingDetail } from "@/types";
import { formatPrice, formatDate, calculateNights, pluralize, formatRating } from "@/lib/utils";

function BookingContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = parseInt(searchParams.get("guests") || "1");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    api.getListing(Number(id)).then(setListing).catch(console.error).finally(() => setLoading(false));
  }, [id, isAuthenticated, router]);

  if (loading || !listing) {
    return (
      <div className="container pt-12">
        <div className="skeleton h-8 w-2/5 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <div className="skeleton h-[400px]" />
          <div className="skeleton h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const nights = calculateNights(checkIn, checkOut);
  const nightlyTotal = listing.price_per_night * nights;
  const cleaningFee = listing.cleaning_fee;
  const serviceFee = Math.round(nightlyTotal * (listing.service_fee_percent / 100));
  const totalPrice = nightlyTotal + cleaningFee + serviceFee;

  const handleBook = async () => {
    setBooking(true);
    try {
      await api.createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      setConfirmed(true);
      showToast("Booking confirmed! 🎉", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking failed";
      showToast(msg, "error");
    } finally {
      setBooking(false);
    }
  };

  if (confirmed) {
    return (
      <div className="container py-20 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-text-secondary mb-8">
          Your reservation has been confirmed. Get ready for an amazing stay!
        </p>
        <div className="max-w-[480px] mx-auto border border-border rounded-xl overflow-hidden text-left shadow-sm">
          <img src={listing.images[0]?.url} alt={listing.title} className="w-full h-[200px] object-cover" />
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-1">{listing.title}</h3>
            <p className="text-sm text-text-secondary mb-4">{listing.city}, {listing.country}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <strong className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Check-in</strong>
                <span className="text-sm font-semibold">{formatDate(checkIn)}</span>
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Check-out</strong>
                <span className="text-sm font-semibold">{formatDate(checkOut)}</span>
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Guests</strong>
                <span className="text-sm font-semibold">{guests} {pluralize(guests, "guest")}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border text-base">
              <span>Total</span>
              <strong className="font-bold">{formatPrice(totalPrice)}</strong>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/trips" className="btn btn-primary">View My Trips</Link>
          <Link href="/" className="btn btn-secondary">Continue Exploring</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold py-2 mb-4 bg-transparent border-none cursor-pointer hover:underline text-text-primary">
        ← Back
      </button>
      <h1 className="text-3xl font-semibold mb-8">Confirm and pay</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
        {/* Left - Trip details */}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold mb-5">Your trip</h2>

          <div className="flex justify-between items-center mb-4">
            <div>
              <strong className="block text-base">Dates</strong>
              <p className="text-sm text-text-secondary mt-1">{formatDate(checkIn)} – {formatDate(checkOut)}</p>
            </div>
            <Link href={`/listings/${listing.id}`} className="text-sm font-semibold underline">Edit</Link>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <strong className="block text-base">Guests</strong>
              <p className="text-sm text-text-secondary mt-1">{guests} {pluralize(guests, "guest")}</p>
            </div>
            <Link href={`/listings/${listing.id}`} className="text-sm font-semibold underline">Edit</Link>
          </div>

          <hr className="divider" />

          {/* Mocked payment section */}
          <h2 className="text-xl font-semibold mb-5">Pay with</h2>
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-4 font-semibold">
              <span className="text-2xl">💳</span>
              <span>Credit or debit card</span>
            </div>
            <div className="flex flex-col gap-3">
              <input className="input" placeholder="Card number" defaultValue="•••• •••• •••• 4242" disabled />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Expiration" defaultValue="12/28" disabled />
                <input className="input" placeholder="CVV" defaultValue="•••" disabled />
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              This is a demo — no real payment will be processed.
            </p>
          </div>

          <hr className="divider" />

          <h2 className="text-xl font-semibold mb-5">Cancellation policy</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Free cancellation before check-in. Cancel before check-in for a full refund.
            After that, the first night is non-refundable.
          </p>

          <hr className="divider" />

          <p className="text-xs text-text-secondary leading-relaxed mb-6">
            By selecting the button below, I agree to the Host&apos;s House Rules, Ground rules for guests, and Stayscape&apos;s Rebooking and Refund Policy.
          </p>

          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleBook}
            disabled={booking}
          >
            {booking ? "Processing..." : `Confirm and pay · ${formatPrice(totalPrice)}`}
          </button>
        </div>

        {/* Right - Listing summary */}
        <div className="border border-border rounded-xl p-6 sticky top-[calc(var(--header-height)+24px)] bg-bg-primary shadow-card">
          <div className="flex gap-4">
            <img src={listing.images[0]?.url} alt={listing.title} className="w-30 h-25 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">{listing.property_type}</p>
              <h3 className="text-sm font-semibold my-1 overflow-hidden text-ellipsis whitespace-nowrap">{listing.title}</h3>
              {listing.rating > 0 && (
                <p className="text-xs text-text-secondary">
                  ★ {formatRating(listing.rating)} ({listing.review_count} {pluralize(listing.review_count, "review")})
                </p>
              )}
            </div>
          </div>

          <hr className="divider" />

          <h3 className="text-xl font-semibold mb-4">Price details</h3>
          <div className="flex justify-between text-base mb-3">
            <span>{formatPrice(listing.price_per_night)} × {nights} {pluralize(nights, "night")}</span>
            <span>{formatPrice(nightlyTotal)}</span>
          </div>
          <div className="flex justify-between text-base mb-3">
            <span>Cleaning fee</span>
            <span>{formatPrice(cleaningFee)}</span>
          </div>
          <div className="flex justify-between text-base mb-3">
            <span>Stayscape service fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <hr className="divider" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total (USD)</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="container pt-20 text-center">
        <div className="skeleton h-8 w-48 mx-auto" />
      </div>
    }>
      <BookingContent id={id} />
    </Suspense>
  );
}
