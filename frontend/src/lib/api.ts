/* ================================================
   API Client — Fetch wrapper for backend calls
   ================================================ */

import type {
  TokenResponse, User, ListingDetail, PaginatedListings,
  Booking, Review, ListingCard, SearchFilters, BookingCreate,
  ListingCreate, ReviewCreate, Amenity, BookedDateRange,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private headers(includeAuth = true): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (includeAuth) {
      const token = this.getToken();
      if (token) h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...this.headers(), ...(options.headers || {}) },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ---- Auth ----
  async register(email: string, name: string, password: string): Promise<TokenResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request("/api/auth/me");
  }

  // ---- Listings ----
  async getListings(filters: SearchFilters = {}): Promise<PaginatedListings> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    });
    return this.request(`/api/listings?${params.toString()}`);
  }

  async getListing(id: number): Promise<ListingDetail> {
    return this.request(`/api/listings/${id}`);
  }

  async getListingAvailability(id: number): Promise<BookedDateRange[]> {
    return this.request(`/api/listings/${id}/availability`);
  }

  async createListing(data: ListingCreate): Promise<ListingDetail> {
    return this.request("/api/listings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateListing(id: number, data: Partial<ListingCreate>): Promise<ListingDetail> {
    return this.request(`/api/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteListing(id: number): Promise<void> {
    return this.request(`/api/listings/${id}`, { method: "DELETE" });
  }

  async getAmenities(): Promise<Amenity[]> {
    return this.request("/api/listings/amenities");
  }

  // ---- Bookings ----
  async createBooking(data: BookingCreate): Promise<Booking> {
    return this.request("/api/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyTrips(): Promise<Booking[]> {
    return this.request("/api/bookings/my-trips");
  }

  async getHostBookings(): Promise<Booking[]> {
    return this.request("/api/bookings/host-bookings");
  }

  async cancelBooking(id: number): Promise<Booking> {
    return this.request(`/api/bookings/${id}/cancel`, { method: "PATCH" });
  }

  // ---- Reviews ----
  async createReview(data: ReviewCreate): Promise<Review> {
    return this.request("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getListingReviews(listingId: number): Promise<Review[]> {
    return this.request(`/api/reviews/listing/${listingId}`);
  }

  // ---- Wishlists ----
  async toggleWishlist(listingId: number): Promise<{ wishlisted: boolean }> {
    return this.request("/api/wishlists/toggle", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  async getWishlists(): Promise<ListingCard[]> {
    return this.request("/api/wishlists");
  }
}

const api = new ApiClient();
export default api;
