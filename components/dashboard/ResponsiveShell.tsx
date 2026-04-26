"use client";

import { useState } from "react";
import { Menu, Trophy, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Sidebar } from "./Sidebar";

export function ResponsiveShell({
  children,
  userEmail,
  role,
}: {
  children: React.ReactNode;
  userEmail: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar
        userEmail={userEmail}
        role={role}
        mobileOpen={open}
        onMobileClose={() => setOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FF6B1A]/20 border border-[#FF6B1A]/30 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-[#FF6B1A]" />
            </div>
            <span className="text-sm font-bold text-white">Drawlot.Com</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
