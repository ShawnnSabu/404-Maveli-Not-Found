"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// --- Visual layer: animated Maveli illustration + drifting petals ---
// Pure decoration, no logic. Safe to restyle further without touching
// the state machine below.

function MaveliIllustration() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-1/2 w-[260px] -translate-x-1/2 sm:w-[340px] md:w-[400px]">
      {/* golden aura behind him */}
      <div className="absolute left-1/2 top-[38%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5D98B] opacity-30 blur-3xl sm:h-[300px] sm:w-[300px]" />

      <svg
        viewBox="0 0 300 380"
        className="relative animate-maveli-bob"
        role="img"
        aria-label="Illustration of King Mahabali (Maveli)"
      >
        {/* mundu / robe */}
        <path
          d="M85 195 Q75 300 95 360 L205 360 Q225 300 215 195 Z"
          fill="#9C2B2B"
        />
        {/* gold kasavu border at hem */}
        <path
          d="M90 345 Q150 360 210 345 L210 360 Q150 372 90 360 Z"
          fill="#E8B84B"
        />
        {/* torso / belly */}
        <ellipse cx="150" cy="215" rx="75" ry="60" fill="#D98C4A" />
        {/* gold sash across chest */}
        <path
          d="M88 178 Q150 200 212 178 L205 200 Q150 220 95 200 Z"
          fill="#E8B84B"
        />
        {/* left arm raised in blessing */}
        <path
          d="M92 190 Q50 165 42 110"
          stroke="#D98C4A"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
          className="origin-[92px_190px] animate-maveli-wave"
        />
        <circle cx="42" cy="110" r="15" fill="#D98C4A" />
        {/* right arm resting */}
        <path
          d="M208 190 Q245 200 240 240"
          stroke="#D98C4A"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />
        {/* neck */}
        <rect x="135" y="145" width="30" height="30" fill="#E3A76F" />
        {/* head */}
        <circle cx="150" cy="118" r="50" fill="#E3A76F" />
        {/* handlebar mustache */}
        <path
          d="M118 130 Q126 138 138 135"
          stroke="#2B1B12"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M182 130 Q174 138 162 135"
          stroke="#2B1B12"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* smile */}
        <path
          d="M138 143 Q150 148 162 143"
          stroke="#7A4A2B"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* eyes */}
        <circle cx="130" cy="108" r="4" fill="#2B1B12" />
        <circle cx="170" cy="108" r="4" fill="#2B1B12" />
        {/* crown */}
        <path
          d="M100 84 L118 44 L135 74 L150 36 L165 74 L182 44 L200 84 Z"
          fill="#E8B84B"
        />
        <rect x="98" y="80" width="104" height="14" rx="4" fill="#F5D98B" />
        <circle cx="118" cy="50" r="5" fill="#9C2B2B" />
        <circle cx="150" cy="42" r="5" fill="#9C2B2B" />
        <circle cx="182" cy="50" r="5" fill="#9C2B2B" />
      </svg>
    </div>
  );
}

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 97) % 100,
  delay: (i * 1.7) % 6,
  duration: 7 + ((i * 3) % 5),
  size: 10 + ((i * 5) % 10),
}));

function PetalField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="animate-petal-fall absolute top-[-5%] rounded-[60%_0] bg-[#E8B84B]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.7,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

// --- Landing page — always renders itself, never auto-redirects. ---
// Three UI states driven by localStorage + the participants row:
//   "new"        : no participant_id (or stale/invalid one) -> name form
//   "continuing" : participant_id exists, finished_at is null -> Continue
//   "finished"   : participant_id exists, finished_at set -> View Leaderboard
export default function Home() {
  const router = useRouter();
  const [view, setView] = useState("loading"); // loading | new | continuing | finished
  const [participant, setParticipant] = useState(null);
  const [name, setName] = useState("");
  const [accessKey, setAccessKey] = useState("");
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
        body: JSON.stringify({ name, key: accessKey }),
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Twilight sky -> leaf-green ground backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2229] via-[#1B3A38] to-[#2F4B33]" />
      <PetalField />
      <MaveliIllustration />

      {view === "loading" && (
        <p className="relative z-10 animate-pulse text-[#F5D98B]">Loading…</p>
      )}

      {view !== "loading" && (
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#E8B84B]/40 bg-[#0F2229]/70 p-8 shadow-2xl backdrop-blur-md">
          {/* Branding (shared across all states) */}
          <h1 className="text-center font-serif text-4xl font-bold tracking-tight text-[#F5D98B]">
            Maveli
          </h1>
          <h2 className="mt-1 text-center text-xs font-medium tracking-[0.2em] text-[#E8B84B]/80 uppercase">
            48-hour Onam Puzzle Challenge
          </h2>

          {view === "new" && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label htmlFor="name" className="block text-sm font-semibold text-[#F7EFDD]">
                Your name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={80}
                className="w-full rounded-lg border border-[#E8B84B]/30 bg-[#0F2229] px-4 py-3 text-[#F7EFDD] placeholder:text-[#F7EFDD]/40 focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/30 focus:outline-none"
              />
              <label htmlFor="accessKey" className="block text-sm font-semibold text-[#F7EFDD]">
                Access key
              </label>
              <input
                id="accessKey"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter the event key"
                maxLength={80}
                className="w-full rounded-lg border border-[#E8B84B]/30 bg-[#0F2229] px-4 py-3 text-[#F7EFDD] placeholder:text-[#F7EFDD]/40 focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/30 focus:outline-none"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-[#E8B84B] to-[#F5D98B] py-3 font-bold text-[#0F2229] shadow-lg shadow-[#E8B84B]/20 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? "Starting…" : "Start the Challenge"}
              </button>
              <LeaderboardLink />
            </form>
          )}

          {view === "continuing" && participant && (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-lg font-semibold text-[#F7EFDD]">
                Welcome back, {participant.name}! You&apos;re on Round{" "}
                {participant.current_round}.
              </p>
              <button
                onClick={() =>
                  router.push(`/round/${participant.current_round}`)
                }
                className="w-full rounded-lg bg-gradient-to-r from-[#E8B84B] to-[#F5D98B] py-3 font-bold text-[#0F2229] shadow-lg shadow-[#E8B84B]/20 transition hover:brightness-105"
              >
                Continue Challenge
              </button>
              <LeaderboardLink />
            </div>
          )}

          {view === "finished" && participant && (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-lg font-semibold text-[#F7EFDD]">
                You&apos;ve completed the challenge, {participant.name}!
              </p>
              <button
                onClick={() => router.push("/leaderboard")}
                className="w-full rounded-lg bg-gradient-to-r from-[#E8B84B] to-[#F5D98B] py-3 font-bold text-[#0F2229] shadow-lg shadow-[#E8B84B]/20 transition hover:brightness-105"
              >
                View Leaderboard
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes maveli-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes maveli-wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes petal-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(110vh) translateX(30px) rotate(200deg); opacity: 0; }
        }
        .animate-maveli-bob {
          animation: maveli-bob 4s ease-in-out infinite;
        }
        .animate-maveli-wave {
          animation: maveli-wave 2.5s ease-in-out infinite;
        }
        .animate-petal-fall {
          animation: petal-fall linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-maveli-bob,
          .animate-maveli-wave,
          .animate-petal-fall {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}