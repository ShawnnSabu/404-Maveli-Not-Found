"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Session handling: check localStorage first, resume at current_round.
  useEffect(() => {
    const participantId = localStorage.getItem("maveli_participant_id");
    if (!participantId) {
      setChecking(false);
      return;
    }

    fetch(`/api/participant?id=${encodeURIComponent(participantId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ participant }) => {
        if (participant.finished_at) {
          router.replace("/leaderboard");
        } else {
          router.replace(`/round/${participant.current_round}`);
        }
      })
      .catch(() => {
        localStorage.removeItem("maveli_participant_id");
        setChecking(false);
      });
  }, [router]);

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

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-black text-orange-700">
          Maveli
        </h1>
        <h2 className="mt-1 text-center text-sm font-medium tracking-wide text-stone-500 uppercase">
          48-hour Onam Puzzle Challenge
        </h2>

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
            {submitting ? "Starting…" : "Start the challenge"}
          </button>
        </form>
      </div>
    </main>
  );
}
