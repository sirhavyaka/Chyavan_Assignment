"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { ListingCard as ListingCardType } from "@/types";
import ListingCard from "@/components/home/ListingCard";

export default function WishlistsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlists = async () => {
    try {
      const data = await api.getWishlists();
      setWishlists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) fetchWishlists();
  }, [isAuthenticated, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="container pt-12">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="listing-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[1/0.95] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <h1 className="text-3xl font-bold mb-8 text-text-primary">Wishlists</h1>

      {wishlists.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-xl font-semibold mb-2 text-text-primary">Create your first wishlist</h2>
          <p className="text-text-secondary mb-6">
            As you search, tap the heart icon to save your favorite places and experiences.
          </p>
          <Link href="/" className="btn btn-primary">Start exploring</Link>
        </div>
      ) : (
        <div className="listing-grid">
          {wishlists.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onWishlistChange={fetchWishlists} />
          ))}
        </div>
      )}
    </div>
  );
}
