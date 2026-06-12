"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();

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

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
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
  className={`transition-all duration-300 ${scrolled ? "" : "brightness-0 invert"}`}
/>
      <span
  className={`hidden lg:block text-[32px] font-extrabold leading-[42px] transition-colors duration-300 ${
    scrolled ? "text-[#0A0D12]" : "text-white"
  }`}
>
  Foody
</span>
        </Link>

        {/* Kanan: berbeda tergantung status login */}
        {token ? (
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Cart */}
       <button type="button">
  <img
    src="/images/icons/shopping-bag.svg"
    alt="Cart"
   className={`w-7 h-7 transition-all duration-300 ${
  scrolled ? "brightness-0" : ""
}`}
  />
</button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-4"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-300" />
                )}
                <span
                  className={`hidden lg:block text-lg font-semibold tracking-[-0.02em] transition-colors duration-300 ${
                    scrolled ? "text-[#0A0D12]" : "text-white"
                  }`}
                >
                  {user?.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[197px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 flex flex-col gap-3">
                  {/* Info user */}
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-300" />
                    )}
                    <span className="text-base font-bold tracking-[-0.02em] text-[#0A0D12]">
                      {user?.name}
                    </span>
                  </div>

                  <hr className="border-[#E9EAEB]" />

                  <button
  type="button"
  onClick={() => { setDropdownOpen(false); router.push("/delivery-address"); }}
  className="flex items-center gap-2 text-sm font-medium text-[#0A0D12] w-full text-left"
>
  <img src="/images/icons/map-pin.svg" alt="" aria-hidden="true" className="w-5 h-5" />
  Delivery Address
</button>

<button
  type="button"
  onClick={() => { setDropdownOpen(false); router.push("/orders"); }}
  className="flex items-center gap-2 text-sm font-medium text-[#181D27] w-full text-left"
>
  <img src="/images/icons/my-orders.svg" alt="" aria-hidden="true" className="w-5 h-5" />
  My Orders
</button>

<button
  type="button"
  onClick={handleLogout}
  className="flex items-center gap-2 text-sm font-medium text-[#0A0D12] w-full text-left"
>
  <img src="/images/icons/logout.svg" alt="" aria-hidden="true" className="w-5 h-5" />
  Logout
</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          
<div className="flex items-center gap-4">
  <Link
    href="/login"
    className={`w-[120px] lg:w-[163px] h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base font-bold rounded-full border-2 border-[#D5D7DA] tracking-[-0.02em] transition-colors duration-300 ${
      scrolled ? "text-[#0A0D12]" : "text-white"
    }`}
  >
    Sign In
  </Link>
  <Link
    href="/register"
    className={`w-[120px] lg:w-[163px] h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base font-bold rounded-full tracking-[-0.02em] transition-colors duration-300 ${
      scrolled ? "bg-[#C12116] text-white" : "bg-white text-[#0A0D12]"
    }`}
  >
    Sign Up
  </Link>
</div>
        )}
      </nav>
    </header>
  );
}