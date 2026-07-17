"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { CATEGORIES } from "@/types";

interface AmenityOption {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export default function CreateListingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Entire home");
  const [category, setCategory] = useState("Beach");
  const [pricePerNight, setPricePerNight] = useState("150");
  const [cleaningFee, setCleaningFee] = useState("50");
  const [serviceFeePercent, setServiceFeePercent] = useState("14");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [address, setAddress] = useState("");
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  ]);
  const [availableAmenities, setAvailableAmenities] = useState<AmenityOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    // Fetch seeded amenities list
    api.getAmenities().then((data: AmenityOption[]) => {
      setAvailableAmenities(data);
      if (data.length > 0 && selectedAmenities.length === 0) {
        setSelectedAmenities(data.slice(0, 4).map((a) => a.id));
      }
    }).catch(console.error);
  }, [isAuthenticated, authLoading, router]);

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleImageChange = (index: number, val: string) => {
    const next = [...imageUrls];
    next[index] = val;
    setImageUrls(next);
  };

  const addImageField = () => {
    if (imageUrls.length < 10) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !city || !country || !address) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      const validImages = imageUrls
        .filter((url) => url.trim() !== "")
        .map((url, i) => ({ url: url.trim(), caption: `Photo ${i + 1}`, display_order: i }));

      const res = await api.createListing({
        title,
        description,
        property_type: propertyType,
        category,
        price_per_night: Number(pricePerNight),
        cleaning_fee: Number(cleaningFee),
        service_fee_percent: Number(serviceFeePercent),
        city,
        state,
        country,
        address,
        max_guests: maxGuests,
        bedrooms,
        beds,
        bathrooms,
        amenity_ids: selectedAmenities,
        images: validImages.length > 0 ? validImages : [
          { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200", caption: "Photo 1", display_order: 0 }
        ],
      });
      showToast("Listing created successfully! 🎉", "success");
      router.push(`/listings/${res.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create listing";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container pt-12">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="skeleton h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-[800px] mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold py-2 mb-4 bg-transparent border-none cursor-pointer hover:underline text-text-primary">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-2">Stayscape your place</h1>
      <p className="text-text-secondary mb-8">Share basic details about your space to start welcoming guests.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-bg-primary border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Basic Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">1. Basic Information</h2>
          <div className="input-group">
            <label>Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Sunny Beachfront Villa with Private Pool"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Description *</label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Describe your property, its vibe, unique features, and neighborhood..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label>Property Type</label>
              <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="Entire home">Entire home</option>
                <option value="Private room">Private room</option>
                <option value="Cabin">Cabin</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Treehouse">Treehouse</option>
              </select>
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">2. Pricing ($ USD)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="input-group">
              <label>Price per night *</label>
              <input
                type="number"
                min="10"
                className="input"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Cleaning fee</label>
              <input
                type="number"
                min="0"
                className="input"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Service fee (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                className="input"
                value={serviceFeePercent}
                onChange={(e) => setServiceFeePercent(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">3. Location</h2>
          <div className="input-group">
            <label>Street Address *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 123 Ocean Drive"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="input-group">
              <label>City *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Malibu"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>State / Province</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Country *</label>
              <input
                type="text"
                className="input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Capacity */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">4. Capacity & Rooms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="input-group">
              <label>Max Guests</label>
              <input type="number" min="1" max="20" className="input" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Bedrooms</label>
              <input type="number" min="0" max="15" className="input" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Beds</label>
              <input type="number" min="1" max="20" className="input" value={beds} onChange={(e) => setBeds(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Bathrooms</label>
              <input type="number" step="0.5" min="0.5" max="10" className="input" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">5. Amenities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableAmenities.map((amenity) => {
              const selected = selectedAmenities.includes(amenity.id);
              return (
                <button
                  type="button"
                  key={amenity.id}
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                    selected ? "border-text-primary bg-bg-secondary font-semibold" : "border-border bg-bg-primary hover:border-border-dark"
                  }`}
                >
                  <span className="text-xl">{amenity.icon}</span>
                  <span className="text-sm flex-1">{amenity.name}</span>
                  {selected && <span className="text-primary font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">6. Photos (Image URLs)</h2>
          <p className="text-xs text-text-secondary mb-4">Provide clear photo URLs for your listing. The first image will be your main cover photo.</p>
          <div className="flex flex-col gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-xs font-bold w-6 text-center text-text-secondary">{index + 1}</span>
                <input
                  type="url"
                  className="input flex-1"
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => removeImageField(index)} className="btn btn-outline btn-sm text-[#C62828] border-border">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {imageUrls.length < 10 && (
            <button type="button" onClick={addImageField} className="btn btn-secondary btn-sm mt-3 self-start">
              + Add another photo
            </button>
          )}
        </section>

        <div className="pt-6 border-t border-border flex justify-end gap-4">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
