"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchGuests, setSearchGuests] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (searchCheckIn) params.set("check_in", searchCheckIn);
    if (searchCheckOut) params.set("check_out", searchCheckOut);
    if (searchGuests) params.set("guests", searchGuests);
    router.push(`/?${params.toString()}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary border-b border-border h-[var(--header-height)]">
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-decoration-none shrink-0">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.907 6.478-6.353 6.478-2.025 0-4.078-.684-6.201-2.147l-.195-.14C15.507 27.613 14.426 27 13.5 27c-.726 0-1.572.384-2.651 1.213l-.456.37C8.396 30.317 6.349 31 4.347 31 .901 31-2.006 28.584-2.006 24.522l.002-.228.009-.415c.051-.924.294-1.805.96-3.396l.145-.353c.987-2.296 5.146-11.005 7.1-14.836l.534-1.025C8.035 1.963 9.49 1 11.5 1h4.5z" fill="#FF385C"/>
          </svg>
          <span className="hidden sm:inline text-xl font-bold text-primary tracking-tight">stayscape</span>
        </Link>

        {/* Compact Search Bar */}
        <div ref={searchRef} className="flex-0 flex justify-center">
          {!searchOpen ? (
            <button
              className="flex items-center border border-border rounded-pill py-2 px-2 pl-5 bg-bg-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer text-sm"
              onClick={() => setSearchOpen(true)}
            >
              <span className="font-semibold text-text-primary pr-4">Anywhere</span>
              <span className="w-px h-6 bg-border" />
              <span className="hidden sm:inline font-semibold text-text-primary px-4">Any week</span>
              <span className="hidden sm:inline w-px h-6 bg-border" />
              <span className="hidden sm:inline text-text-secondary px-4">Add guests</span>
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center ml-2">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="19" y1="19" x2="28" y2="28" />
                </svg>
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap sm:flex-nowrap items-center border border-border rounded-2xl sm:rounded-pill bg-bg-primary shadow-lg overflow-hidden p-1">
              <div className="p-2 sm:px-5 flex flex-col min-w-[120px] flex-1">
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
              <div className="p-2 sm:px-5 flex flex-col min-w-[110px]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Check in</label>
                <input
                  type="date"
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="border-none outline-none text-sm text-text-primary bg-transparent p-0"
                />
              </div>
              <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
              <div className="p-2 sm:px-5 flex flex-col min-w-[110px]">
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
                  placeholder="Guests"
                  min="1"
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(e.target.value)}
                  className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary"
                />
              </div>
              <button
                className="flex items-center gap-2 py-3 px-5 m-1 rounded-pill bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:from-[#D11C4A] hover:via-[#C81D57] hover:to-[#BD035E] text-white text-sm font-semibold cursor-pointer border-none transition-all duration-150 shrink-0"
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

        {/* User Area */}
        <div className="flex items-center gap-4 relative shrink-0" ref={menuRef}>
          {isAuthenticated && (
            <Link href="/hosting" className="hidden sm:block text-sm font-semibold py-2.5 px-3.5 rounded-pill transition-colors hover:bg-bg-secondary">
              Switch to hosting
            </Link>
          )}
          <button
            className="flex items-center gap-2.5 py-1.25 px-1.25 pl-3 border border-border rounded-pill bg-bg-primary cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setMenuOpen(!menuOpen)}
            id="user-menu-button"
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
              <path d="M4 7h24v2H4zm0 8h24v2H4zm0 8h24v2H4z" />
            </svg>
            <div className="w-7.5 h-7.5 rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center">
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
    </header>
  );
}
