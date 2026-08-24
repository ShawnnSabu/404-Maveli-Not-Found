import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ROUND1, ROUND2, ROUND3, ROUND4, TOTAL_ROUNDS } from "@/lib/answerKeys";

// ============================================================================
// POST /api/submit-answer
// body: { participant_id, round_id, answer, started_at }
//
// `answer` shape depends on the round:
//   round 1: { question_index: <int>, selected: <int option index> }
//   round 2: { grid: <int[gridSize][gridSize]> }   (palette indexes)
//   round 3: { order: <int[]> }                    (indexes into dishes)
//   round 4: { riddle_index: <int>, text: <string> }
//
// All correct values come exclusively from lib/answerKeys.js and are never
// included in any response.
// ============================================================================

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

// Sequential-progress rule:
//   rounds 1 & 4 are multi-step; step n is only accepted after n prior
//   CORRECT attempts exist for that participant+round.
async function getCorrectAttemptCount(participantId, roundId) {
  const { count, error } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("participant_id", participantId)
    .eq("round_id", roundId)
    .eq("is_correct", true);

  if (error) throw error;
  return count ?? 0;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { participant_id, round_id, answer, started_at } = body ?? {};

  const roundNumber = Number(round_id);
  if (
    !participant_id ||
    !Number.isInteger(roundNumber) ||
    roundNumber < 1 ||
    roundNumber > TOTAL_ROUNDS
  ) {
    return NextResponse.json(
      { error: "Missing or invalid participant_id / round_id." },
      { status: 400 },
    );
  }

  // started_at must be a parseable timestamp; time is measured server-side.
  const startedMs = Date.parse(started_at);
  if (!started_at || Number.isNaN(startedMs)) {
    return NextResponse.json(
      { error: "Invalid or missing started_at." },
      { status: 400 },
    );
  }

  // Load participant and gate on current_round (round locking).
  const { data: participant, error: pError } = await supabase
    .from("participants")
    .select("id, name, current_round, finished_at, disqualified")
    .eq("id", participant_id)
    .single();

  if (pError || !participant) {
    return NextResponse.json(
      { error: "Participant not found." },
      { status: 404 },
    );
  }

  if (participant.disqualified) {
    return NextResponse.json(
      { error: "Participant is disqualified." },
      { status: 403 },
    );
  }

  if (participant.current_round !== roundNumber) {
    return NextResponse.json(
      { error: "This round is locked. Resume at your current round." },
      { status: 409 },
    );
  }

  let isCorrect = false;

  // ------------------------------------------------------------------
  // Round-specific validation (answers only from lib/answerKeys.js)
  // ------------------------------------------------------------------
  if (roundNumber === 1) {
    const questionIndex = Number(answer?.question_index);
    const selected = Number(answer?.selected);
    const question = ROUND1.questions[questionIndex];

    if (!question || !Number.isInteger(selected)) {
      return NextResponse.json(
        { error: "Invalid answer payload for round 1." },
        { status: 400 },
      );
    }

    const priorCorrect = await getCorrectAttemptCount(
      participant.id,
      roundNumber,
    );
    if (questionIndex !== priorCorrect) {
      return NextResponse.json(
        { error: "Questions must be answered in order." },
        { status: 409 },
      );
    }

    isCorrect = selected === question.answer;
  } else if (roundNumber === 2) {
    const order = answer?.order;
    const tileCount = ROUND2.gridSize * ROUND2.gridSize;

    const validOrder =
      Array.isArray(order) &&
      order.length === tileCount &&
      [...order].sort((a, b) => a - b).every((value, index) => value === index);

    if (!validOrder) {
      return NextResponse.json(
        { error: "Invalid tile order for round 2." },
        { status: 400 },
      );
    }

    isCorrect = JSON.stringify(order) === JSON.stringify(ROUND2.correctOrder);
  } else if (roundNumber === 3) {
    const order = answer?.order;
    const dishCount = ROUND3.dishes.length;

    const validOrder =
      Array.isArray(order) &&
      order.length === dishCount &&
      [...order].sort((a, b) => a - b).every((v, i) => v === i);

    if (!validOrder) {
      return NextResponse.json(
        { error: "Invalid order payload for round 3." },
        { status: 400 },
      );
    }

    isCorrect = JSON.stringify(order) === JSON.stringify(ROUND3.correctOrder);
  } else if (roundNumber === 4) {
    const riddleIndex = Number(answer?.riddle_index);
    const riddle = ROUND4.riddles[riddleIndex];

    if (!riddle) {
      return NextResponse.json(
        { error: "Invalid riddle_index for round 4." },
        { status: 400 },
      );
    }

    const priorCorrect = await getCorrectAttemptCount(
      participant.id,
      roundNumber,
    );
    if (riddleIndex !== priorCorrect) {
      return NextResponse.json(
        { error: "Riddles must be solved in order." },
        { status: 409 },
      );
    }

    isCorrect = normalizeText(answer?.text) === normalizeText(riddle.answer);
  }

  // ------------------------------------------------------------------
  // Record the attempt + compute time_taken server-side
  // ------------------------------------------------------------------
  const submittedAt = new Date();
  const timeTakenSeconds = Math.max(
    0,
    Math.round(((submittedAt.getTime() - startedMs) / 1000) * 100) / 100,
  );

  const { data: attempt, error: aError } = await supabase
    .from("attempts")
    .insert({
      participant_id: participant.id,
      round_id: roundNumber,
      is_correct: isCorrect,
      wrong_attempts: isCorrect ? 0 : 1,
      started_at: new Date(startedMs).toISOString().slice(0, 10),
      submitted_at: submittedAt.toISOString(),
      time_taken: timeTakenSeconds,
    })
    .select("id")
    .single();

  if (aError) {
    console.error("attempt insert failed:", aError);
    return NextResponse.json(
      { error: "Could not record attempt." },
      { status: 500 },
    );
  }

  let advanced = false;
  let finished = false;

  if (isCorrect) {
    // Determine whether this correct attempt completes the round.
    let roundComplete;
    if (roundNumber === 1) {
      roundComplete =
        (await getCorrectAttemptCount(participant.id, roundNumber)) >=
        ROUND1.questions.length;
    } else if (roundNumber === 4) {
      roundComplete =
        (await getCorrectAttemptCount(participant.id, roundNumber)) >=
        ROUND4.riddles.length;
    } else {
      roundComplete = true;
    }

    if (roundComplete && roundNumber < TOTAL_ROUNDS) {
      const { error: uError } = await supabase
        .from("participants")
        .update({ current_round: roundNumber + 1 })
        .eq("id", participant.id);

      if (!uError) advanced = true;
    } else if (roundComplete) {
      const { error: fError } = await supabase
        .from("participants")
        .update({ finished_at: new Date().toISOString() })
        .eq("id", participant.id);

      if (!fError) finished = true;
    }
  }

  return NextResponse.json({
    is_correct: isCorrect,
    time_taken: timeTakenSeconds,
    round_advanced: advanced,
    game_finished: finished,
  });
}
