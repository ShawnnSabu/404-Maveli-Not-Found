import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ROUND1, ROUND2, ROUND3, ROUND4 } from "@/lib/answerKeys";

// GET /api/leaderboard
// Only participants who completed all rounds correctly are ranked,
// by total time_taken ascending.
export async function GET() {
  const expectedCorrectAttempts =
    ROUND1.questions.length + 1 + 1 + ROUND4.riddles.length;

  const { data: participants, error: pError } = await supabase
    .from("participants")
    .select("id, name, finished_at")
    .not("finished_at", "is", null)
    .eq("disqualified", false);

  if (pError) {
    return NextResponse.json(
      { error: "Could not load participants." },
      { status: 500 }
    );
  }

  if (!participants || participants.length === 0) {
    return NextResponse.json({ entries: [] });
  }

  const ids = participants.map((p) => p.id);

  const { data: attempts, error: aError } = await supabase
    .from("attempts")
    .select("participant_id, is_correct, time_taken")
    .in("participant_id", ids);

  if (aError) {
    return NextResponse.json(
      { error: "Could not load attempts." },
      { status: 500 }
    );
  }

  const totals = new Map();
  for (const a of attempts ?? []) {
    if (!a.is_correct) continue;
    const entry = totals.get(a.participant_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(a.time_taken ?? 0);
    totals.set(a.participant_id, entry);
  }

  const entries = participants
    .map((p) => ({
      name: p.name,
      finished_at: p.finished_at,
      total_time: Math.round((totals.get(p.id)?.total ?? 0) * 100) / 100,
      _count: totals.get(p.id)?.count ?? 0,
    }))
    // Completed all rounds correctly only.
    .filter((e) => e._count >= expectedCorrectAttempts)
    // Rank: total time ascending; tie-break: earlier finish time first.
    .sort((a, b) => a.total_time - b.total_time ||
      new Date(a.finished_at) - new Date(b.finished_at))
    .map(({ name, total_time, finished_at }, i) => ({
      rank: i + 1,
      name,
      total_time,
      finished_at,
    }));

  return NextResponse.json({ entries });
}
