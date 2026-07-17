"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import type { Booking, ListingCard } from "@/types";
import { formatPrice, formatDate, formatRating } from "@/lib/utils";

export default function HostDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      Promise.all([
        api.getListings({ limit: 100 }),
        api.getHostBookings(),
      ]).then(([listingsData, bookingsData]) => {
        setListings(listingsData.items.filter(l => l.host.id === user?.id));
        setBookings(bookingsData);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router, user?.id]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing? This action cannot be undone.")) return;
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showToast("Listing deleted", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showToast(msg, "error");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container pt-12">
        <div className="skeleton h-8 w-72 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-30 mb-4 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0]}</h1>
          {user?.is_superhost && <span className="badge badge-superhost">⭐ Superhost</span>}
        </div>
        <Link href="/hosting/create" className="btn btn-primary">
          + Create a listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 gap-8">
        <button
          className={`pb-3 border-b-2 font-semibold text-base cursor-pointer bg-transparent transition-all duration-150 ${
            tab === "listings" ? "border-text-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setTab("listings")}
        >
          Your listings ({listings.length})
        </button>
        <button
          className={`pb-3 border-b-2 font-semibold text-base cursor-pointer bg-transparent transition-all duration-150 ${
            tab === "bookings" ? "border-text-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setTab("bookings")}
        >
          Reservations ({bookings.length})
        </button>
      </div>

      {tab === "listings" && (
        <>
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
              <p className="text-text-secondary mb-6">
                Start hosting by creating your first listing.
              </p>
              <Link href="/hosting/create" className="btn btn-primary">Create a listing</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 p-5 border border-border rounded-xl transition-shadow hover:shadow-card-hover bg-bg-primary">
                  <div className="flex items-center gap-4 min-w-0">
                    <Link href={`/listings/${listing.id}`} className="shrink-0">
                      <img src={listing.images[0]?.url} alt={listing.title} className="w-28 h-20 object-cover rounded-lg" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/listings/${listing.id}`}>
                        <h3 className="text-base font-semibold text-text-primary hover:underline overflow-hidden text-ellipsis whitespace-nowrap">{listing.title}</h3>
                      </Link>
                      <p className="text-sm text-text-secondary mb-1">{listing.city}, {listing.country}</p>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{formatPrice(listing.price_per_night)}/night</span>
                        {listing.rating > 0 && <span>★ {formatRating(listing.rating)} ({listing.review_count})</span>}
                        <span>{listing.property_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                    <Link href={`/hosting/edit/${listing.id}`} className="btn btn-secondary btn-sm">
                      Edit
                    </Link>
                    <button className="btn btn-ghost btn-sm text-[#C62828] hover:bg-[#FFEBEE]" onClick={() => handleDelete(listing.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "bookings" && (
        <>
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="text-xl font-semibold mb-2 text-text-primary">No reservations yet</h2>
              <p>Your upcoming and past reservations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl">
              <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 p-4 bg-bg-secondary border-b border-border text-xs font-bold uppercase tracking-wider text-text-secondary min-w-[600px]">
                <span>Guest</span>
                <span>Listing</span>
                <span>Dates</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {bookings.map((booking) => (
                <div key={booking.id} className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 p-4 items-center border-b border-border last:border-b-0 text-sm min-w-[600px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={booking.guest.avatar_url} alt={booking.guest.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{booking.guest.name}</span>
                  </div>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">{booking.listing.title}</span>
                  <span className="text-text-secondary text-xs">{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</span>
                  <span className="font-semibold">{formatPrice(booking.total_price)}</span>
                  <div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-pill ${
                      booking.status === "confirmed" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                      booking.status === "cancelled" ? "bg-[#FFEBEE] text-[#C62828]" :
                      "bg-bg-secondary text-text-secondary"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
