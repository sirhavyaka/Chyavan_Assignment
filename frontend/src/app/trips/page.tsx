"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import type { Booking } from "@/types";
import { formatPrice, formatDate, pluralize } from "@/lib/utils";

export default function TripsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      api.getMyTrips().then(setTrips).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.cancelBooking(bookingId);
      setTrips((prev) =>
        prev.map((t) => (t.id === bookingId ? { ...t, status: "cancelled" } : t))
      );
      showToast("Booking cancelled", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel";
      showToast(msg, "error");
    }
  };

  const upcoming = trips.filter((t) => t.status === "confirmed" && new Date(t.check_in) >= new Date());
  const past = trips.filter((t) => t.status === "completed" || (t.status === "confirmed" && new Date(t.check_in) < new Date()));
  const cancelled = trips.filter((t) => t.status === "cancelled");

  if (loading || authLoading) {
    return (
      <div className="container pt-12">
        <div className="skeleton h-8 w-48 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-30 mb-4 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Trips</h1>

      {trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✈️</div>
          <h2 className="text-xl font-semibold mb-2">No trips booked...yet!</h2>
          <p className="text-text-secondary mb-6">Time to dust off your bags and start planning your next adventure.</p>
          <Link href="/" className="btn btn-primary">Start searching</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
              {upcoming.map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 p-5 border border-border rounded-xl mb-3 transition-shadow hover:shadow-card-hover bg-bg-primary">
                  <Link href={`/listings/${trip.listing.id}`} className="shrink-0">
                    <img src={trip.listing.images[0]?.url} alt={trip.listing.title} className="w-full sm:w-35 h-40 sm:h-25 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${trip.listing.id}`}>
                      <h3 className="text-base font-semibold mb-1 text-text-primary hover:underline">{trip.listing.title}</h3>
                    </Link>
                    <p className="text-sm text-text-secondary mb-1">{trip.listing.city}, {trip.listing.country}</p>
                    <p className="text-sm text-text-secondary">
                      {formatDate(trip.check_in)} → {formatDate(trip.check_out)} · {trip.guests} {pluralize(trip.guests, "guest")}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(trip.total_price)}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-pill bg-[#E8F5E9] text-[#2E7D32]">Confirmed</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(trip.id)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Past trips</h2>
              {past.map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 p-5 border border-border rounded-xl mb-3 transition-shadow hover:shadow-card-hover bg-bg-primary opacity-70">
                  <Link href={`/listings/${trip.listing.id}`} className="shrink-0">
                    <img src={trip.listing.images[0]?.url} alt={trip.listing.title} className="w-full sm:w-35 h-40 sm:h-25 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${trip.listing.id}`}>
                      <h3 className="text-base font-semibold mb-1 text-text-primary hover:underline">{trip.listing.title}</h3>
                    </Link>
                    <p className="text-sm text-text-secondary mb-1">{trip.listing.city}, {trip.listing.country}</p>
                    <p className="text-sm text-text-secondary">
                      {formatDate(trip.check_in)} → {formatDate(trip.check_out)}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(trip.total_price)}</p>
                  </div>
                  <div className="flex items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-pill bg-bg-secondary text-text-secondary">Completed</span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {cancelled.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Cancelled</h2>
              {cancelled.map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 p-5 border border-border rounded-xl mb-3 transition-shadow hover:shadow-card-hover bg-bg-primary opacity-50">
                  <Link href={`/listings/${trip.listing.id}`} className="shrink-0">
                    <img src={trip.listing.images[0]?.url} alt={trip.listing.title} className="w-full sm:w-35 h-40 sm:h-25 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${trip.listing.id}`}>
                      <h3 className="text-base font-semibold mb-1 text-text-primary hover:underline">{trip.listing.title}</h3>
                    </Link>
                    <p className="text-sm text-text-secondary mb-1">{trip.listing.city}, {trip.listing.country}</p>
                    <p className="text-sm text-text-secondary">{formatDate(trip.check_in)} → {formatDate(trip.check_out)}</p>
                  </div>
                  <div className="flex items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-pill bg-[#FFEBEE] text-[#C62828]">Cancelled</span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
