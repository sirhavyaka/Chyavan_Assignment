"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListingCard from "@/components/home/ListingCard";
import api from "@/lib/api";
import type { ListingCard as ListingCardType, PaginatedListings } from "@/types";

interface SectionCarouselProps {
  title: string;
  subtitle?: string;
  items: ListingCardType[];
  onWishlistChange?: () => void;
  badgeOverride?: string;
  showIncludeFeesBadgeOnFirst?: boolean;
  onSeeAll?: () => void;
  experienceSchedule?: "today" | "tomorrow";
}

function SectionCarousel({
  title,
  subtitle,
  items,
  onWishlistChange,
  badgeOverride,
  showIncludeFeesBadgeOnFirst,
  onSeeAll,
  experienceSchedule,
}: SectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="py-6 border-b border-border/40 last:border-none">
      <div className="flex items-center justify-between mb-4 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto">
        <div>
          <h2
            onClick={onSeeAll}
            className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-1.5 cursor-pointer hover:underline"
          >
            <span>{title}</span>
            <span className="text-lg font-normal">➔</span>
          </h2>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:scale-105 hover:shadow-sm transition-all bg-bg-primary disabled:opacity-30 cursor-pointer"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:scale-105 hover:shadow-sm transition-all bg-bg-primary disabled:opacity-30 cursor-pointer"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto relative">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-4 -mt-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((listing, idx) => (
            <div key={listing.id} className="w-[210px] sm:w-[225px] md:w-[235px] lg:w-[242px] flex-shrink-0 snap-start">
              <ListingCard
                listing={listing}
                onWishlistChange={onWishlistChange}
                badgeText={badgeOverride}
                showIncludeFeesBadge={idx === 0 && showIncludeFeesBadgeOnFirst}
                experienceSchedule={experienceSchedule}
              />
            </div>
          ))}

          {/* See all card at the right end matching Image 2 */}
          {onSeeAll && (
            <div
              onClick={onSeeAll}
              className="w-[210px] sm:w-[225px] md:w-[235px] lg:w-[242px] flex-shrink-0 snap-start flex flex-col items-center justify-start cursor-pointer group pt-0.5"
            >
              <div className="aspect-[1/0.95] w-full rounded-2xl border border-border bg-bg-primary hover:shadow-md transition-all flex flex-col items-center justify-center p-6 shadow-sm">
                <div className="relative w-24 h-20 mb-4 flex items-center justify-center">
                  {items.slice(0, 3).map((l, i) => (
                    <div
                      key={i}
                      className={`absolute w-14 h-14 rounded-xl overflow-hidden border-2 border-bg-primary shadow-md transition-transform group-hover:scale-105 ${
                        i === 0
                          ? "-rotate-12 -translate-x-5 -translate-y-1 z-0"
                          : i === 1
                          ? "rotate-12 translate-x-5 -translate-y-1 z-10"
                          : "rotate-0 z-20 scale-105"
                      }`}
                    >
                      <img
                        src={(l as any).image_url || (l.images && l.images[0]?.url) || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <span className="text-base font-semibold text-text-primary group-hover:underline">See all</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const activeTab = searchParams.get("tab") || "all";
  const isAllView = searchParams.get("view") === "all";
  const isSearchActive =
    searchParams.has("location") ||
    searchParams.has("check_in") ||
    searchParams.has("check_out") ||
    searchParams.has("guests") ||
    category !== null ||
    isAllView;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string | number> = { page: isSearchActive ? page : 1, limit: isSearchActive ? 40 : 100 };
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
  }, [category, page, searchParams, isSearchActive]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    setPage(1);
  }, [category, searchParams]);

  // Grouped sections for exact Image 1 & 2 layout
  const goaListings = listings.filter((l) => (l.city.toLowerCase().includes("goa") || l.city.toLowerCase().includes("calangute") || l.city.toLowerCase().includes("anjuna") || l.city.toLowerCase().includes("candolim") || l.city.toLowerCase().includes("nerul") || l.city.toLowerCase().includes("ribandar") || l.city.toLowerCase().includes("baga") || l.city.toLowerCase().includes("vagator") || l.city.toLowerCase().includes("morjim")) && l.category !== "Experiences" && l.property_type !== "Experience" && l.category !== "Services" && l.property_type !== "Service" && l.category !== "Originals" && l.property_type !== "Original");
  const ootyListings = listings.filter((l) => (l.city.toLowerCase().includes("ooty") || l.city.toLowerCase().includes("ketty") || l.city.toLowerCase().includes("katteri") || l.city.toLowerCase().includes("coonoor") || l.city.toLowerCase().includes("lovedale")) && l.category !== "Experiences" && l.property_type !== "Experience" && l.category !== "Services" && l.property_type !== "Service" && l.category !== "Originals" && l.property_type !== "Original");
  const blrListings = listings.filter((l) => l.city.toLowerCase().includes("bangalore") && l.category !== "Experiences" && l.property_type !== "Experience" && l.category !== "Services" && l.property_type !== "Service" && l.category !== "Originals" && l.property_type !== "Original");
  const experienceListings = listings.filter((l) => l.category === "Experiences" || l.property_type === "Experience");
  const originalListings = listings.filter((l) => l.category === "Originals" || l.property_type === "Original");
  const serviceListings = listings.filter((l) => l.category === "Services" || l.property_type === "Service");

  // Split experiences into two groups for "Happening today" / "Happening tomorrow"
  const experiencesToday = experienceListings.slice(0, Math.ceil(experienceListings.length / 2));
  const experiencesTomorrow = experienceListings.slice(Math.ceil(experienceListings.length / 2));

  // Split services by city
  const goaServices = serviceListings.filter((l) => l.city.toLowerCase().includes("goa") || l.state.toLowerCase().includes("goa"));
  const blrServices = serviceListings.filter((l) => l.city.toLowerCase().includes("bangalore") || l.city.toLowerCase().includes("bengaluru") || l.state.toLowerCase().includes("karnataka"));

  // Fallback for rest or if not enough specific ones
  const otherHomes = listings.filter(
    (l) =>
      !goaListings.includes(l) &&
      !ootyListings.includes(l) &&
      !blrListings.includes(l) &&
      l.category !== "Experiences" &&
      l.property_type !== "Experience" &&
      l.category !== "Originals" &&
      l.property_type !== "Original" &&
      l.category !== "Services" &&
      l.property_type !== "Service"
  );

  return (
    <>
      {loading ? (
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-10">
          <div className="listing-grid">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton aspect-[1/0.95] rounded-2xl" />
                <div className="skeleton h-3.5 w-7/10" />
                <div className="skeleton h-3.5 w-1/2" />
                <div className="skeleton h-3.5 w-3/10" />
              </div>
            ))}
          </div>
        </div>
      ) : isSearchActive ? (
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-8">
          {isAllView && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {searchParams.get("location") ? `All available places in ${searchParams.get("location")}` : "All available Airbnb stays"}
                </h1>
                <p className="text-sm text-text-secondary mt-1">Showing all active listings and homes</p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="btn btn-secondary btn-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Back to featured</span>
              </button>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-20 text-text-secondary">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-2xl font-semibold mb-2 text-text-primary">
                No stays match your filters
              </h2>
              <p>Try clearing some search conditions or picking different dates.</p>
              {isAllView && (
                <button
                  onClick={() => router.push("/")}
                  className="btn btn-primary mt-6 px-6 py-2"
                >
                  Back to Homepage
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onWishlistChange={fetchListings} />
                ))}
              </div>

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
      ) : activeTab === "experiences" ? (
        <div className="pb-12 pt-2">
          <SectionCarousel
            title="Happening today"
            items={experiencesToday.length > 0 ? experiencesToday : listings.slice(0, 11)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all")}
            experienceSchedule="today"
          />
          <SectionCarousel
            title="Happening tomorrow"
            items={experiencesTomorrow.length > 0 ? experiencesTomorrow : listings.slice(11, 22)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all")}
            experienceSchedule="tomorrow"
          />
        </div>
      ) : activeTab === "services" ? (
        <div className="pb-12 pt-2">
          <div className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto pt-4 pb-2">
            <h1 className="text-3xl font-bold text-text-primary">Discover services on Airbnb</h1>
          </div>
          <SectionCarousel
            title="Services in South Goa"
            items={goaServices.length > 0 ? goaServices : listings.slice(0, 11)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all")}
          />
          <SectionCarousel
            title="Services in Bengaluru"
            items={blrServices.length > 0 ? blrServices : listings.slice(11, 22)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all")}
          />
        </div>
      ) : (
        /* Default `All` or `Homes` matching Image 1 & 2 EXACTLY: 2-3 popular destinations with 7 hotels/homes each initially + See all card right end */
        <div className="pb-12 pt-2">
          <SectionCarousel
            title="Popular homes in North Goa"
            items={goaListings.length > 0 ? goaListings : listings.slice(0, 11)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all&location=Goa")}
          />

          <SectionCarousel
            title="Available in Ooty this weekend"
            items={ootyListings.length > 0 ? ootyListings : listings.slice(11, 22)}
            onWishlistChange={fetchListings}
            showIncludeFeesBadgeOnFirst={true}
            onSeeAll={() => router.push("/?view=all&location=Ooty")}
          />

          <SectionCarousel
            title="Popular stays in Bangalore"
            items={blrListings.length > 0 ? blrListings : otherHomes.slice(0, 11)}
            onWishlistChange={fetchListings}
            onSeeAll={() => router.push("/?view=all&location=Bangalore")}
          />
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 pt-10 text-center">
          <div className="skeleton h-10 w-48 mx-auto" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
