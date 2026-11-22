
"use client";

import { useState } from "react";
import Link from "next/link";

const Navbar = ({ user }: { user: boolean }) => {
  
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#050509]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo />

          <span className="text-base font-semibold tracking-tight">
            <span className="text-[#F2A65A]">In</span>
            <span className="text-white/90">stant</span>
            <span className="text-[#F2A65A]">Desk</span>
          </span>

          <span className="text-sm sm:text-base font-semibold text-white/90">
            Support
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-light text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>

          <Link href="#how-it-works" className="hover:text-white transition-colors">
            Integration
          </Link>

          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="h-10 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all flex items-center"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/api/auth"
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/api/auth"
                className="text-xs font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            {isOpen ? (
              // Close Icon
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger Icon
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-[#050509]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">

            <Link
              href="#features"
              onClick={closeMenu}
              className="text-sm text-zinc-300 hover:text-[#F2A65A] transition-colors"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              onClick={closeMenu}
              className="text-sm text-zinc-300 hover:text-[#F2A65A] transition-colors"
            >
              Integration
            </Link>

            <Link
              href="#pricing"
              onClick={closeMenu}
              className="text-sm text-zinc-300 hover:text-[#F2A65A] transition-colors"
            >
              Pricing
            </Link>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="text-center py-3 rounded-xl bg-white text-black text-sm font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/api/auth"
                    onClick={closeMenu}
                    className="text-center py-3 rounded-xl border border-white/10 text-white text-sm"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/api/auth"
                    onClick={closeMenu}
                    className="text-center py-3 rounded-xl bg-white text-black text-sm font-medium"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

export function Logo() {
  return (
    <div className="flex items-center shrink-0">
      <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
        <rect
          x="1"
          y="1"
          width="32"
          height="32"
          rx="9"
          stroke="#F2A65A"
          strokeWidth="1.4"
        />
        <path
          d="M10 14.5C10 12 12 10.5 14.5 10.5H19.5C22 10.5 24 12.5 24 15C24 17.5 22 19.5 19.5 19.5H15L11 22.5V19.3C10.4 18.9 10 18 10 17V14.5Z"
          stroke="#F2A65A"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M18.6 13L16.4 16.5H18.6L16.4 20"
          stroke="#F2A65A"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
