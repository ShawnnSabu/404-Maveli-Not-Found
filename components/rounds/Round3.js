"use client";

import { useMemo, useRef, useState } from "react";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 3 — Onasadya Sequencing (click-to-order).
export default function Round3({ dishes }) {
  // Deterministic shuffle so the starting order isn't the answer order.
  const shuffled = useMemo(() => {
    const arr = dishes.map((dish, i) => ({ dish, i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1); // simple deterministic shuffle
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [dishes]);

  const [picked, setPicked] = useState([]); // array of dish indexes
  const [status, setStatus] = useState(null);
  const [cutscene, setCutscene] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());

  const pick = (i) => {
    if (picked.includes(i)) return;
    setPicked((p) => [...p, i]);
  };

  const unpick = () => {
    setPicked((p) => p.slice(0, -1));
  };

  const handleSubmit = async () => {
    setStatus("checking");
    const { ok, data } = await submitAnswer({
      roundId: 3,
      answer: { order: picked },
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

  if (cutscene) return <Cutscene round={3} />;

  const remaining = shuffled.filter(({ i }) => !picked.includes(i));

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-xl font-bold">Onasadya Sequencing</h2>
      <p className="mt-1 text-stone-600">
        Click the dishes in the correct serving order, from first to last.
      </p>

      {/* Sequence being built */}
      <div className="mt-6 rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
          Your order ({picked.length}/{dishes.length})
        </h3>
        <ol className="mt-2 space-y-2">
          {picked.map((i, position) => (
            <li
              key={i}
              className="rounded-lg bg-orange-100 px-4 py-3 font-medium"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                {position + 1}
              </span>
              {dishes[i]}
            </li>
          ))}
          {picked.length === 0 && (
            <li className="text-stone-400">Click a dish below to begin…</li>
          )}
        </ol>
        {picked.length > 0 && (
          <button
            onClick={unpick}
            className="mt-3 text-sm text-stone-500 underline"
          >
            Undo last
          </button>
        )}
      </div>

      {/* Available dishes */}
      <div className="mt-6 flex flex-wrap gap-3">
        {remaining.map(({ dish, i }) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={status === "checking"}
            className="rounded-lg border border-stone-300 bg-white px-5 py-3 font-medium shadow-sm transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40"
          >
            {dish}
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={picked.length !== dishes.length || status === "checking"}
          className="rounded-lg bg-orange-700 px-10 py-3 font-bold text-white transition hover:bg-orange-800 disabled:opacity-40"
        >
          {status === "checking" ? "Checking…" : "Submit order"}
        </button>
        {status === "wrong" && (
          <p className="mt-4 text-red-600">Wrong order — rearrange and retry.</p>
        )}
        {typeof status === "string" &&
          status !== "wrong" &&
          status !== "checking" && (
            <p className="mt-4 text-red-600">{status}</p>
          )}
      </div>

      <LeaderboardLink />
    </div>
  );
}
