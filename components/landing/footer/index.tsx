import Link from "next/link";
import React from "react";
import { Logo } from "../nav";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-12 bg-black/40">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
        <Logo/>
          <span className="text-base font-semibold tracking-tight">
            <span className="text-[#F2A65A]">In</span>
            <span className="text-white/90">stant</span>
            <span className="text-[#F2A65A]">desk</span>
          </span>
                <span className="text-base font-semibold tracking-tight text-white/90">
            Support
          </span>
        </Link>

        <div className="flex gap-8 text-sm text-zinc-600 font-light">
          <Link href="#" className="hover:text-zinc-400 transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-zinc-400 transition-colors">
            Terms
          </Link>
          <Link
            href="https://github.com/kamlesh0007"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            GitHub
          </Link>
        </div>

        <div className="text-xs text-zinc-700">
          © 2026 InstantDesk All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;