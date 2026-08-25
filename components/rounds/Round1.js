"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 1 — Guess the Song and Movie.
//
// Every question has a muted background video (bgVideo) that plays while guessing,
// rendered FULL-SCREEN behind the whole page (not confined to the option card).
// Audio is dynamically trimmed from a single source file:
//   "song"  — autoplays teaser section (teaserStart to teaserEnd); on correct
//             answer, reward section plays (rewardStart to rewardEnd).
//   "movie" — silent while guessing; on correct answer, reward section plays.
// Wrong answers play question.wrongAudio, falling back to /media/round1/error.mp3.

// Default wrong-answer sound used when a question has no wrongAudio override.
export const ROUND1_ERROR_AUDIO = "/media/round1/error.mp3";

// Fallback seconds shown on the "Next question in…" countdown when there is
// no reward audio to measure against.
const CORRECT_COUNTDOWN_FALLBACK_SECONDS = 3;

// localStorage key so a mid-round refresh resumes at the right question
// (the server tracks progress by counting correct attempts, so the client
// must stay in sync with it).
const PROGRESS_KEY = "maveli_r1_progress";
export default function Round1({ questions }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [phase, setPhase] = useState(null); // null | "checking" | "wrong" | "correct" | string(error)
  const [cutscene, setCutscene] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [countdown, setCountdown] = useState(null); // seconds left before next question

  const question = questions[questionIndex];

  const bgVideoRef = useRef(null);
  const audioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const pendingRef = useRef(null); // { round_advanced } once a correct answer is confirmed
  const activeModeRef = useRef("teaser"); // Tracks playback state: "teaser" | "reward"
  const fallbackTimerRef = useRef(null);

  // Restore saved position after a mid-round refresh.
  useEffect(() => {
    const saved = Number(localStorage.getItem(PROGRESS_KEY));
    if (Number.isInteger(saved) && saved > 0 && saved < questions.length) {
      setQuestionIndex(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the right media whenever the question changes.
  useEffect(() => {
    setPhase(null);
    setCountdown(null);
    activeModeRef.current = "teaser";
    localStorage.setItem(PROGRESS_KEY, String(questionIndex));

    if (bgVideoRef.current) {
      bgVideoRef.current.src = question.bgVideo;
      bgVideoRef.current.play().catch(() => {});
    }

    if (question.audio && audioRef.current) {
      const audio = audioRef.current;
      audio.src = question.audio;
      audio.currentTime = question.teaserStart || 0;

      if (question.type === "song") {
        audio.play().catch(() => {});
      }
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [questionIndex, question]);

  // Monitors audio time updates to enforce custom start/end trims.
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeModeRef.current === "teaser" && question.teaserEnd != null) {
      if (audio.currentTime >= question.teaserEnd) {
        audio.pause();
      }
    } else if (activeModeRef.current === "reward" && question.rewardEnd != null) {
      setCountdown(Math.max(0, Math.ceil(question.rewardEnd - audio.currentTime)));
      if (audio.currentTime >= question.rewardEnd) {
        audio.pause();
        advance();
      }
    }
  };

  // Countdown used when there is no reward audio to measure against.
  const startFallbackCountdown = (seconds) => {
    let left = seconds;
    setCountdown(left);
    fallbackTimerRef.current = setInterval(() => {
      left -= 1;
      setCountdown(left);
      if (left <= 0) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
        advance();
      }
    }, 1000);
  };

  const advance = () => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending) return;

    if (pending.round_advanced) {
      localStorage.removeItem(PROGRESS_KEY);
      setCutscene(true);
    } else {
      setQuestionIndex((i) => i + 1);
      setStartedAt(new Date().toISOString());
      setPhase(null);
    }
  };

  const handleSelect = async (selected) => {
    if (phase === "checking" || phase === "correct") return;
    setPhase("checking");
    
    // Pause any playing audio when submitting an answer
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const { ok, data } = await submitAnswer({
      roundId: 1,
      answer: { question_index: questionIndex, selected },
      startedAt,
    });

    if (!ok) {
      // Server disagrees on position (e.g. stale attempts after a refresh).
      // Jump to the question the server actually expects and continue.
      const expected = data?.expected_index;
      if (Number.isInteger(expected) && expected !== questionIndex && expected < questions.length) {
        setQuestionIndex(expected);
        setStartedAt(new Date().toISOString());
        setPhase(null);
        return;
      }
      setPhase(data.error || "Error submitting answer.");
      return;
    }

    if (data.is_correct) {
      setPhase("correct");
      pendingRef.current = { round_advanced: data.round_advanced };

      if (audioRef.current && question.audio) {
        activeModeRef.current = "reward";
        audioRef.current.currentTime = question.rewardStart || 0;
        audioRef.current.play().catch(() => {});
      } else {
        startFallbackCountdown(CORRECT_COUNTDOWN_FALLBACK_SECONDS);
      }
    } else {
      // Wrong answer: unlimited retries, no penalty — plays error sound
      setPhase("wrong");
      if (wrongAudioRef.current) {
        wrongAudioRef.current.src = question.wrongAudio || ROUND1_ERROR_AUDIO;
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => {});
      }
      if (question.type === "song") setShakeKey((k) => k + 1);
    }
  };

  const replayTeaser = () => {
    if (audioRef.current && question.type === "song") {
      activeModeRef.current = "teaser";
      audioRef.current.currentTime = question.teaserStart || 0;
      audioRef.current.play().catch(() => {});
    }
  };

  if (cutscene) return <Cutscene round={1} />;

  return (
    <>
      {/* Full-screen background video covering the entire viewport */}
      <div className="fixed inset-0 z-0">
        <video
          ref={bgVideoRef}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F2229]/70" />
      </div>

      {/* Single Audio element with onTimeUpdate trimmer */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={advance}
      />
      <audio ref={wrongAudioRef} />

      <div className="relative z-10 mx-auto w-full max-w-xl p-6">
        <p className="text-sm font-semibold tracking-wide text-[#E8B84B] uppercase">
          Question {questionIndex + 1} of {questions.length}
        </p>

        <h2 className="mt-2 rounded-xl border border-[#E8B84B]/40 bg-[#0F2229]/70 p-6 text-xl font-bold text-[#F7EFDD] shadow-sm backdrop-blur-md">
          {question.prompt}
        </h2>

        {question.type === "song" && (
          <button
            onClick={replayTeaser}
            className="mt-3 text-sm text-[#E8B84B] underline underline-offset-2"
          >
            Play clip again
          </button>
        )}

        <motion.div
          key={shakeKey}
          animate={
            phase === "wrong" && question.type === "song"
              ? { x: [0, -10, 10, -10, 10, -6, 6, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.5 }}
          className="mt-6 grid gap-3"
        >
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={phase === "checking" || phase === "correct"}
              animate={
                phase === null
                  ? { rotate: [0, -1.5, 1.5, -1.5, 0] }
                  : { rotate: 0 }
              }
              transition={{
                duration: 2.4,
                repeat: phase === null ? Infinity : 0,
                repeatDelay: 1.2,
                ease: "easeInOut",
              }}
              className="rounded-lg border border-[#E8B84B]/30 bg-[#0F2229]/60 px-5 py-4 text-left font-medium text-[#F7EFDD] shadow-sm backdrop-blur-md transition hover:border-[#E8B84B] hover:bg-[#0F2229]/80 disabled:opacity-60"
            >
              {option}
            </motion.button>
          ))}
        </motion.div>

        {phase === "wrong" && (
          <p className="mt-4 text-center text-red-400">
            Not quite — try again!
          </p>
        )}
        {phase === "correct" && (
          <p className="mt-4 text-center font-semibold text-[#F5D98B]">
            Correct!{" "}
            {countdown != null && (
              <span>
                {pendingRef.current?.round_advanced
                  ? `Finishing up in ${countdown}…`
                  : `Next question in ${countdown}…`}
              </span>
            )}
          </p>
        )}
        {typeof phase === "string" &&
          phase !== "wrong" &&
          phase !== "correct" &&
          phase !== "checking" && (
            <p className="mt-4 text-center text-red-400">{phase}</p>
          )}

        <LeaderboardLink />
      </div>
    </>
  );
}