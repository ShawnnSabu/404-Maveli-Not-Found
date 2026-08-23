"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Landing page — always renders itself, never auto-redirects.
// Three UI states driven by localStorage + the participants row:
//   "new"        : no participant_id (or stale/invalid one) -> name form
//   "continuing" : participant_id exists, finished_at is null -> Continue
//   "finished"   : participant_id exists, finished_at set -> View Leaderboard
export default function Home() {
  const router = useRouter();
  const [view, setView] = useState("loading"); // loading | new | continuing | finished
  const [participant, setParticipant] = useState(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // On load: check localStorage, then fetch the participant row to decide
  // between the continuing / finished states. Stale or missing rows fall
  // back to "new" and clear the bad localStorage value.
  useEffect(() => {
    const participantId = localStorage.getItem("maveli_participant_id");
    if (!participantId) {
      setView("new");
      return;
    }

    fetch(`/api/participant?id=${encodeURIComponent(participantId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("stale"))))
      .then(({ participant }) => {
        setParticipant(participant);
        setView(participant.finished_at ? "finished" : "continuing");
      })
      .catch(() => {
        localStorage.removeItem("maveli_participant_id");
        setParticipant(null);
        setView("new");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      localStorage.setItem("maveli_participant_id", data.participant.id);
      router.push("/round/1");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (view === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-8 shadow-lg">
        {/* Branding (shared across all states) */}
        <h1 className="text-center text-3xl font-black text-orange-700">
          Maveli
        </h1>
        <h2 className="mt-1 text-center text-sm font-medium tracking-wide text-stone-500 uppercase">
          48-hour Onam Puzzle Challenge
        </h2>

        {view === "new" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label htmlFor="name" className="block text-sm font-semibold">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={80}
              className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? "Starting…" : "Start the Challenge"}
            </button>
            <LeaderboardLink />
          </form>
        )}

        {view === "continuing" && participant && (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-lg font-semibold text-stone-700">
              Welcome back, {participant.name}! You&apos;re on Round{" "}
              {participant.current_round}.
            </p>
            <button
              onClick={() =>
                router.push(`/round/${participant.current_round}`)
              }
              className="w-full rounded-lg bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              Continue Challenge
            </button>
            <LeaderboardLink />
          </div>
        )}

        {view === "finished" && participant && (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-lg font-semibold text-stone-700">
              You&apos;ve completed the challenge, {participant.name}!
            </p>
            <button
              onClick={() => router.push("/leaderboard")}
              className="w-full rounded-lg bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              View Leaderboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
