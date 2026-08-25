"use client";

import { useEffect, useRef, useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

const LOCK_DELAY = 3000;

export default function Round4({ riddles }) {
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  const tickAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const questionAudioRef = useRef(null);

  const riddle = riddles[riddleIndex];

  useEffect(() => {
    if (!questionAudioRef.current) return;

    questionAudioRef.current.currentTime = 0;
    questionAudioRef.current.play().catch(() => {});
  }, [riddleIndex]);

  const playSound = (audioRef) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const stopTickSound = () => {
    if (!tickAudioRef.current) return;

    tickAudioRef.current.pause();
    tickAudioRef.current.currentTime = 0;
  };

  const handleSelect = (index) => {
    if (isLocking || feedback === "checking") return;

    setSelected(index);

    if (feedback === "wrong") {
      setFeedback(null);
    }
  };

  const handleLockClick = () => {
    if (selected === null || isLocking || feedback === "checking") {
      return;
    }

    setShowConfirm(true);
  };

  const handleCancel = () => {
    if (isLocking) return;

    setShowConfirm(false);
  };

  const handleConfirmLock = async () => {
    if (selected === null || isLocking) return;

    setShowConfirm(false);
    setIsLocking(true);
    setFeedback("checking");

    // Start tick-tick sound.
    playSound(tickAudioRef);

    // Wait before revealing the result.
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Stop ticking before result sound.
    stopTickSound();

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
      setIsLocking(false);
      return;
    }

    if (!data.is_correct) {
      playSound(wrongAudioRef);

      setFeedback("wrong");
      setIsLocking(false);
      return;
    }

    // Show thumbs-up animation
    setShowThumbsUp(true);

    setTimeout(() => {
      setShowThumbsUp(false);
    }, 1800);

    // Correct answer.
    playSound(correctAudioRef);

    if (data.game_finished) {
      setIsLocking(false);
      setFinished(true);
      return;
    }

    // Small delay so the success sound can be heard.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (riddleIndex === riddles.length - 1) {
      setIsLocking(false);
      setFinished(true);
      return;
    }

    setRiddleIndex((index) => index + 1);
    setSelected(null);
    setStartedAt(new Date().toISOString());
    setFeedback(null);
    setIsLocking(false);
  };

  if (finished) {
    return <Cutscene round={4} finished />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      {showThumbsUp && (
        <div className="fixed inset-0 z-40 bg-black/50 pointer-events-none" />
      )}

      {showThumbsUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <img
              src="/media/round4/thumbs-up.png"
              alt="Correct!"
              className="h-48 w-48 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      )}
      {/* Audio */}

      <audio
        ref={questionAudioRef}
        src="/media/round4/round4-question.mp3"
        preload="auto"
      />

      <audio
        ref={tickAudioRef}
        src="/media/round4/round4-tick.mp3"
        preload="auto"
      />

      <audio
        ref={correctAudioRef}
        src="/media/round4/round4-correct.mp3"
        preload="auto"
      />

      <audio
        ref={wrongAudioRef}
        src="/media/round4/round4-wrong.mp3"
        preload="auto"
      />

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
            Answer like a real game-show contestant!
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-stone-600">Question {riddleIndex + 1}</span>

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
                Lock your answer carefully!
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
                  disabled={isLocking || feedback === "checking"}
                  onClick={() => handleSelect(index)}
                  className={[
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50/50",
                    isLocking || feedback === "checking"
                      ? "cursor-not-allowed opacity-60"
                      : "",
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

                  <span className="font-bold text-stone-800">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Lock Button */}
          <button
            type="button"
            onClick={handleLockClick}
            disabled={selected === null || isLocking || feedback === "checking"}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLocking ? "🔒 Answer Locked..." : "🔒 Lock Answer"}
          </button>

          {/* Checking / Waiting */}
          {isLocking && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
              <div className="text-3xl">⏳</div>

              <p className="mt-2 font-black text-amber-700">Answer locked!</p>

              <p className="mt-1 text-sm font-semibold text-amber-600">
                Mahabali is checking your answer...
              </p>
            </div>
          )}

          {/* Wrong Answer */}
          {feedback === "wrong" && !isLocking && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <div className="text-3xl">🤔</div>

              <p className="mt-2 font-black text-red-600">Not quite!</p>

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
                <p className="font-semibold text-red-600">{feedback}</p>
              </div>
            )}
        </div>

        {/* Leaderboard */}
        <div className="mt-8 flex justify-center">
          <LeaderboardLink />
        </div>
      </div>

      {/* Lock Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-black text-stone-900">
              Lock cheyyatte?
            </h2>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-stone-500">
              Are you sure you want to lock this answer?
              <br />
              Once locked, Mahabali will reveal the result.
            </p>

            {/* Selected answer preview */}
            <div className="mt-5 rounded-2xl bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                Your Answer
              </p>

              <p className="mt-2 font-black text-stone-800">
                {["A", "B", "C", "D"][selected]} — {riddle.options[selected]}
              </p>
            </div>

            {/* Modal buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-2xl border-2 border-stone-200 bg-white py-3.5 font-black text-stone-600 transition hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLock}
                className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 font-black text-white shadow-lg transition hover:scale-[1.02]"
              >
                🔒 Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
