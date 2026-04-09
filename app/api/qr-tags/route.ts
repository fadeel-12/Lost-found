import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// GET - list current user's QR tags
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("qr_tags")
    .select("id, token, label, description, created_at, status, is_pet, microchip, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const tags = data ?? [];

  // Lazily expire any active tags whose expires_at has passed
  const toExpire = tags
    .filter((t) => t.status === "active" && t.expires_at && new Date(t.expires_at) < now)
    .map((t) => t.id);

  if (toExpire.length > 0) {
    await supabase
      .from("qr_tags")
      .update({ status: "expired" })
      .in("id", toExpire)
      .eq("user_id", user.id);
    // Reflect the change in the returned list without a second fetch
    tags.forEach((t) => {
      if (toExpire.includes(t.id)) t.status = "expired";
    });
  }

  return NextResponse.json(tags);
}

// POST - create a new QR tag in pending_payment state (no payment yet)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const label = String(body?.label ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const is_pet = body?.is_pet === true;
  const microchip = is_pet ? String(body?.microchip ?? "").trim() : null;

  if (!label) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  // Payment disabled — activate immediately with 6-month expiry
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const { data, error } = await supabase
    .from("qr_tags")
    .insert({
      user_id: user.id,
      label,
      description: description || null,
      status: "active",
      is_pet,
      microchip: microchip || null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, token, label, description, created_at, status, is_pet, microchip, expires_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
