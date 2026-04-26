"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Shuffle, LogOut, Trophy, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

const userNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/picker", label: "Random Picker", icon: Shuffle },
];

interface Props {
  userEmail: string;
  role: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ userEmail, role, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const isAdminPanel = pathname.startsWith("/admin");

  return (
    <aside
      className={cn(
        "w-[220px] shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 z-50 transition-transform duration-300",
        // Mobile: fixed overlay drawer
        "fixed inset-y-0 left-0",
        // Desktop: in document flow, always visible
        "md:relative md:translate-x-0",
        // Mobile open/close state
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-brand" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none">Drawlot.Com</div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">By Ketso.Co</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {userNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-brand/15 text-brand border border-brand/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}

        {/* Admin switch */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Admin</p>
            </div>
            <Link
              href="/admin"
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isAdminPanel
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-zinc-800 space-y-2">
        <div className="px-3 py-2 flex items-center gap-2">
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide">
              Admin
            </span>
          )}
          <p className="text-xs text-zinc-600 truncate">{userEmail}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
