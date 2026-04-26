"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Trash2, Eye, Download, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface Draw {
  id: string;
  sourceType: string;
  sourceName: string | null;
  participantCount: number;
  winnerCount: number;
  winners: string;
  createdAt: string;
}

interface Props {
  draws: Draw[];
  onDelete: (id: string) => void;
}

export function DrawHistoryTable({ draws, onDelete }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewDraw, setViewDraw] = useState<Draw | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "file" | "manual">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return draws.filter((d) => {
      if (sourceFilter !== "all" && d.sourceType !== sourceFilter) return false;
      if (dateFrom && new Date(d.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(d.createdAt) > new Date(dateTo + "T23:59:59")) return false;
      if (search) {
        const winners: string[] = JSON.parse(d.winners);
        const q = search.toLowerCase();
        if (!winners.some((w) => w.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [draws, sourceFilter, dateFrom, dateTo, search]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/draws/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(id);
      toast({ title: "Draw deleted", variant: "default" });
    } catch {
      toast({ title: "Failed to delete draw", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = (id: string, date: string) => {
    const a = document.createElement("a");
    a.href = `/api/draws/${id}/export`;
    a.download = `arenaplus-winners-${date}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by winner name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as "all" | "file" | "manual")}
            className="text-sm rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 outline-none focus:border-brand/50 transition"
          >
            <option value="all">All sources</option>
            <option value="file">File upload</option>
            <option value="manual">Manual input</option>
          </select>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-sm rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 outline-none focus:border-brand/50 transition"
        />
        <span className="text-zinc-600 text-sm">—</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-sm rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 outline-none focus:border-brand/50 transition"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          {draws.length === 0 ? "No draws yet. Run your first pick!" : "No draws match your filters."}
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date / Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Participants</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Winners</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((draw) => {
                const isOpen = expanded.has(draw.id);
                const winners: string[] = JSON.parse(draw.winners);
                const date = format(new Date(draw.createdAt), "MMM d, yyyy");
                const time = format(new Date(draw.createdAt), "HH:mm");

                return (
                  <>
                    <tr
                      key={draw.id}
                      className="bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      onClick={() => toggle(draw.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-zinc-200">{date}</div>
                        <div className="text-xs text-zinc-600 mt-0.5">{time}</div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={draw.sourceType === "file" ? "file" : "manual"}>
                          {draw.sourceType === "file" ? draw.sourceName ?? "File" : "Manual"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-zinc-300">{draw.participantCount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono text-brand font-semibold">{draw.winnerCount}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" onClick={() => setViewDraw(draw)} title="View winners">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleExport(draw.id, date)} title="Export CSV">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(draw.id)}
                            disabled={deleting === draw.id}
                            className="hover:text-red-400 hover:bg-red-950/30"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-600 ml-1" />}
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${draw.id}-expand`} className="bg-zinc-900/60">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Winners</div>
                          <div className="flex flex-wrap gap-2">
                            {winners.map((w, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                                <span className="text-xs font-mono text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                                <span className="text-sm font-medium text-zinc-200">{w}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Winners modal */}
      <Dialog open={!!viewDraw} onOpenChange={(o) => !o && setViewDraw(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Winners — {viewDraw && format(new Date(viewDraw.createdAt), "MMM d, yyyy HH:mm")}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {viewDraw && (
              <>
                <div className="flex gap-4 mb-5 text-xs text-zinc-500">
                  <span>{viewDraw.participantCount} participants</span>
                  <span>·</span>
                  <span className="text-brand font-semibold">{viewDraw.winnerCount} winners</span>
                  <span>·</span>
                  <span>{viewDraw.sourceType === "file" ? viewDraw.sourceName : "Manual input"}</span>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {(JSON.parse(viewDraw.winners) as string[]).map((w, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700">
                      <span className="text-xl font-bold text-brand font-mono min-w-[2.5rem]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-zinc-100 text-sm">{w}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => handleExport(viewDraw.id, format(new Date(viewDraw.createdAt), "yyyy-MM-dd"))}>
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                </div>
              </>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-950/60 border border-red-800/50 shrink-0">
                <Trash2 className="w-4 h-4 text-red-400" />
              </span>
              Delete Draw
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-400 mb-6">
              This draw record will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition disabled:opacity-50"
                disabled={deleting === confirmDeleteId}
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              >
                {deleting === confirmDeleteId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
