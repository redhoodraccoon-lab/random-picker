"use client";
import { useEffect } from "react";

export function TrackPageView() {
  useEffect(() => {
    if (sessionStorage.getItem("pv_tracked")) return;
    fetch("/api/track", { method: "POST" });
    sessionStorage.setItem("pv_tracked", "1");
  }, []);
  return null;
}
