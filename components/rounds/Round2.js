"use client";

import { useEffect, useRef, useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

const POOKALAM_IMAGES = [
  "/media/pookalam1.jpg",
  "/media/pookalam2.jpg",
  "/media/pookalam3.jpg",
];

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  const solved = result.every((value, index) => value === index);

  if (solved) {
    [result[0], result[1]] = [result[1], result[0]];
  }

  return result;
}

export default function Round2({ imageSrc, gridSize, revealSeconds }) {
  const [phase, setPhase] = useState("ready");
  const [countdown, setCountdown] = useState(revealSeconds);
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [status, setStatus] = useState(null);
  const [cutscene, setCutscene] = useState(false);
  const [showMemoryBackground, setShowMemoryBackground] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageSrc);

  const startedAtRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const bgAudioRef = useRef(null);

  const [wrongAudioPlaying, setWrongAudioPlaying] = useState(false);

  const totalTiles = gridSize * gridSize;

  useEffect(() => {
    wrongAudioRef.current = new Audio("/media/wrong-pookalam.mp3");
    wrongAudioRef.current.preload = "auto";

    bgAudioRef.current = new Audio("/media/pookalam-bg.mp3");
    bgAudioRef.current.preload = "auto";
    bgAudioRef.current.loop = true;

    return () => {
      wrongAudioRef.current?.pause();
      bgAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (phase !== "reveal") return;

    if (countdown <= 0) {
      setTiles(shuffle(Array.from({ length: totalTiles }, (_, i) => i)));
      setShowMemoryBackground(true);

      if (bgAudioRef.current) {
        bgAudioRef.current.currentTime = 0;
        bgAudioRef.current.play().catch((error) => {
          console.error("Background audio playback failed:", error);
        });
      }

      setPhase("build");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdown, totalTiles]);

  const startGame = () => {
    if (wrongAudioRef.current) {
      wrongAudioRef.current.pause();
      wrongAudioRef.current.currentTime = 0;
      setWrongAudioPlaying(false);
    }

    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }

    const randomImage =
      POOKALAM_IMAGES[Math.floor(Math.random() * POOKALAM_IMAGES.length)];

    setCurrentImage(randomImage);

    startedAtRef.current = new Date().toISOString();

    setCountdown(revealSeconds);
    setSelectedTile(null);
    setStatus(null);
    setShowMemoryBackground(false);
    setPhase("reveal");
  };

  const handleTileClick = (position) => {
    if (phase !== "build") return;

    if (selectedTile === null) {
      setSelectedTile(position);
      return;
    }

    if (selectedTile === position) {
      setSelectedTile(null);
      return;
    }

    setTiles((current) => {
      const next = [...current];

      [next[selectedTile], next[position]] = [
        next[position],
        next[selectedTile],
      ];

      return next;
    });

    setSelectedTile(null);
  };

  const handleSubmit = async () => {
    if (!startedAtRef.current) return;

    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }

    setShowMemoryBackground(false);
    setStatus("checking");

    const { ok, data } = await submitAnswer({
      roundId: 2,
      answer: {
        order: tiles,
      },
      startedAt: startedAtRef.current,
    });

    if (!ok) {
      setStatus(data?.error || "Error submitting answer.");
      return;
    }

    if (data.is_correct) {
      setCutscene(true);
    } else {
      setStatus("wrong");

      if (wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        setWrongAudioPlaying(true);

        wrongAudioRef.current.onended = () => {
          setWrongAudioPlaying(false);
        };

        wrongAudioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
          setWrongAudioPlaying(false);
        });
      }
    }
  };

  const getTileStyle = (tileIndex) => {
    const row = Math.floor(tileIndex / gridSize);
    const col = tileIndex % gridSize;

    return {
      backgroundImage: `url(${currentImage})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`,
    };
  };

  if (cutscene) {
    return <Cutscene round={2} />;
  }

  return (
    <div className="w-full max-w-2xl">
      {phase === "ready" && (
        <div className="rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-lg">
          <div className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-orange-600">
            The Pookalam Challenge
          </div>

          <h2 className="text-3xl font-black text-stone-900">
            Can you remember the Pookalam?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-stone-600">
            A beautiful Pookalam will appear for a few seconds. Memorise the
            complete image and every tile position.
          </p>

          <button
            onClick={startGame}
            className="mt-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-black text-white shadow-lg transition hover:scale-105"
          >
            Reveal the Pookalam →
          </button>
        </div>
      )}

      {phase === "reveal" && (
        <div className="text-center">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-600">
              Memorise
            </p>

            <h2 className="mt-2 text-3xl font-black text-stone-900">
              Remember the pattern
            </h2>

            <p className="mt-2 text-stone-500">
              Disappearing in {countdown}s...
            </p>
          </div>

          <div
            className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl border-8 border-white shadow-2xl"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      )}

      {phase === "build" && (
        <div className="relative min-h-screen w-full overflow-hidden text-center">
          {showMemoryBackground && (
            <video
              className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-100"
              src="/media/memory-tunnel.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                filter: "brightness(1.15) contrast(1.25) saturate(1.15)",
              }}
            />
          )}

          <div className="relative z-10 w-full px-4 py-8">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-600">
                Your Turn
              </p>

              <h2 className="mt-2 text-3xl font-black text-stone-900">
                Recreate the Pookalam
              </h2>

              <p className="mx-auto mt-3 w-fit rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-stone-800 shadow-md">
                Tap two tiles to swap their positions.
              </p>
            </div>

            {/* Puzzle — large and centered */}
            <div className="flex w-full justify-center">
              <div
                className="relative z-10 grid aspect-square w-full max-w-[580px] gap-1 rounded-3xl bg-white p-3 shadow-2xl"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {tiles.map((tileIndex, position) => (
                  <button
                    key={position}
                    onClick={() => handleTileClick(position)}
                    className={[
                      "relative aspect-square overflow-hidden transition-all duration-200",
                      selectedTile === position
                        ? "z-10 scale-95 rounded-xl ring-4 ring-orange-500"
                        : "rounded-sm hover:scale-[0.97]",
                    ].join(" ")}
                    style={getTileStyle(tileIndex)}
                    aria-label={`Tile ${position + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Original Pookalam — bottom right */}
            <div className="fixed bottom-5 right-5 z-20 w-[280px] xl:w-[340px]">
              <div className="rounded-3xl border-4 border-white bg-white p-4 shadow-2xl">
                <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.2em] text-orange-600">
                  Original Pookalam
                </p>

                <img
                  src={currentImage}
                  alt="Original Pookalam"
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <button
                onClick={handleSubmit}
                disabled={status === "checking"}
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-10 py-4 text-lg font-black text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
              >
                {status === "checking" ? "Checking..." : "Submit Pookalam →"}
              </button>
            </div>

            {status === "wrong" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-2xl">
                  <div className="mb-4 text-7xl animate-bounce">😄</div>

                  <div className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
                    Pookalam Challenge
                  </div>

                  <h3 className="text-3xl font-black text-stone-900">
                    Oops! Not quite!
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-base font-medium leading-relaxed text-stone-600">
                    Your Pookalam is a little mixed up.
                    <br />
                    Let's see if you can get it this time!
                  </p>

                  <button
                    onClick={startGame}
                    className="mt-7 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03] active:scale-95"
                  >
                    🔄 Try Again
                  </button>
                </div>
              </div>
            )}

            {typeof status === "string" &&
              status !== "wrong" &&
              status !== "checking" && (
                <p className="relative z-10 mt-4 text-red-600">{status}</p>
              )}
          </div>
        </div>
      )}

      <LeaderboardLink />
    </div>
  );
}
