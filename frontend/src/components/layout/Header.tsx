"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { GoGlobe } from "react-icons/go";
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

  const tabs = [
    { key: "all", emoji: "🌍", label: "All" },
    { key: "homes", emoji: "🏠", label: "Homes" },
    { key: "experiences", emoji: "🎈", label: "Experiences" },
    { key: "services", emoji: "🛎️", label: "Services" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-primary border-b border-border transition-all">
      <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 py-3 md:py-4 flex flex-col gap-2 md:gap-4">
        <div className="md:hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 text-decoration-none shrink-0">
              <Image src="/airbnb.png" alt="Logo" loading="eager" width={28} height={28} />
            </Link>
            <div className="flex items-center gap-2 relative" ref={menuRef}>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-bg-secondary transition-all text-text-primary cursor-pointer active:scale-95 shrink-0"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-yellow-500"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-700"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              </button>
              <button
                className="flex items-center gap-1.5 py-1 pr-1 pl-2.5 border border-border rounded-pill bg-bg-primary cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setMenuOpen(!menuOpen)}
                id="user-menu-button-mobile"
              >
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor">
                  <path d="M4 7h24v2H4zm0 8h24v2H4zm0 8h24v2H4z" />
                </svg>
                <div className="w-[28px] h-[28px] rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center shrink-0">
                  {user ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#717171"><path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-3.02 5.49 12.43 12.43 0 0 1 6.45 4.4A12.56 12.56 0 0 1 16 28.7z" /></svg>
                  )}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-bg-primary rounded-xl shadow-xl border border-border py-2 animate-fadeIn z-[200]">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 flex flex-col gap-0.5">
                        <strong className="text-sm font-semibold">{user?.name}</strong>
                        <span className="text-xs text-text-secondary">{user?.email}</span>
                      </div>
                      <hr className="border-0 border-t border-border my-1" />
                      <Link href="/trips" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Trips</Link>
                      <Link href="/wishlists" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Wishlists</Link>
                      <hr className="border-0 border-t border-border my-1" />
                      <Link href="/hosting" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Manage listings</Link>
                      <Link href="/hosting/create" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Create a listing</Link>
                      <hr className="border-0 border-t border-border my-1" />
                      <button className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors cursor-pointer bg-transparent border-none" onClick={() => { logout(); setMenuOpen(false); }}>Log out</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block w-full px-4 py-2.5 text-sm text-text-primary font-semibold text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Log in</Link>
                      <Link href="/login?mode=register" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Sign up</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Row 2: Compact search pill */}
          {isHome && (
            <button
              className="flex items-center gap-3 border border-border shadow-sm rounded-pill py-3 px-4 bg-bg-primary w-full cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSearchOpen(true)}
            >
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-text-primary shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="19" y1="19" x2="28" y2="28" />
              </svg>
              <span className="text-sm font-semibold text-text-primary">Start your search</span>
            </button>
          )}

          {/* Mobile Row 3: Horizontally scrollable category tabs */}
          {isHome && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                    activeTab === tab.key
                      ? "border-text-primary bg-bg-secondary text-text-primary"
                      : "border-border bg-bg-primary text-text-secondary hover:border-text-secondary"
                  }`}
                >
                  <span className="text-base">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========== DESKTOP LAYOUT (>= md) ========== */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-decoration-none shrink-0">
            <Image src="/airbnb.png" alt="Logo" loading="eager" width={30} height={30} />
            <span className="hidden sm:inline text-[22px] text-primary" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.75px' }}>airbnb</span>
          </Link>

          {/* Center Category Tabs */}
          <div className="flex items-center gap-6 lg:gap-8 border-b-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-2 pb-2 border-b-2 font-semibold text-sm transition-colors bg-transparent cursor-pointer ${
                  activeTab === tab.key ? "border-text-primary text-text-primary font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="text-xl lg:text-2xl">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-3 relative shrink-0" ref={menuRef}>
            <Link href="/hosting" className="hidden lg:block text-sm font-semibold py-2.5 px-3.5 rounded-pill transition-colors hover:bg-bg-secondary text-text-primary">
              Become a host
            </Link>
            <button onClick={() => setGlobeMenuOpen(true)} className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-bg-secondary transition-colors text-text-primary cursor-pointer">
              <GoGlobe className="text-text-primary rounded-full" size={20} />
            </button>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-bg-secondary transition-all text-text-primary cursor-pointer active:scale-95 shrink-0" aria-label="Toggle theme" id="theme-toggle">
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500 transition-transform duration-300 rotate-90 hover:rotate-180"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            <button className="flex items-center gap-2 py-1 pr-1 pl-3 border border-border rounded-pill bg-bg-primary cursor-pointer transition-shadow hover:shadow-md" onClick={() => setMenuOpen(!menuOpen)} id="user-menu-button">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="M4 7h24v2H4zm0 8h24v2H4zm0 8h24v2H4z" /></svg>
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center shrink-0">
                {user ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#717171"><path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-3.02 5.49 12.43 12.43 0 0 1 6.45 4.4A12.56 12.56 0 0 1 16 28.7z" /></svg>
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
                    <Link href="/trips" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Trips</Link>
                    <Link href="/wishlists" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Wishlists</Link>
                    <hr className="border-0 border-t border-border my-1" />
                    <Link href="/hosting" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Manage listings</Link>
                    <Link href="/hosting/create" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Create a listing</Link>
                    <hr className="border-0 border-t border-border my-1" />
                    <button className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors cursor-pointer bg-transparent border-none" onClick={() => { logout(); setMenuOpen(false); }}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block w-full px-4 py-2.5 text-sm text-text-primary font-semibold text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Log in</Link>
                    <Link href="/login?mode=register" className="block w-full px-4 py-2.5 text-sm text-text-primary text-left hover:bg-bg-secondary transition-colors" onClick={() => setMenuOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Search Bar (Where | When | Who) */}
        {isHome && (
          <div ref={searchRef} className="hidden md:flex justify-center pb-2">
            {!searchOpen ? (
              <button
                className="flex items-center justify-between border border-border shadow-sm hover:shadow-md transition-all rounded-pill py-2 pl-6 pr-2 bg-bg-primary max-w-[800px] w-full cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <div className="flex items-center justify-between flex-1 pr-6">
                  <div className="flex flex-col text-left flex-1">
                    <span className="text-xs font-bold text-text-primary">Where</span>
                    <span className="text-sm text-text-secondary truncate">{searchLocation || "Search destinations"}</span>
                  </div>
                  <span className="w-px h-8 bg-border mx-6" />
                  <div className="flex flex-col text-left flex-1">
                    <span className="text-xs font-bold text-text-primary">When</span>
                    <span className="text-sm text-text-secondary truncate">{searchCheckIn && searchCheckOut ? `${searchCheckIn} - ${searchCheckOut}` : "Add dates"}</span>
                  </div>
                  <span className="w-px h-8 bg-border mx-6" />
                  <div className="flex flex-col text-left flex-1">
                    <span className="text-xs font-bold text-text-primary">Who</span>
                    <span className="text-sm text-text-secondary truncate">{searchGuests ? `${searchGuests} guests` : "Add guests"}</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0 shadow-md hover:bg-[#D70466] transition-colors">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10" /><line x1="19" y1="19" x2="28" y2="28" /></svg>
                </div>
              </button>
            ) : (
              <div className="flex items-center border border-border rounded-pill bg-bg-primary shadow-xl overflow-hidden p-2 max-w-[800px] w-full animate-fadeIn">
                <div className="px-5 flex flex-col min-w-[150px] flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Where</label>
                  <input type="text" placeholder="Search destinations" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary" autoFocus />
                </div>
                <div className="w-px h-8 bg-border shrink-0" />
                <div className="px-5 flex flex-col min-w-[120px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Check in</label>
                  <input type="date" value={searchCheckIn} onChange={(e) => setSearchCheckIn(e.target.value)} className="border-none outline-none text-sm text-text-primary bg-transparent p-0" />
                </div>
                <div className="w-px h-8 bg-border shrink-0" />
                <div className="px-5 flex flex-col min-w-[120px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Check out</label>
                  <input type="date" value={searchCheckOut} onChange={(e) => setSearchCheckOut(e.target.value)} className="border-none outline-none text-sm text-text-primary bg-transparent p-0" />
                </div>
                <div className="w-px h-8 bg-border shrink-0" />
                <div className="px-5 flex flex-col min-w-[100px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-0.5">Who</label>
                  <input type="number" placeholder="Add guests" min="1" value={searchGuests} onChange={(e) => setSearchGuests(e.target.value)} className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary" />
                </div>
                <button className="flex items-center gap-2 py-3 px-6 m-1 rounded-pill bg-[#FF385C] hover:bg-[#D70466] text-white text-sm font-semibold cursor-pointer border-none transition-all duration-150 shrink-0 shadow-md" onClick={handleSearch}>
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10" /><line x1="19" y1="19" x2="28" y2="28" /></svg>
                  <span>Search</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Full-Screen Search Modal */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[1000] bg-bg-secondary flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              {tabs.filter(t => t.key !== "all").map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors bg-transparent cursor-pointer border-none whitespace-nowrap pb-1 ${
                    activeTab === tab.key || (activeTab === "all" && tab.key === "homes")
                      ? "text-text-primary border-b-2 border-text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  <span className="text-2xl">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm cursor-pointer hover:bg-bg-primary transition-colors bg-bg-primary shrink-0 ml-3"
            >
              ✕
            </button>
          </div>

          {/* Search Card */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
            <div className="bg-bg-primary rounded-2xl shadow-lg border border-border p-5">
              <h2 className="text-xl font-bold text-text-primary mb-4">Where?</h2>
              <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 mb-6">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-text-secondary shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="19" y1="19" x2="28" y2="28" />
                </svg>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="border-none outline-none text-sm text-text-primary bg-transparent p-0 w-full placeholder:text-text-secondary"
                  autoFocus
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Suggested destinations</p>
              <div className="flex flex-col gap-1">
                {[
                  { icon: "📍", name: "Nearby", desc: "Find what's around you" },
                  { icon: "🏖️", name: "North Goa, Goa", desc: "Popular beach destination" },
                  { icon: "🏔️", name: "Ooty, Tamil Nadu", desc: "Great for a weekend getaway" },
                  { icon: "🌆", name: "Bangalore, Karnataka", desc: "Urban stays and nightlife" },
                ].map((dest) => (
                  <button
                    key={dest.name}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-secondary transition-colors cursor-pointer bg-transparent border-none w-full text-left"
                    onClick={() => { setSearchLocation(dest.name === "Nearby" ? "" : dest.name); }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-bg-secondary flex items-center justify-center text-xl shrink-0">{dest.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-text-primary">{dest.name}</span>
                      <span className="text-xs text-text-secondary">{dest.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* When */}
            <div className="bg-bg-primary rounded-2xl shadow-lg border border-border p-5 mt-3">
              <h2 className="text-xl font-bold text-text-primary mb-4">When?</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-text-secondary mb-1 block">Check in</label>
                  <input type="date" value={searchCheckIn} onChange={(e) => setSearchCheckIn(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary bg-bg-primary outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-text-secondary mb-1 block">Check out</label>
                  <input type="date" value={searchCheckOut} onChange={(e) => setSearchCheckOut(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary bg-bg-primary outline-none" />
                </div>
              </div>
            </div>

            {/* Who */}
            <div className="bg-bg-primary rounded-2xl shadow-lg border border-border p-5 mt-3">
              <h2 className="text-xl font-bold text-text-primary mb-4">Who?</h2>
              <input type="number" placeholder="Add guests" min="1" value={searchGuests} onChange={(e) => setSearchGuests(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary bg-bg-primary outline-none placeholder:text-text-secondary" />
            </div>
          </div>

          {/* Bottom sticky search button */}
          <div className="px-4 py-3 border-t border-border bg-bg-primary">
            <button
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-bold text-base cursor-pointer border-none shadow-md transition-all hover:brightness-95"
              onClick={handleSearch}
            >
              🔍 Search
            </button>
          </div>
        </div>
      )}

      {/* Globe Coming Soon Modal */}
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
