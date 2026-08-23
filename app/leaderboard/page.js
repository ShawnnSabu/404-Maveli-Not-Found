"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function Leaderboard() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load.");
      setEntries(data.entries);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 seconds.
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-orange-700">Leaderboard</h1>
        <Link href="/" className="text-sm text-stone-500 underline">
          Home
        </Link>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Finishers of all 4 rounds, ranked by total time.
      </p>

      <button
        onClick={load}
        disabled={refreshing}
        className="mt-4 rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>

      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!entries && !error && (
        <p className="mt-10 animate-pulse text-stone-400">Loading…</p>
      )}

      {entries && entries.length === 0 && (
        <p className="mt-10 text-stone-500">
          No finishers yet. Be the first!
        </p>
      )}

      {entries && entries.length > 0 && (
        <table className="mt-6 w-full border-collapse overflow-hidden rounded-xl bg-white shadow-sm">
          <thead>
            <tr className="bg-orange-100 text-left text-sm tracking-wide text-orange-800 uppercase">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Total time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.rank} className="border-t border-stone-100">
                <td className="px-4 py-3 font-bold">
                  {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : e.rank}
                </td>
                <td className="px-4 py-3">{e.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatTime(e.total_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function formatTime(seconds) {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s.toFixed(2)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(0)}s`;
}
