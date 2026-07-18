import React from "react";
import Link from "next/link";

export default function Footer() {
  const getawayItems = [
    { city: "Cleveland", type: "Monthly Rentals" },
    { city: "Portland", type: "Monthly Rentals" },
    { city: "Minneapolis", type: "Monthly Rentals" },
    { city: "Branson", type: "Holiday rentals" },
    { city: "Tokyo", type: "House rentals" },
    { city: "Brooklyn", type: "House rentals" },
    { city: "Chicago", type: "House rentals" },
    { city: "Wilmington", type: "House rentals" },
    { city: "Key West", type: "Holiday rentals" },
    { city: "San Juan", type: "House rentals" },
    { city: "Pocono Mountains", type: "Villa rentals" },
    { city: "Miramar Beach", type: "Apartment rentals" },
    { city: "Florida Keys", type: "Apartment rentals" },
    { city: "Destin", type: "Holiday rentals" },
    { city: "North Myrtle Beach", type: "Villa rentals" },
    { city: "Portland", type: "Cabin rentals" },
    { city: "Nice", type: "House rentals" },
  ];

  return (
    <footer className="bg-bg-secondary border-t border-border mt-16 text-text-primary">
      <div className="max-w-[1760px] mx-auto pt-12 pb-6 px-6 md:px-10 lg:px-20">
        {/* Inspiration for future getaways (Image 3) */}
        <div className="pb-12 border-b border-border">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-text-primary tracking-tight">Inspiration for future getaways</h2>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 md:gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-none text-sm font-semibold">
            <button className="pb-3 border-b-2 border-text-primary text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Popular
            </button>
            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Arts &amp; culture
            </button>
            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Beach
            </button>
            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Mountains
            </button>
            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Outdoors
            </button>
            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer bg-transparent">
              Things to do
            </button>
          </div>

          {/* Grid of destinations matching Image 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-6">
            {getawayItems.map((item, index) => (
              <div key={index} className="flex flex-col cursor-pointer group">
                <span className="text-sm font-bold text-text-primary group-hover:underline">{item.city}</span>
                <span className="text-xs text-text-secondary">{item.type}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-sm font-bold text-text-primary cursor-pointer hover:underline self-start pt-0.5">
              <span>Show more</span>
              <span className="text-xs">∨</span>
            </div>
          </div>
        </div>

        {/* 3 Columns: Support, Hosting, Airbnb matching Image 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-b border-border text-sm">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-text-primary mb-1">Support</h4>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Help Centre</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Get help with a safety issue</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">AirCover</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Anti-discrimination</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Disability support</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Cancellation options</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-text-primary mb-1">Hosting</h4>
            <Link href="/hosting" className="text-text-primary hover:underline transition-colors">Airbnb your home</Link>
            <Link href="/hosting" className="text-text-primary hover:underline transition-colors">Airbnb your experience</Link>
            <Link href="/hosting" className="text-text-primary hover:underline transition-colors">Airbnb your service</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">AirCover for Hosts</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Hosting resources</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Community forum</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-text-primary mb-1">Airbnb</h4>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Newsroom</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">2026 Summer Release</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Careers</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Investors</Link>
            <Link href="#" className="text-text-primary hover:underline transition-colors">Airbnb.org emergency stays</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 text-sm text-text-primary gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <Link href="#" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="#" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="#" className="hover:underline">Sitemap</Link>
            <span>·</span>
            <Link href="#" className="hover:underline">Company details</Link>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <button className="flex items-center gap-2 hover:underline bg-transparent border-none cursor-pointer text-text-primary">
              <span>🌐</span>
              <span>English (IN)</span>
            </button>
            <button className="hover:underline bg-transparent border-none cursor-pointer text-text-primary">
              <span>₹ INR</span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <span className="cursor-pointer hover:opacity-75">f</span>
              <span className="cursor-pointer hover:opacity-75">𝕏</span>
              <span className="cursor-pointer hover:opacity-75">📸</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
