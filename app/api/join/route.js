import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/join  body: { name }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({ name })
    .select("id, current_round")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not create participant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ participant: data });
}
