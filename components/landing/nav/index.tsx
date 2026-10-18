
import { isAuthorized } from "@/lib/isAuthorized";
import Link from "next/link";

const Navbar = async () => {

  const user = await isAuthorized();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-sm border-b border-white/5 bg-[#050509]/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={"/"} className="flex items-center gap-2">
<Logo/>
     <span className="text-base font-semibold tracking-tight">
            <span className="text-[#F2A65A] animate-pulse">In</span>
            <span className="text-white/90">stant</span>
            <span className="text-[#F2A65A]">Desk</span>
          </span>
          <span className="text-base font-semibold tracking-tight text-white/90">
            Support
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-light text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            Integration
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
       {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="h-10 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                Dashboard
              </Link>
            </div>
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
      </div>
    </nav>
  );
};

export default Navbar;

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
        <rect x="1" y="1" width="32" height="32" rx="9" stroke="#F2A65A" strokeWidth="1.4" />
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