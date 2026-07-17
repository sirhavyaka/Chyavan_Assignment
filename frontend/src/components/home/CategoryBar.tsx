"use client";

import React, { useRef } from "react";
import { CATEGORIES } from "@/types";

interface Props {
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryBar({ activeCategory, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-[var(--header-height)] z-40 bg-bg-primary border-b border-border flex items-center px-6 md:px-10 lg:px-20 h-[var(--category-bar-height)]">
      <button
        className="w-7 h-7 rounded-full border border-border-dark bg-bg-primary flex items-center justify-center cursor-pointer text-base text-text-primary shrink-0 transition-shadow hover:shadow-md mr-4 z-10"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        ‹
      </button>
      <div className="flex gap-8 overflow-x-auto no-scrollbar flex-1 py-3" ref={scrollRef}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`flex flex-col items-center gap-1 pt-1 pb-2.5 border-b-2 bg-transparent cursor-pointer whitespace-nowrap shrink-0 transition-all duration-150 ${
              activeCategory === cat.name
                ? "opacity-100 border-text-primary text-text-primary font-semibold"
                : "opacity-64 border-transparent text-text-secondary hover:opacity-100 hover:border-border-dark"
            }`}
            onClick={() => onSelect(activeCategory === cat.name ? null : cat.name)}
          >
            <span className="text-2xl leading-none">{cat.icon}</span>
            <span className="text-xs font-semibold">{cat.name}</span>
          </button>
        ))}
      </div>
      <button
        className="w-7 h-7 rounded-full border border-border-dark bg-bg-primary flex items-center justify-center cursor-pointer text-base text-text-primary shrink-0 transition-shadow hover:shadow-md ml-4 z-10"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}
