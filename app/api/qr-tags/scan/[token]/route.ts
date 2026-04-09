import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// GET - public: fetch tag info by token (no auth needed)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: tag, error } = await supabase
    .from("qr_tags")
    .select("id, label, description, created_at, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  // Check expiry
  const isExpired =
    tag.status === "expired" ||
    (tag.expires_at && new Date(tag.expires_at) < new Date());

  if (isExpired) {
    return NextResponse.json(
      { error: "expired", message: "This QR tag has expired. The owner needs to renew it." },
      { status: 410 }
    );
  }

  if (tag.status !== "active") {
    return NextResponse.json(
      { error: "inactive", message: "This QR tag is not active." },
      { status: 403 }
    );
  }

  return NextResponse.json(tag);
}

// POST - public: finder submits a found report for this tag
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Use service-role key if available so RLS doesn't block public inserts
  const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : supabase;

  // Look up the tag and owner (read user_id via admin client to bypass RLS)
  const { data: tag, error: tagError } = await adminSupabase
    .from("qr_tags")
    .select("id, label, user_id, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (tagError) {
    console.error("[qr-scan] tag lookup error:", tagError.message);
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }
  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const isExpired =
    tag.status === "expired" ||
    (tag.expires_at && new Date(tag.expires_at) < new Date());
  if (isExpired) {
    return NextResponse.json(
      { error: "expired", message: "This QR tag has expired." },
      { status: 410 }
    );
  }
  if (tag.status !== "active") {
    return NextResponse.json(
      { error: "inactive", message: "This QR tag is not active." },
      { status: 403 }
    );
  }
  if (!tag.user_id) {
    console.error("[qr-scan] tag has no user_id:", tag);
    return NextResponse.json({ error: "Tag owner not found" }, { status: 500 });
  }

  // Fetch owner's email (required by notifications table)
  const { data: owner } = await adminSupabase
    .from("users")
    .select("email")
    .eq("id", tag.user_id)
    .maybeSingle();

  const body = await req.json().catch(() => ({}));
  const message = String(body?.message ?? "").trim();
  const contactInfo = String(body?.contactInfo ?? "").trim();
  const location = String(body?.location ?? "").trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Compose notification message for the owner
  const notifBody = [
    `📦 Someone found your QR-tagged item: "${tag.label}"`,
    `Message: "${message}"`,
    location ? `📍 Location: ${location}` : null,
    contactInfo ? `📞 Contact: ${contactInfo}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Insert notification using admin client (bypasses RLS)
  const { error: insertError } = await adminSupabase
    .from("notifications")
    .insert({
      recipient_user_id: tag.user_id,
      recipient_email: owner?.email ?? null,
      notification_type: "system",
      message: notifBody,
      is_read: false,
    });

  if (insertError) {
    console.error("[qr-scan] notification insert error:", insertError.message, {
      recipient_user_id: tag.user_id,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
    });
    return NextResponse.json({
      error: `Failed to notify owner: ${insertError.message}`,
      code: insertError.code,
    }, { status: 500 });
  }

  console.log("[qr-scan] notification sent to user:", tag.user_id);
  return NextResponse.json({ ok: true });
}
