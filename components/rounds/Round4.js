"use client";

import { useEffect, useRef, useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

const LOCK_DELAY = 3000;

// localStorage key so a mid-round refresh resumes at the right riddle
// (the server tracks progress by counting correct attempts, so the client
// must stay in sync with it).
const PROGRESS_KEY = "maveli_r4_progress";

export default function Round4({ riddles }) {
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [livesLeft, setLivesLeft] = useState(3);

  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  const tickAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const questionAudioRef = useRef(null);
  const bgVideoRef = useRef(null);

  const riddle = riddles[riddleIndex];

  // Restore saved position after a mid-round refresh, and keep it saved.
  useEffect(() => {
    const saved = Number(localStorage.getItem(PROGRESS_KEY));
    if (Number.isInteger(saved) && saved > 0 && saved < riddles.length) {
      setRiddleIndex(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, String(riddleIndex));
  }, [riddleIndex]);

  // Background video (carries its own soundtrack) — drop your licensed
  // file in at /media/round4/bg-video.mp4. It plays fixed behind
  // everything, ducked under a dark overlay so the question card stays
  // readable.
  //
  // Set a trim point if the file has trailing content you don't want
  // repeating — leave as null to loop the whole clip natively.
  const LOOP_END_SECONDS = 23; // trims the clip to its first 23s, then loops

  // Autoplay with sound, no tap required: by the time someone reaches
  // Round 4 they've already clicked buttons in earlier rounds, and most
  // browsers treat that prior interaction as having "unlocked" audio
  // autoplay for the rest of the tab/session — so we can just try
  // playing unmuted right away instead of waiting for another click.
  //
  // If that gets blocked anyway (e.g. a browser that resets the unlock,
  // or someone landing here as their very first interaction), we fall
  // back to starting muted immediately — so playback still buffers with
  // zero lag — and unmute on the very next click as a last resort.
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    video.volume = 0.35;
    video.muted = false;

    video.play().catch(() => {
      // Unmuted playback was blocked — start muted instead so it's
      // buffered and ready, and unmute on first click.
      video.muted = true;
      video.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const unmuteVideo = () => {
      const video = bgVideoRef.current;
      if (video && video.muted) {
        video.muted = false;
        video.volume = 0.35;
        video.play().catch(() => {});
      }
      window.removeEventListener("click", unmuteVideo);
    };
    window.addEventListener("click", unmuteVideo);
    return () => window.removeEventListener("click", unmuteVideo);
  }, []);

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video || LOOP_END_SECONDS == null) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= LOOP_END_SECONDS) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

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

    // Duck background video's audio, start tick-tick sound.
    if (bgVideoRef.current) bgVideoRef.current.volume = 0.1;
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

    if (bgVideoRef.current) bgVideoRef.current.volume = 0.35;

    if (!ok) {
      // Server disagrees on position (e.g. stale attempts after a refresh).
      // Jump to the riddle the server actually expects and continue.
      const expected = data?.expected_index;
      if (
        Number.isInteger(expected) &&
        expected !== riddleIndex &&
        expected < riddles.length
      ) {
        setRiddleIndex(expected);
        setSelected(null);
        setStartedAt(new Date().toISOString());
        setFeedback(null);
        setIsLocking(false);
        return;
      }
      setFeedback(data?.error || "Error submitting answer.");
      setIsLocking(false);
      return;
    }

    if (!data.is_correct) {
      playSound(wrongAudioRef);
      setLivesLeft((n) => Math.max(0, n - 1));

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
    localStorage.removeItem(PROGRESS_KEY);
    return <Cutscene round={4} finished />;
  }

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0620] px-4 py-6 text-white">
      {showThumbsUp && (
        <div className="fixed inset-0 z-40 bg-black/60 pointer-events-none" />
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

      {/* Background video — plays fixed behind everything, carries its
          own soundtrack. No native `loop` when LOOP_END_SECONDS is set,
          since looping is then handled manually in JS.
          Left unblurred here on purpose — the rotating circle art on
          the left/right sides of the source clip should stay crisp.
          A separate blur panel below covers just the center strip
          (behind the card) instead of blurring the whole frame. */}
      <video
        ref={bgVideoRef}
        src="/media/round4/bg-video.mp4"
        className="fixed inset-0 -z-20 h-full w-full object-cover"
        playsInline
        autoPlay
        muted
        loop={LOOP_END_SECONDS == null}
        preload="auto"
      />

      {/* Center blur panel — uses backdrop-blur so only this strip of
          the video reads as soft, leaving the sides (rotating circles)
          sharp underneath. Feathered via mask so there's no hard seam. */}
      <div
        className="fixed inset-y-0 left-[12%] right-[12%] -z-[15] backdrop-blur-2xl"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      />

      {/* Dark + tint overlay so the question card stays readable over the video. */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#1a0620]/85 via-[#3a0f3f]/70 to-[#1a0620]/82" />
      {/* Solid strip at the very top only, to hide the source clip's
          baked-in title text/logo — unrelated to the blur above. */}
      <div className="fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[#1a0620] from-40% via-[#1a0620]/95 to-transparent" />

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

      {/* Ambient glow + original Onam-style floral corner motifs, sitting
          above the background video's dark overlay. These are our own
          decorative shapes, not the show's logo/artwork. */}
      <div className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[110px]" />
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

        {/* Simple original floral/mandala corner ornaments, echoing an
            Onam pookalam without copying any show branding. Slowly
            rotating for a bit of ambient life. */}
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* Top bar: share (left), round label (center), lives / show badge (right) */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur transition hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 10.5l6.8-3.9M8.6 13.5l6.8 3.9" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-300">
              Round 4
            </p>
            <p className="text-xs font-semibold text-white/50">Mahabali&apos;s Riddles</p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
            {Array.from({ length: 3 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${i < livesLeft ? "fill-red-500 text-red-500" : "fill-transparent text-white/25"}`}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.2 1.6 6.6 4.6 5.1 7 3.9 9.7 4.7 12 7.2c2.3-2.5 5-3.3 7.4-2.1 3 1.5 3.6 5.1 1.9 7.8C18.7 16.65 12 21 12 21z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {riddles.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === riddleIndex
                  ? "w-8 bg-gradient-to-r from-amber-300 to-yellow-500"
                  : i < riddleIndex
                  ? "w-1.5 bg-amber-400/60"
                  : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Diamond / hexagon question banner */}
        <div className="relative mx-auto mb-10 max-w-2xl">
          {/* Small eyebrow badge floating above the banner */}
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-[#2a0a2e]/80 px-4 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.25)] backdrop-blur">
              🪔 Mahabali Asks
            </span>
          </div>

          <div
            className="relative overflow-hidden border-2 border-amber-300/80 bg-gradient-to-br from-[#7a2a68] via-[#5a1a4f] to-[#230814] px-9 py-8 shadow-[0_0_45px_rgba(216,70,160,0.45)]"
            style={{ clipPath: "polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)" }}
          >
            {/* inner hairline border for a layered, engraved look */}
            <div
              className="pointer-events-none absolute inset-[6px] border border-amber-200/25"
              style={{ clipPath: "polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)" }}
            />
            {/* soft radial glow behind the text */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,214,120,0.18)_0%,_transparent_65%)]" />
            {/* diagonal shimmer sweep */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <p className="relative text-center text-lg font-bold leading-relaxed tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-xl">
              {riddle.prompt}
            </p>
          </div>

          {/* corner diamond studs, one at each point of the hexagon */}
          <div className="absolute -top-2 left-8 h-2.5 w-2.5 rotate-45 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
          <div className="absolute -bottom-2 right-10 h-2.5 w-2.5 rotate-45 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
          <div className="absolute -left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-amber-200/80 shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
          <div className="absolute -right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-amber-200/80 shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
        </div>

        {/* Options — 2x2 hexagon-badge grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {riddle.options.map((option, index) => {
            const isSelected = selected === index;

            return (
              <button
                key={option}
                type="button"
                disabled={isLocking || feedback === "checking"}
                onClick={() => handleSelect(index)}
                className={[
                  "group flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all backdrop-blur",
                  isSelected
                    ? "border-amber-300 bg-gradient-to-r from-amber-400/25 to-amber-300/10 shadow-[0_0_20px_rgba(252,211,77,0.35)]"
                    : "border-white/15 bg-white/[0.04] hover:border-fuchsia-300/50 hover:bg-white/[0.08]",
                  isLocking || feedback === "checking" ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center font-black text-sm",
                    isSelected
                      ? "bg-amber-300 text-[#2a0a2e]"
                      : "bg-white/10 text-white/80 group-hover:bg-fuchsia-300/20 group-hover:text-fuchsia-200",
                  ].join(" ")}
                  style={{ clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" }}
                >
                  {optionLetters[index]}
                </span>

                <span className="font-semibold text-white/90">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Lock Button */}
        <button
          type="button"
          onClick={handleLockClick}
          disabled={selected === null || isLocking || feedback === "checking"}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-4 text-lg font-black text-[#1a1200] shadow-[0_0_25px_rgba(252,211,77,0.4)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isLocking ? "🔒 Answer Locked..." : "🔒 Lock cheyyatte?"}
        </button>

        {/* Checking / Waiting */}
        {isLocking && (
          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-center backdrop-blur">
            <div className="text-3xl">⏳</div>
            <p className="mt-2 font-black text-amber-200">Answer locked!</p>
            <p className="mt-1 text-sm font-semibold text-amber-200/70">
              Mahabali is checking your answer...
            </p>
          </div>
        )}

        {/* Wrong Answer */}
        {feedback === "wrong" && !isLocking && (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-center backdrop-blur">
            <div className="text-3xl">🤔</div>
            <p className="mt-2 font-black text-red-300">Not quite!</p>
            <p className="mt-1 text-sm font-semibold text-red-300/70">
              Think again and try another answer.
            </p>
          </div>
        )}

        {/* Error */}
        {typeof feedback === "string" &&
          feedback !== "wrong" &&
          feedback !== "checking" && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-center backdrop-blur">
              <p className="font-semibold text-red-300">{feedback}</p>
            </div>
          )}

        {/* Leaderboard */}
        <div className="mt-8 flex justify-center">
          <LeaderboardLink />
        </div>
      </div>

      {/* Lock Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-300/30 bg-gradient-to-b from-[#5a1a4f] to-[#1a0620] p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-300/15 text-4xl">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">Lock cheyyatte?</h2>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-white/60">
              Are you sure you want to lock this answer?
              <br />
              Once locked, Mahabali will reveal the result.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                Your Answer
              </p>
              <p className="mt-2 font-black text-white">
                {optionLetters[selected]} — {riddle.options[selected]}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-full border border-white/20 bg-white/5 py-3.5 font-black text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLock}
                className="flex-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 py-3.5 font-black text-[#1a1200] shadow-lg transition hover:scale-[1.02]"
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
