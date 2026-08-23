"use client";

import { useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 4 — Mahabali Riddles (sequential text-input riddles).
export default function Round4({ riddles }) {
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [text, setText] = useState("");
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const riddle = riddles[riddleIndex];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || feedback === "checking") return;
    setFeedback("checking");

    const { ok, data } = await submitAnswer({
      roundId: 4,
      answer: { riddle_index: riddleIndex, text },
      startedAt,
    });

    if (!ok) {
      setFeedback(data.error || "Error submitting answer.");
      return;
    }

    if (data.is_correct) {
      if (data.game_finished) {
        setFinished(true);
        return;
      }
      setRiddleIndex((i) => i + 1);
      setText("");
      setStartedAt(new Date().toISOString());
      setFeedback(null);
    } else {
      setFeedback("wrong");
    }
  };

  if (finished) return <Cutscene round={4} finished />;

  return (
    <div className="w-full max-w-xl">
      <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
        Riddle {riddleIndex + 1} of {riddles.length}
      </p>
      <h2 className="mt-2 rounded-xl border border-indigo-200 bg-white p-6 text-xl font-bold shadow-sm">
        {riddle.prompt}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your answer…"
          className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || feedback === "checking"}
          className="w-full rounded-lg bg-indigo-700 py-3 font-bold text-white transition hover:bg-indigo-800 disabled:opacity-40"
        >
          {feedback === "checking" ? "Checking…" : "Submit answer"}
        </button>
      </form>

      {feedback === "wrong" && (
        <p className="mt-4 text-center text-red-600">
          Not quite — think again!
        </p>
      )}
      {typeof feedback === "string" && feedback !== "wrong" && (
        <p className="mt-4 text-center text-red-600">{feedback}</p>
      )}

      <LeaderboardLink />
    </div>
  );
}
