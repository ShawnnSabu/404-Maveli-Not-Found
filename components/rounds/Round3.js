"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { submitAnswer } from "@/lib/clientApi";
import Cutscene from "@/components/Cutscene";
import { LeaderboardLink } from "@/components/ProgressIndicator";

// Round 3 — Onasadya Sequencing, drag-to-leaf version.
// Dropping a dish icon anywhere on the leaf counts it as "placed" —
// exact position doesn't matter, only the ORDER dishes are placed in.
// Dragging a placed dish back off the leaf un-places it.
export default function Round3({ dishes, leafImage }) {
  const [placedOrder, setPlacedOrder] = useState([]); // chronological array of dish indexes
  const [status, setStatus] = useState(null);
  const [cutscene, setCutscene] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());
  const leafRef = useRef(null);
  const dialogueRef = useRef(null);

  const isPlaced = (i) => placedOrder.includes(i);
  const unplaced = dishes.map((d, i) => ({ ...d, i })).filter((d) => !isPlaced(d.i));

  const pointIsOverLeaf = (point) => {
    if (!leafRef.current || !point) return false;
    const rect = leafRef.current.getBoundingClientRect();
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  };

  const placeDish = (i) => {
    if (isPlaced(i)) return;
    setPlacedOrder((prev) => [...prev, i]);
    if (dialogueRef.current && dishes[i].dialogue) {
      dialogueRef.current.src = dishes[i].dialogue;
      dialogueRef.current.currentTime = 0;
      dialogueRef.current.play().catch(() => {});
    }
  };

  const unplaceDish = (i) => {
    setPlacedOrder((prev) => prev.filter((x) => x !== i));
  };

  const handleDragEnd = (i, event, info) => {
    const overLeaf = pointIsOverLeaf(info.point);
    if (overLeaf && !isPlaced(i)) placeDish(i);
  };

  const handleLeafItemDragEnd = (i, event, info) => {
    const overLeaf = pointIsOverLeaf(info.point);
    if (!overLeaf) unplaceDish(i);
  };

  const resetOrder = () => setPlacedOrder([]);

  const handleSubmit = async () => {
    setStatus("checking");
    const { ok, data } = await submitAnswer({
      roundId: 3,
      answer: { order: placedOrder },
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

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-center text-xl font-bold text-[#F7EFDD]">
        Onasadya Sequencing
      </h2>
      <p className="mt-1 text-center text-[#F7EFDD]/70">
        Drag each dish onto the leaf in the correct serving order. Drag a
        placed dish back off the leaf to undo it.
      </p>

      <audio ref={dialogueRef} />

      {/* The leaf drop zone */}
      <div
        ref={leafRef}
        className="relative mx-auto mt-6 flex h-72 w-full max-w-md items-center justify-center rounded-[50%] bg-cover bg-center sm:h-80"
        style={{
          backgroundImage: `url(${leafImage})`,
          backgroundColor: "#2F4B33",
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3 p-6">
          {placedOrder.map((i, position) => (
            <motion.div
              key={i}
              layout
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => handleLeafItemDragEnd(i, e, info)}
              className="relative flex h-16 w-16 cursor-grab flex-col items-center justify-center rounded-full border-2 border-[#E8B84B] bg-[#0F2229]/80 shadow-lg active:cursor-grabbing"
            >
              <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8B84B] text-xs font-bold text-[#0F2229]">
                {position + 1}
              </span>
              <img
                src={dishes[i].icon}
                alt={dishes[i].name}
                className="h-full w-full rounded-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {placedOrder.length > 0 && (
        <div className="mt-3 text-center">
          <button
            onClick={resetOrder}
            className="text-sm text-[#E8B84B] underline underline-offset-2"
          >
            Reset order
          </button>
        </div>
      )}

      {/* Tray of unplaced dishes */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {unplaced.map(({ i, name, icon }) => (
          <motion.div
            key={i}
            layout
            drag
            dragMomentum={false}
            dragSnapToOrigin
            onDragEnd={(e, info) => handleDragEnd(i, e, info)}
            onClick={() => placeDish(i)}
            whileDrag={{ scale: 1.1, zIndex: 20 }}
            className="flex cursor-grab flex-col items-center gap-1 rounded-xl border border-[#E8B84B]/30 bg-[#0F2229]/60 p-3 shadow-sm backdrop-blur-md active:cursor-grabbing"
          >
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#E8B84B]/50">
              <img src={icon} alt={name} className="h-full w-full object-cover" />
            </div>
            <span className="text-xs font-medium text-[#F7EFDD]">{name}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={placedOrder.length !== dishes.length || status === "checking"}
          className="rounded-lg bg-gradient-to-r from-[#E8B84B] to-[#F5D98B] px-10 py-3 font-bold text-[#0F2229] shadow-lg transition hover:brightness-105 disabled:opacity-40"
        >
          {status === "checking" ? "Checking…" : "Submit order"}
        </button>
        {status === "wrong" && (
          <p className="mt-4 text-red-400">Wrong order — rearrange and retry.</p>
        )}
        {typeof status === "string" &&
          status !== "wrong" &&
          status !== "checking" && (
            <p className="mt-4 text-red-400">{status}</p>
          )}
      </div>

      <LeaderboardLink />
    </div>
  );
}