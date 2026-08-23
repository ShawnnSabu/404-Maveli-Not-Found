"use client";

import { useRouter } from "next/navigation";

const STYLES = {
  1: { bg: "bg-emerald-800", ring: "ring-emerald-500" },
  2: { bg: "bg-fuchsia-900", ring: "ring-fuchsia-500" },
  3: { bg: "bg-orange-800", ring: "ring-orange-500" },
  4: { bg: "bg-indigo-900", ring: "ring-indigo-500" },
};

const TITLES = {
  1: "Round 1 complete!",
  2: "Round 2 complete!",
  3: "Round 3 complete!",
  4: "You finished the game!",
};

// PLACEHOLDER cutscene: full-screen panel with per-round background color,
// placeholder title text and a Continue button. Swap in real art later.
export default function Cutscene({ round, finished = false }) {
  const router = useRouter();
  const style = STYLES[round] ?? STYLES[1];

  const handleContinue = () => {
    if (finished) {
      router.push("/leaderboard");
    } else {
      router.push(`/round/${round + 1}`);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 ${style.bg} text-center`}
    >
      <h1 className="px-6 text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl">
        {TITLES[round]}
      </h1>
      {/* PLACEHOLDER cutscene art/text */}
      <p className="max-w-md px-6 text-lg text-white/80">
        Placeholder cutscene — real artwork and story text will go here.
      </p>
      <button
        onClick={handleContinue}
        className={`rounded-xl bg-white px-10 py-4 text-lg font-bold text-stone-900 shadow-xl ring-4 ${style.ring} transition hover:scale-105`}
      >
        Continue →
      </button>
    </div>
  );
}
