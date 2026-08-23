import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/participant?id=<uuid>
export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id, name, current_round, finished_at, disqualified")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Participant not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ participant: data });
}
