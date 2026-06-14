"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import ProfileCard from '@/components/shared/ProfileCard';
import { useCart } from '@/lib/query/cart';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const cartQuery = useCart({ enabled: !!token });
const totalCartItems = cartQuery.data?.data?.summary?.totalItems ?? 0;
const isScrolled = pathname !== '/' || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-4 lg:px-[120px] h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[15px]">
          <Image
            src="/images/foody-logo.svg"
            alt="Foody"
            width={42}
            height={42}
            className={`transition-all duration-300 ${isScrolled ? "" : "brightness-0 invert"}`}
          />
          <span
            className={`hidden lg:block text-[32px] font-extrabold leading-[42px] transition-colors duration-300 ${
              isScrolled ? "text-neutral-950" : "text-white"
            }`}
          >
            Foody
          </span>
        </Link>

        {/* Logged in */}
        {token ? (
          <div className="flex items-center gap-4 lg:gap-6">
       <div className="relative">
  <Button
    type="button"
    variant="ghost"
   className="w-7 h-7 lg:w-8 lg:h-8 p-0 hover:bg-transparent cursor-pointer"
    onClick={() => router.push('/cart')}
  >
    <img
      src="/images/icons/shopping-bag.svg"
      alt="Cart"
      className={`w-7 h-7 lg:w-8 lg:h-8 transition-all duration-300 ${isScrolled ? "brightness-0" : ""}`}
    />
  </Button>
  {totalCartItems > 0 && (
   <div className="absolute -top-[3px] left-4 lg:-top-px lg:left-[18px] w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center pointer-events-none">
      <span className="text-[12px] font-bold leading-[23px] tracking-[-0.02em] text-white">
        {totalCartItems > 99 ? '99+' : totalCartItems}
      </span>
    </div>
  )}
</div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-4 cursor-pointer"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-neutral-300" />
                )}
                <span className={`hidden lg:block text-lg font-semibold tracking-[-0.02em] transition-colors duration-300 ${isScrolled ? "text-neutral-950" : "text-white"}`}>
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
  <div className="absolute right-0 top-[calc(100%+8px)]">
    <ProfileCard variant="dropdown" onClose={() => setDropdownOpen(false)} />
  </div>
)}
            </div>
          </div>
        ) : (
          /* Not logged in */
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className={`w-[120px] lg:w-[163px] h-10 lg:h-12 rounded-full border-2 border-neutral-300 bg-transparent text-sm lg:text-base font-bold tracking-[-0.02em] transition-colors duration-300 hover:bg-transparent ${
                isScrolled ? "text-neutral-950" : "text-white"
              }`}
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className={`w-[120px] lg:w-[163px] h-10 lg:h-12 rounded-full text-sm lg:text-base font-bold tracking-[-0.02em] transition-colors duration-300 ${
                isScrolled ? "bg-primary-100 text-white hover:bg-primary-100/90" : "bg-white text-neutral-950 hover:bg-white/90"
              }`}
            >
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}