"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CategoryBar from "@/components/home/CategoryBar";
import ListingCard from "@/components/home/ListingCard";
import api from "@/lib/api";
import type { ListingCard as ListingCardType, PaginatedListings } from "@/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string | number> = { page, limit: 20 };
      if (category) filters.category = category;

      const location = searchParams.get("location");
      const checkIn = searchParams.get("check_in");
      const checkOut = searchParams.get("check_out");
      const guests = searchParams.get("guests");

      if (location) filters.location = location;
      if (checkIn) filters.check_in = checkIn;
      if (checkOut) filters.check_out = checkOut;
      if (guests) filters.guests = parseInt(guests);

      const data: PaginatedListings = await api.getListings(filters);
      setListings(data.items);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [category, page, searchParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    setPage(1);
  }, [category, searchParams]);

  return (
    <>
      <CategoryBar activeCategory={category} onSelect={(c) => setCategory(c)} />

      <div className="container-wide py-6">
        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton aspect-[1/0.95] rounded-xl" />
                <div className="skeleton h-3.5 w-7/10" />
                <div className="skeleton h-3.5 w-1/2" />
                <div className="skeleton h-3.5 w-3/10" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold mb-2 text-text-primary">
              No listings found
            </h2>
            <p>Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <>
            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onWishlistChange={fetchListings} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 pb-6">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm font-semibold">
                  Page {page} of {totalPages} · {total} stays
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="container-wide pt-24 text-center">
        <div className="skeleton h-10 w-48 mx-auto" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
