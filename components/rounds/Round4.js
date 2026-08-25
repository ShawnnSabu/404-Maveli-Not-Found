"use client";

import { useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

export default function Round4({ riddles }) {
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState(
    () => new Date().toISOString()
  );

  const riddle = riddles[riddleIndex];

  const handleSubmit = async () => {
    if (selected === null || feedback === "checking") return;

    setFeedback("checking");

    const { ok, data } = await submitAnswer({
      roundId: 4,
      answer: {
        question_index: riddleIndex,
        selected,
      },
      startedAt,
    });

    if (!ok) {
      setFeedback(data?.error || "Error submitting answer.");
      return;
    }

    if (!data.is_correct) {
      setFeedback("wrong");
      return;
    }

    if (data.game_finished) {
      setFinished(true);
      return;
    }

    setRiddleIndex((index) => index + 1);
    setSelected(null);
    setStartedAt(new Date().toISOString());
    setFeedback(null);
  };

  if (finished) {
    return <Cutscene round={4} finished />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />

        <div className="absolute left-[5%] top-[15%] text-7xl opacity-10">
          🌼
        </div>

        <div className="absolute right-[8%] top-[30%] text-8xl opacity-10">
          🌸
        </div>

        <div className="absolute bottom-[15%] left-[15%] text-7xl opacity-10">
          🌺
        </div>

        <div className="absolute bottom-[10%] right-[15%] text-8xl opacity-10">
          🌼
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-600">
            Round 4
          </p>

          <h1 className="mt-2 text-4xl font-black text-stone-900">
            Mahabali&apos;s Riddles
          </h1>

          <p className="mt-3 text-stone-500">
            Solve the riddles and prove your Onam knowledge.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-stone-600">
              Riddle {riddleIndex + 1}
            </span>

            <span className="text-orange-600">
              {riddleIndex + 1} / {riddles.length}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
              style={{
                width: `${((riddleIndex + 1) / riddles.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-xl sm:p-8">
          {/* Question Header */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-2xl shadow-lg">
              🧠
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                Mahabali asks
              </p>

              <p className="mt-1 text-sm font-semibold text-stone-400">
                Think carefully before answering
              </p>
            </div>
          </div>

          {/* Question */}
          <div className="rounded-2xl bg-orange-50 p-6">
            <p className="text-lg font-bold leading-relaxed text-stone-800 sm:text-xl">
              {riddle.prompt}
            </p>
          </div>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {riddle.options.map((option, index) => {
              const isSelected = selected === index;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={feedback === "checking"}
                  onClick={() => {
                    setSelected(index);

                    if (feedback === "wrong") {
                      setFeedback(null);
                    }
                  }}
                  className={[
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50/50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black",
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-stone-100 text-stone-600",
                    ].join(" ")}
                  >
                    {["A", "B", "C", "D"][index]}
                  </span>

                  <span className="font-bold text-stone-800">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              selected === null || feedback === "checking"
            }
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {feedback === "checking"
              ? "Checking..."
              : "Submit Answer →"}
          </button>

          {/* Wrong Answer */}
          {feedback === "wrong" && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <div className="text-3xl">🤔</div>

              <p className="mt-2 font-black text-red-600">
                Not quite!
              </p>

              <p className="mt-1 text-sm font-semibold text-red-500">
                Think again and try another answer.
              </p>
            </div>
          )}

          {/* Error */}
          {typeof feedback === "string" &&
            feedback !== "wrong" &&
            feedback !== "checking" && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="font-semibold text-red-600">
                  {feedback}
                </p>
              </div>
            )}
        </div>

        {/* Leaderboard */}
        <div className="mt-8 flex justify-center">
          <LeaderboardLink />
        </div>
      </div>
    </div>
  );
}