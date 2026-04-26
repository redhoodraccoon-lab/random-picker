"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in</h1>
        <p className="text-zinc-500 text-sm mt-1">Official draw management portal</p>
      </div>

      {justRegistered && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-950/50 border border-green-800/50 text-green-400 text-sm">
          Account created! Sign in below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-brand text-white font-bold text-sm uppercase tracking-wider transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_-8px_rgba(255,107,26,0.5)]"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-zinc-500 pt-1">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand hover:text-brand-light font-semibold transition">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-10">
          <img src="/arena-logo.png" alt="Arena" className="h-10 drop-shadow-lg" />
        </div>

        <Suspense fallback={
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl animate-pulse h-72" />
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Drawlot · Authorised Personnel Only
        </p>
      </div>
    </div>
  );
}
