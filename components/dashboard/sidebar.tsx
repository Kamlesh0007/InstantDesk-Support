"use client";

import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Bot,
  Layers,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "../landing/nav/NavbarClient";

// Sidebar navigation configuration.
// Using a configuration array makes it easy to add, remove,
// or reorder menu items without changing the JSX.
const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Sections", href: "/dashboard/sections", icon: Layers },
  { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Brand logo + name. `compact` drops the "Support" suffix for the mobile top bar.
const Brand = ({ compact = false }: { compact?: boolean }) => (
  <Link href={"/"} className="flex items-center gap-2">
    <Logo />
    <span className="text-base font-semibold tracking-tight">
      <span className="text-[#F2A65A] animate-pulse">In</span>
      <span className="text-white/90">stant</span>
      <span className="text-[#F2A65A]">Desk</span>
    </span>
    {!compact && (
      <span className="text-base font-semibold tracking-tight text-white/90">
        Support
      </span>
    )}
  </Link>
);

// Navigation links, shared by the desktop sidebar and the mobile drawer.
const NavLinks = ({
  pathname,
  mobile = false,
}: {
  pathname: string;
  mobile?: boolean;
}) => (
  <>
    {SIDEBAR_ITEMS.map((item) => {
      // Dashboard must match exactly (every other route starts with it);
      // other items stay highlighted on their nested pages too.
      const isActive =
        item.href === "/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 font-medium transition-colors",
            mobile
              ? "px-2.5 py-2.5 rounded-xl text-[15px]"
              : "px-3 py-2 rounded-md text-sm",
            isActive
              ? mobile
                ? "bg-indigo-500/10 text-white ring-1 ring-indigo-500/25"
                : "bg-white/5 text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10"
          )}
        >
          {mobile ? (
            // mobile: icon sits in a small rounded chip
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                isActive
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-white/5 text-zinc-400"
              )}
            >
              <item.icon className="w-4 h-4" />
            </span>
          ) : (
            <item.icon
              className={cn("w-4 h-4", isActive && "text-indigo-400")}
            />
          )}
          {item.label}
        </Link>
      );
    })}
  </>
);

// Workspace / user card, shared by desktop and mobile.
const WorkspaceCard = ({
  metadata,
  isLoading,
  email,
  mobile = false,
}: {
  metadata: any;
  isLoading: boolean;
  email?: string | null;
  mobile?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 cursor-pointer transition-colors group",
      mobile
        ? "rounded-xl border border-white/10 bg-white/4 p-3 active:bg-white/8"
        : "px-3 py-2 rounded-md hover:bg-white/5"
    )}
  >
    {/* Workspace Avatar: first two letters of the business name */}
    <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
      <span className="text-xs text-zinc-400 group-hover:text-white">
        {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
      </span>
    </div>

    <div className="flex flex-col overflow-hidden">
      <span className="text-sm font-medium text-zinc-300 truncate group-hover:text-white">
        {isLoading ? "Loading..." : `${metadata?.business_name}'s Workspace`}
      </span>
      <span className="text-xs text-zinc-500 truncate">{email}</span>
    </div>
  </div>
);

const Sidebar = () => {
  // Current URL pathname, used to highlight the active item.
  const pathname = usePathname();

  // Authenticated user information.
  const { email } = useUser();

  // Organization metadata fetched from the backend.
  const [metadata, setMetadata] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);

  // Mobile drawer open/closed.
  const [open, setOpen] = useState(false);

  // Fetch organization metadata once when the sidebar mounts.
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch("/api/metadata/fetch");
      const res = await response.json();
      setMetadata(res.data);
      setIsLoading(false);
    };

    fetchMetadata();
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the drawer is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* ---------- Mobile top bar (hidden on md+) ---------- */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between gap-3 px-4 border-b border-white/5 bg-[#050509]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="-ml-2 flex size-10 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Brand compact />
        </div>

        {/* Workspace avatar */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800">
          <span className="text-xs text-zinc-400">
            {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
          </span>
        </div>
      </header>

      {/* ---------- Mobile drawer (hidden on md+) ---------- */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-[visibility] duration-0",
          // keep it mounted for the slide-out animation, then hide it from focus/AT
          open ? "visible delay-0" : "invisible delay-300"
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute inset-y-0 left-0 isolate flex w-[82vw] max-w-xs flex-col overflow-hidden rounded-r-3xl border-r border-white/10 bg-[#0B0B12] shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* soft indigo glow behind the header */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-10 -z-10 h-48 w-64 rounded-full bg-indigo-500/20 blur-3xl"
          />

          <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
            <Brand compact />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="-mr-2 flex size-10 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="px-2.5 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Menu
            </p>
            <NavLinks pathname={pathname} mobile />
          </nav>

          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <WorkspaceCard
              metadata={metadata}
              isLoading={isLoading}
              email={email}
              mobile
            />
          </div>
        </aside>
      </div>

      {/* ---------- Desktop sidebar (hidden below md) ---------- */}
      <aside className="w-64 border-r border-white/5 bg-[#050509] flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Brand />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <WorkspaceCard
            metadata={metadata}
            isLoading={isLoading}
            email={email}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;