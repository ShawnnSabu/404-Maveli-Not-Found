"use client";

import { useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 1 — Guess the Song and Movie (multiple choice, sequential questions).
export default function Round1({ questions }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [feedback, setFeedback] = useState(null); // null | "wrong" | "checking"
  const [cutscene, setCutscene] = useState(false);

  const question = questions[questionIndex];

  const handleSelect = async (selected) => {
    if (feedback === "checking") return;
    setFeedback("checking");

    const { ok, data } = await submitAnswer({
      roundId: 1,
      answer: { question_index: questionIndex, selected },
      startedAt,
    });

    if (!ok) {
      setFeedback(data.error || "Error submitting answer.");
      return;
    }

    if (data.is_correct) {
      if (data.round_advanced) {
        setCutscene(true);
        return;
      }
      setQuestionIndex((i) => i + 1);
      setStartedAt(new Date().toISOString());
      setFeedback(null);
    } else {
      // Wrong-answer handling: unlimited retries, no penalty.
      setFeedback("wrong");
    }
  };

  if (cutscene) return <Cutscene round={1} />;

  return (
    <div className="w-full max-w-xl">
      <p className="text-sm font-semibold tracking-wide text-orange-700 uppercase">
        Question {questionIndex + 1} of {questions.length}
      </p>
      <h2 className="mt-2 rounded-xl border border-orange-200 bg-white p-6 text-xl font-bold shadow-sm">
        {question.prompt}
      </h2>

      <div className="mt-6 grid gap-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={feedback === "checking"}
            className="rounded-lg border border-stone-300 bg-white px-5 py-4 text-left font-medium shadow-sm transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-60"
          >
            {option}
          </button>
        ))}
      </div>

      {feedback === "wrong" && (
        <p className="mt-4 text-center text-red-600">
          Not quite — try again!
        </p>
      )}
      {typeof feedback === "string" && feedback !== "wrong" && (
        <p className="mt-4 text-center text-red-600">{feedback}</p>
      )}

      <LeaderboardLink />
    </div>
  );
}
