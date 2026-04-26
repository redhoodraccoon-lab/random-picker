"use client";

import { useEffect } from "react";
import { useToastStore } from "./use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, setStore, register } = useToastStore();

  useEffect(() => {
    return register(setStore);
  }, [register, setStore]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur animate-fade-in",
            t.variant === "destructive"
              ? "bg-red-950/90 border-red-800 text-red-200"
              : t.variant === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
              : "bg-zinc-900/90 border-zinc-700 text-zinc-200"
          )}
        >
          <p className="text-sm font-semibold">{t.title}</p>
          {t.description && <p className="text-xs opacity-70 mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
