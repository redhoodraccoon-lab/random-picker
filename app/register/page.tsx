"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

/* ── Password strength ── */
interface Strength { score: 0 | 1 | 2 | 3 | 4; label: string; color: string }

function getStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)                          score++;
  if (pw.length >= 12)                         score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))   score++;
  if (/[0-9]/.test(pw))                        score++;
  if (/[^A-Za-z0-9]/.test(pw))                score++;
  const s = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const meta: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
    1: { label: "Weak",   color: "#ef4444" },
    2: { label: "Fair",   color: "#f97316" },
    3: { label: "Good",   color: "#eab308" },
    4: { label: "Strong", color: "#22c55e" },
  };
  return s === 0 ? { score: 0, label: "", color: "" } : { score: s, ...meta[s] };
}

function StrengthMeter({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : "rgb(63 63 70)" }}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs font-semibold" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}

/* ── Requirements checklist ── */
const requirements = [
  { test: (p: string) => p.length >= 8,              label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p),            label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p),            label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p),            label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p),    label: "One special character" },
];

/* ── Page ── */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const confirmMismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = name.trim() && email.trim() && strength.score >= 3 && password === confirm && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src="/arena-logo.png" alt="Arena" className="h-10 drop-shadow-lg" />
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
            <p className="text-zinc-500 text-sm mt-1">Join the Drawlot platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Company or personal name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Drawlot / Juan dela Cruz"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputClass + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              <StrengthMeter password={password} />

              {/* Requirements */}
              {password.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {requirements.map(({ test, label }) => {
                    const met = test(password);
                    return (
                      <li key={label} className="flex items-center gap-2 text-xs">
                        <span className={met ? "text-green-400" : "text-zinc-600"}>
                          {met ? "✓" : "○"}
                        </span>
                        <span className={met ? "text-zinc-300" : "text-zinc-600"}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={
                    inputClass +
                    " pr-11" +
                    (confirmMismatch ? " border-red-700 focus:border-red-600 focus:ring-red-600/20" : "")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmMismatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match.</p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-lg bg-brand text-white font-bold text-sm uppercase tracking-wider transition hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_30px_-8px_rgba(255,107,26,0.5)]"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {/* Back to login */}
            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand hover:text-brand-light font-semibold transition">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Drawlot · Authorised Personnel Only
        </p>
      </div>
    </div>
  );
}
