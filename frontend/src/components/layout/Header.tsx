"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function HeaderContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globeMenuOpen, setGlobeMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchGuests, setSearchGuests] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "all";
  const isHome = pathname === "/";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchLocation) params.set("location", searchLocation);
    else params.delete("location");
    if (searchCheckIn) params.set("check_in", searchCheckIn);
    if (searchCheckOut) params.set("check_out", searchCheckOut);
    if (searchGuests) params.set("guests", searchGuests);
    router.push(`/?${params.toString()}`);
    setSearchOpen(false);
  };

  const handleTabClick = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("tab");
    else params.set("tab", tab);
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary border-b border-border transition-all">
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-4 flex flex-col gap-4">
        {/* Row 1: Logo, Main Tabs, User Menu */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-decoration-none shrink-0">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <span className="hidden sm:inline text-[22px] font-bold text-primary" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.5px' }}>airbnb</span>
          </Link>

          {/* Center Category Tabs (`All`, `Homes`, `Experiences`, `Services`) matching Image 4 & 5 */}
          <div className="flex items-center gap-6 md:gap-8 border-b-0">
            <button
              onClick={() => handleTabClick("all")}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-colors bg-transparent cursor-pointer ${
                activeTab === "all" ? "border-text-primary text-text-primary font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="text-lg">🌍</span>
              <span>All</span>
            </button>
            <button
              onClick={() => handleTabClick("homes")}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-colors bg-transparent cursor-pointer ${
                activeTab === "homes" ? "border-text-primary text-text-primary font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="text-lg">🏠</span>
              <span>Homes</span>
            </button>
            <button
              onClick={() => handleTabClick("experiences")}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-colors bg-transparent cursor-pointer ${
                activeTab === "experiences" ? "border-text-primary text-text-primary font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="text-lg">🎈</span>
              <span>Experiences</span>
            </button>
            <button
              onClick={() => handleTabClick("services")}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-colors bg-transparent cursor-pointer ${
                activeTab === "services" ? "border-text-primary text-text-primary font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="text-lg">🛎️</span>
              <span>Services</span>
            </button>
          </div>

          {/* Right Area: Become a host, globe, User menu */}
          <div className="flex items-center gap-3 relative shrink-0" ref={menuRef}>
            <Link href="/hosting" className="hidden lg:block text-sm font-semibold py-2.5 px-3.5 rounded-pill transition-colors hover:bg-bg-secondary text-text-primary">
              Become a host
            </Link>
            <button 
              onClick={() => setGlobeMenuOpen(true)}
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-bg-secondary transition-colors text-text-primary cursor-pointer"
            >
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
                <path d="M16 1C7.71 1 1 7.71 1 16s6.71 15 15 15 15-6.71 15-15S24.29 1 16 1zm11.93 13h-4.08c-.28-3.04-1.29-5.83-2.88-8.13 3.32 1.48 5.86 4.45 6.96 8.13zM16 3.03c1.78 2.29 3 5.3 3.38 8.97h-6.76c.38-3.67 1.6-6.68 3.38-8.97zM4.07 14h4.08c.28-3.04 1.29-5.83 2.88-8.13-3.32 1.48-5.86 4.45-6.96 8.13zM4.07 18c1.1 3.68 3.64 6.65 6.96 8.13-1.59-2.3-2.6-5.09-2.88-8.13H4.07zm9.85 10.97c-1.78-2.29-3-5.3-3.38-8.97h6.76c-.38 3.67-1.6 6.68-3.38 8.97zM18.99 18H13.01c-.13-1.32-.2-2.65-.2-4s.07-2.68.2-4h5.98c.13 1.32.2 2.65.2 4s-.07 2.68-.2 4zm1.96 8.13c1.59-2.3 2.6-5.09 2.88-8.13h4.08c-1.1 3.68-3.64 6.65-6.96 8.13z" />
              </svg>
            </button>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-bg-secondary transition-all text-text-primary cursor-pointer active:scale-95 shrink-0"
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500 transition-transform duration-300 rotate-90 hover:rotate-180">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="flex items-center gap-2 py-1 pr-1 pl-3 border border-border rounded-pill bg-bg-primary cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setMenuOpen(!menuOpen)}
              id="user-menu-button"
            >
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
                <path d="M4 7h24v2H4zm0 8h24v2H4zm0 8h24v2H4z" />
              </svg>
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center shrink-0">
                {user ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#717171">
                    <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-3.02 5.49 12.43 12.43 0 0 1 6.45 4.4A12.56 12.56 0 0 1 16 28.7z" />
                  </svg>
                )}
              </div>
            </button>

            {menuOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 min-w-[240px] bg-bg-primary rounded-xl shadow-xl border border-border py-2 animate-fadeIn z-[200]">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 flex flex-col gap-0.5">
                      <strong className="text-sm font-semibold">{user?.name}</strong>
                      <span className="text-xs text-text-secondary">{user?.email}</span>
                    </div>
                    <hr className="border-0 border-t border-border my-1" />
                    <Link href="/trips" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Trips
                    </Link>
                    <Link href="/wishlists" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Wishlists
                    </Link>
                    <hr className="border-0 border-t border-border my-1" />
                    <Link href="/hosting" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Manage listings
                    </Link>
                    <Link href="/hosting/create" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Create a listing
                    </Link>
                    <hr className="border-0 border-t border-border my-1" />
                    <button
                      className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors cursor-pointer bg-transparent border-none"
                      onClick={() => { logout(); setMenuOpen(false); }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block w-full px-4 py-2.5 text-sm text-text-primary font-semibold text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Log in
                    </Link>
                    <Link href="/login?mode=register" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Search Bar Pill (Where | When | Who) matching Image 4 & 5 */}
        {isHome && (
          <div ref={searchRef} className="flex justify-center pb-2">
            {!searchOpen ? (
              <button
                className="flex items-center justify-between border border-border shadow-sm hover:shadow-md transition-all rounded-pill py-2 pl-6 pr-2 bg-bg-primary max-w-[700px] w-full cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <div className="flex items-center justify-between flex-1 pr-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-text-primary">Where</span>
                    <span className="text-sm text-text-secondary truncate">{searchLocation || "Search destinations"}</span>
                  </div>
                  <span className="w-px h-8 bg-border mx-4" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-text-primary">When</span>
                    <span className="text-sm text-text-secondary truncate">{searchCheckIn && searchCheckOut ? `${searchCheckIn} - ${searchCheckOut}` : "Add dates"}</span>
                  </div>
                  <span className="w-px h-8 bg-border mx-4" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-text-primary">Who</span>
                    <span className="text-sm text-text-secondary truncate">{searchGuests ? `${searchGuests} guests` : "Add guests"}</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0 shadow-md hover:bg-[#D70466] transition-colors">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="19" y1="19" x2="28" y2="28" />
                  </svg>
                </div>
              </button>
            ) : (
              <div className="flex flex-wrap sm:flex-nowrap items-center border border-border rounded-2xl sm:rounded-pill bg-bg-primary shadow-xl overflow-hidden p-2 max-w-[800px] w-full animate-fadeIn">
                <div className="p-2 sm:px-5 flex flex-col min-w-[150px] flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary"
                    autoFocus
                  />
                </div>
                <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
                <div className="p-2 sm:px-5 flex flex-col min-w-[120px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Check in</label>
                  <input
                    type="date"
                    value={searchCheckIn}
                    onChange={(e) => setSearchCheckIn(e.target.value)}
                    className="border-none outline-none text-sm text-text-primary bg-transparent p-0"
                  />
                </div>
                <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
                <div className="p-2 sm:px-5 flex flex-col min-w-[120px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Check out</label>
                  <input
                    type="date"
                    value={searchCheckOut}
                    onChange={(e) => setSearchCheckOut(e.target.value)}
                    className="border-none outline-none text-sm text-text-primary bg-transparent p-0"
                  />
                </div>
                <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
                <div className="p-2 sm:px-5 flex flex-col min-w-[100px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Who</label>
                  <input
                    type="number"
                    placeholder="Add guests"
                    min="1"
                    value={searchGuests}
                    onChange={(e) => setSearchGuests(e.target.value)}
                    className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary"
                  />
                </div>
                <button
                  className="flex items-center gap-2 py-3 px-6 m-1 rounded-pill bg-[#FF385C] hover:bg-[#D70466] text-white text-sm font-semibold cursor-pointer border-none transition-all duration-150 shrink-0 shadow-md"
                  onClick={handleSearch}
                >
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="19" y1="19" x2="28" y2="28" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {globeMenuOpen && (
        <div className="modal-overlay" onClick={() => setGlobeMenuOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setGlobeMenuOpen(false)}>✕</button>
            </div>
            <div className="modal-body flex flex-col items-center justify-center py-12">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Coming Soon</h2>
              <p className="text-text-secondary text-center text-sm">Language and region settings will be available shortly.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-[90px] border-b border-border bg-bg-primary" />}>
      <HeaderContent />
    </Suspense>
  );
}
