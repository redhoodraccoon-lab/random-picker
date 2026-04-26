"use client";

import { useState, useCallback } from "react";

export type ToastVariant = "default" | "success" | "destructive";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify(newToasts: Toast[]) {
  toasts = newToasts;
  listeners.forEach((l) => l(toasts));
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const t: Toast = { id, title, description, variant };
  notify([...toasts, t]);
  setTimeout(() => {
    notify(toasts.filter((x) => x.id !== id));
  }, 4000);
}

export function useToastStore() {
  const [store, setStore] = useState<Toast[]>(toasts);
  const register = useCallback((l: (t: Toast[]) => void) => {
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return { toasts: store, setStore, register };
}
