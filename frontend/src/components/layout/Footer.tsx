import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-16">
      <div className="max-w-[1760px] mx-auto pt-12 pb-6 px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b border-border">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold mb-1 text-text-primary">Support</h4>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Help Center</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">AirCover</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Anti-discrimination</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Disability support</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Cancellation options</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Report neighborhood concern</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold mb-1 text-text-primary">Hosting</h4>
            <Link href="/hosting" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Stayscape your home</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">AirCover for Hosts</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Hosting resources</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Community forum</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Hosting responsibly</Link>
            <Link href="/hosting" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Explore hosting</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold mb-1 text-text-primary">Stayscape</h4>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Newsroom</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">New features</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Careers</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Investors</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Gift cards</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">Emergency stays</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-sm text-text-secondary gap-2">
          <span>© {new Date().getFullYear()} Stayscape, Inc. · Privacy · Terms · Sitemap</span>
          <span>🌐 English (US) · $ USD</span>
        </div>
      </div>
    </footer>
  );
}
