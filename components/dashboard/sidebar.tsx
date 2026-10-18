"use client";

import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Bot,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "../landing/nav";

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

const Sidebar = () => {
  // Returns the current URL pathname.
  // Used to highlight the active navigation item.
  const pathname = usePathname();

  // Custom hook that provides authenticated user information.
  const { email } = useUser();

  // Stores organization metadata fetched from the backend.
  const [metadata, setMetadata] = useState<any>();

  // Controls loading state while metadata is being fetched.
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization metadata once when the sidebar mounts.
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch("/api/metadata/fetch");
      const res = await response.json();

      // Save organization details into component state.
      setMetadata(res.data);

      // Hide loading state after request completes.
      setIsLoading(false);
    };

    fetchMetadata();
  }, []);

  return (
    // Desktop sidebar.
    // Hidden on mobile and fixed to the left side of the screen.
    <aside className="w-64 border-r border-white/5 bg-[#050509] flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
      
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
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
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          // Check whether current route matches this menu item.
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Base styles
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",

                // Active vs inactive styling
                isActive
                  ? "bg-white/5 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Menu Icon */}
              <item.icon className="w-4 h-4" />

              {/* Menu Label */}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Workspace Information */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors group">
          
          {/* Workspace Avatar */}
          {/* Displays first two letters of the business name */}
          <div className="w-8 h-8 rounded-full bg-zinc-800 p-2 flex items-center justify-center border border-white/10">
            <span className="text-xs text-zinc-400 group-hover:text-white">
              {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
            </span>
          </div>

          {/* Workspace Details */}
          <div className="flex flex-col overflow-hidden">
            
            {/* Organization Name */}
            <span className="text-sm font-medium text-zinc-300 truncate group-hover:text-white">
              {isLoading
                ? "Loading..."
                : `${metadata?.business_name}'s Workspace`}
            </span>

            {/* Logged-in User Email */}
            <span className="text-xs text-zinc-500 truncate">
              {email}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;