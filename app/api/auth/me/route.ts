import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, email_verified, verified_at, created_at, student_id, avatar_url")
      .eq("id", session.user_id)
      .maybeSingle();

    if (error) {
      console.error("me fetch user error:", error);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const studentId = String(body?.studentId ?? "").trim();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

  const avatarUrl = body?.avatarUrl !== undefined ? (String(body.avatarUrl).trim() || null) : undefined;

  const { error } = await supabase
    .from("users")
    .update({
      name,
      phone,
      student_id: studentId || null,
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
