"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Users, Trophy, Shield, ChevronDown, ChevronUp } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { draws: number };
};

type Draw = {
  id: string;
  sourceName: string | null;
  sourceType: string;
  participantCount: number;
  winnerCount: number;
  participants: string;
  winners: string;
  createdAt: string;
};

export function AdminDashboardClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [draws, setDraws] = useState<Record<string, Draw[]>>({});
  const [loadingDraws, setLoadingDraws] = useState<string | null>(null);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (userId: string) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (draws[userId]) return;
    setLoadingDraws(userId);
    const res = await fetch(`/api/admin/users/${userId}/draws`);
    const data = await res.json();
    setDraws((prev) => ({ ...prev, [userId]: data }));
    setLoadingDraws(null);
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setTogglingRole(user.id);
    const res = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    }
    setTogglingRole(null);
  };

  const totalDraws = users.reduce((sum, u) => sum + u._count.draws, 0);
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage users and view activity</p>
        </div>
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
        >
          ← User Dashboard
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400" },
          { label: "Total Draws", value: totalDraws, icon: Trophy, color: "text-brand" },
          { label: "Admins", value: adminCount, icon: Shield, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-zinc-800 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "—" : value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-sm">Registered Users</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {users.map((user) => (
              <div key={user.id}>
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {user.email[0].toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-zinc-500">{user.name || "No name"} · Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  {/* Draws count */}
                  <div className="text-center shrink-0">
                    <p className="text-sm font-semibold">{user._count.draws}</p>
                    <p className="text-xs text-zinc-500">draws</p>
                  </div>
                  {/* Role badge + toggle */}
                  <button
                    onClick={() => toggleRole(user)}
                    disabled={togglingRole === user.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      user.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                        : "bg-zinc-700 text-zinc-400 border border-zinc-600 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30"
                    }`}
                  >
                    {togglingRole === user.id ? "..." : user.role === "ADMIN" ? "ADMIN" : "USER"}
                  </button>
                  {/* Expand draws */}
                  <button
                    onClick={() => toggleExpand(user.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                  >
                    {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded draws */}
                {expandedUser === user.id && (
                  <div className="px-5 pb-4 bg-zinc-950">
                    {loadingDraws === user.id ? (
                      <p className="text-xs text-zinc-500 py-3">Loading draws...</p>
                    ) : !draws[user.id]?.length ? (
                      <p className="text-xs text-zinc-500 py-3">No draws yet.</p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {draws[user.id].map((draw) => {
                          const winners = JSON.parse(draw.winners) as string[];
                          return (
                            <div key={draw.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-zinc-300">
                                  {draw.sourceName || (draw.sourceType === "manual" ? "Manual list" : "File upload")}
                                </span>
                                <span className="text-zinc-500">{format(new Date(draw.createdAt), "MMM d, yyyy HH:mm")}</span>
                              </div>
                              <div className="text-zinc-500">
                                {draw.participantCount} participants · {draw.winnerCount} winner{draw.winnerCount !== 1 ? "s" : ""}
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {winners.map((w, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-brand/10 text-brand border border-brand/20 rounded-full">
                                    {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
