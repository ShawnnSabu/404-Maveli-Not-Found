"use client";

import { useEffect, useRef, useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 2 — Pookalam Pattern Match.
// Phases: ready -> reveal (target shown for N seconds) -> build -> result.
export default function Round2({ gridSize, palette, emptyColor, revealSeconds, targetPattern }) {
  const [phase, setPhase] = useState("ready"); // ready | reveal | build
  const [countdown, setCountdown] = useState(revealSeconds);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(-1))
  );
  const [status, setStatus] = useState(null); // null | "checking" | "wrong" | error string
  const [cutscene, setCutscene] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());

  // Countdown during the reveal phase.
  useEffect(() => {
    if (phase !== "reveal") return;
    if (countdown <= 0) {
      setPhase("build");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startReveal = () => {
    setGrid(Array.from({ length: gridSize }, () => Array(gridSize).fill(-1)));
    setCountdown(revealSeconds);
    setStatus(null);
    startedAtRef.current = new Date().toISOString();
    setPhase("reveal");
  };

  const cycleTile = (r, c) => {
    if (phase !== "build") return;
    setGrid((g) =>
      g.map((row, ri) =>
        row.map((v, ci) =>
          ri === r && ci === c ? (v + 1) % palette.length : v
        )
      )
    );
  };

  const handleSubmit = async () => {
    setStatus("checking");
    const { ok, data } = await submitAnswer({
      roundId: 2,
      answer: { grid },
      startedAt: startedAtRef.current,
    });

    if (!ok) {
      setStatus(data.error || "Error submitting answer.");
      return;
    }
    if (data.is_correct) {
      setCutscene(true);
    } else {
      setStatus("wrong");
    }
  };

  if (cutscene) return <Cutscene round={2} />;

  return (
    <div className="w-full max-w-xl">
      {phase === "ready" && (
        <div className="rounded-xl border border-orange-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold">Pookalam Pattern Match</h2>
          <p className="mt-2 text-stone-600">
            Memorise the flower pattern — it will be shown for{" "}
            {revealSeconds} seconds, then you rebuild it tile by tile. Click a
            tile to cycle its colour.
          </p>
          <button
            onClick={startReveal}
            className="mt-6 rounded-lg bg-fuchsia-700 px-8 py-3 font-bold text-white transition hover:bg-fuchsia-800"
          >
            Show the pattern
          </button>
        </div>
      )}

      {(phase === "reveal" || phase === "build") && (
        <>
          <h2 className="text-center font-semibold">
            {phase === "reveal"
              ? `Memorise! Hiding in ${countdown}s…`
              : "Rebuild the pattern"}
          </h2>

          <div className="mt-4 flex justify-center">
            <div
              className="grid gap-1 rounded-lg border border-stone-300 bg-white p-3 shadow-sm"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: gridSize }).flatMap((_, r) =>
                Array.from({ length: gridSize }).map((__, c) => {
                  const showTarget = phase === "reveal";
                  const value = showTarget ? targetPattern[r][c] : grid[r][c];
                  const color =
                    value < 0 ? emptyColor : palette[value % palette.length];
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => cycleTile(r, c)}
                      disabled={!showTarget ? phase !== "build" : true}
                      aria-label={`tile ${r}-${c}`}
                      className={[
                        "h-12 w-12 rounded transition-colors",
                        !showTarget && phase === "build"
                          ? "cursor-pointer hover:ring-2 hover:ring-stone-400"
                          : "",
                      ].join(" ")}
                      style={{ backgroundColor: color }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {phase === "build" && (
            <>
              <div className="mt-6 flex items-center justify-center gap-4">
                {palette.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className="inline-block h-6 w-6 rounded border border-stone-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-stone-500">{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={status === "checking"}
                  className="rounded-lg bg-fuchsia-700 px-8 py-3 font-bold text-white transition hover:bg-fuchsia-800 disabled:opacity-50"
                >
                  {status === "checking" ? "Checking…" : "Submit pattern"}
                </button>
              </div>

              {status === "wrong" && (
                <div className="mt-4 text-center">
                  <p className="text-red-600">
                    Not quite — compare your pattern again and retry.
                  </p>
                  <button
                    onClick={startReveal}
                    className="mt-3 underline text-stone-600"
                  >
                    Show the pattern once more & restart attempt
                  </button>
                </div>
              )}
              {typeof status === "string" &&
                status !== "wrong" &&
                status !== "checking" && (
                  <p className="mt-4 text-center text-red-600">{status}</p>
                )}
            </>
          )}
        </>
      )}

      <LeaderboardLink />
    </div>
  );
}
