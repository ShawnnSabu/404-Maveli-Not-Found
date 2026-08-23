"use client";

import Link from "next/link";

// Horizontal 1-2-3-4 step indicator, driven by participants.current_round.
export default function ProgressIndicator({ currentRound }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {[1, 2, 3, 4].map((n) => {
        const done = n < currentRound;
        const active = n === currentRound;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                done
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : active
                    ? "border-orange-500 bg-orange-100 text-orange-700"
                    : "border-stone-300 bg-white text-stone-400",
              ].join(" ")}
            >
              {n}
            </div>
            {n < 4 && (
              <div
                className={`h-1 w-10 rounded ${done ? "bg-emerald-600" : "bg-stone-300"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LeaderboardLink() {
  return (
    <p className="pt-4 text-center text-sm">
      <Link href="/leaderboard" className="text-orange-700 underline">
        View leaderboard
      </Link>
    </p>
  );
}
