// Client-side helper for the shared answer-submission API.
export async function submitAnswer({ roundId, answer, startedAt }) {
  const res = await fetch("/api/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participant_id: localStorage.getItem("maveli_participant_id"),
      round_id: roundId,
      answer,
      started_at: startedAt ?? new Date().toISOString(),
    }),
  });
  return { ok: res.ok, data: await res.json() };
}
