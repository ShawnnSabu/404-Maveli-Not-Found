"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressIndicator from "@/components/ProgressIndicator";

// Client-side session gate shared by all round pages.
// Verifies localStorage session against participants.current_round before
// rendering the round content.
export default function RoundShell({ round, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentRound, setCurrentRound] = useState(round);

  useEffect(() => {
    const participantId = localStorage.getItem("maveli_participant_id");
    if (!participantId) {
      router.replace("/");
      return;
    }

    fetch(`/api/participant?id=${encodeURIComponent(participantId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ participant }) => {
        if (participant.disqualified) {
          router.replace("/");
          return;
        }
        if (participant.finished_at) {
          router.replace("/leaderboard");
          return;
        }
        if (participant.current_round !== round) {
          router.replace(`/round/${participant.current_round}`);
          return;
        }
        setCurrentRound(participant.current_round);
        setReady(true);
      })
      .catch(() => {
        localStorage.removeItem("maveli_participant_id");
        router.replace("/");
      });
  }, [round, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      <h1 className="text-center text-2xl font-black tracking-tight text-orange-700">
        Maveli — Onam Puzzle Challenge
      </h1>
      {/* Progress indicator driven by participants.current_round */}
      <ProgressIndicator currentRound={currentRound} />
      {children}
    </main>
  );
}
