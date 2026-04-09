import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  const { user_id, tag_ids } = session.metadata ?? {};
  if (!user_id || !tag_ids) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  const ids = tag_ids.split(",").filter(Boolean);

  // Set expires_at = 6 months from now
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  // Activate all the tags (idempotent — safe to call multiple times)
  const { data: activatedTags, error } = await supabase
    .from("qr_tags")
    .update({
      status: "active",
      stripe_session_id: sessionId,
      expires_at: expiresAt.toISOString(),
    })
    .in("id", ids)
    .eq("user_id", user_id)
    .select("id, token, label, description, created_at, status, expires_at");

  if (error) {
    console.error("Tag activation error:", error);
    return NextResponse.json({ error: "Failed to activate tags" }, { status: 500 });
  }

  return NextResponse.json({ tags: activatedTags ?? [], count: activatedTags?.length ?? 0 });
}
