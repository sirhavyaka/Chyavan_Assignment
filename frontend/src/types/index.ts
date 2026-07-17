/* ================================================
   TypeScript interfaces matching backend schemas
   ================================================ */

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
  bio: string;
  is_superhost: boolean;
  created_at: string;
}

export interface UserBrief {
  id: number;
  name: string;
  avatar_url: string;
  is_superhost: boolean;
}

export interface ListingImage {
  id: number;
  url: string;
  caption: string;
  display_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  state: string;
  country: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  category: string;
  property_type: string;
  is_guest_favorite: boolean;
  images: ListingImage[];
  host: UserBrief;
  is_wishlisted: boolean;
}

export interface ListingDetail extends ListingCard {
  description: string;
  cleaning_fee: number;
  service_fee_percent: number;
  address: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: Amenity[];
  created_at: string;
}

export interface PaginatedListings {
  items: ListingCard[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  listing: ListingCard;
  guest: UserBrief;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  cleanliness: number;
  accuracy: number;
  check_in_rating: number;
  communication: number;
  location_rating: number;
  value: number;
  comment: string;
  created_at: string;
  user: UserBrief;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SearchFilters {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  category?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  amenities?: string;
  page?: number;
  limit?: number;
}

export interface BookingCreate {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface ListingCreate {
  title: string;
  description: string;
  property_type: string;
  category: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenity_ids: number[];
  images: { url: string; caption: string; display_order: number }[];
}

export interface ReviewCreate {
  listing_id: number;
  booking_id?: number;
  rating: number;
  cleanliness: number;
  accuracy: number;
  check_in_rating: number;
  communication: number;
  location_rating: number;
  value: number;
  comment: string;
}

export interface DateRange {
  check_in: string | null;
  check_out: string | null;
}

export interface BookedDateRange {
  check_in: string;
  check_out: string;
}

export const CATEGORIES = [
  { name: "Beach", icon: "🏖️" },
  { name: "Cabins", icon: "🏠" },
  { name: "Countryside", icon: "🌾" },
  { name: "Design", icon: "🎨" },
  { name: "Amazing views", icon: "🏔️" },
  { name: "Lakefront", icon: "🛶" },
  { name: "Treehouses", icon: "🌳" },
  { name: "Desert", icon: "🏜️" },
  { name: "Tiny homes", icon: "🏡" },
  { name: "Tropical", icon: "🌴" },
  { name: "Vineyards", icon: "🍷" },
  { name: "Skiing", icon: "⛷️" },
  { name: "Pools", icon: "🏊" },
  { name: "Trending", icon: "🔥" },
  { name: "Mansions", icon: "🏰" },
  { name: "Islands", icon: "🏝️" },
];

export const PROPERTY_TYPES = [
  "Entire home",
  "Private room",
  "Shared room",
];
