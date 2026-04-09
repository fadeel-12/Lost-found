import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}?error=google_auth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}?error=google_token_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}?error=google_no_email`);
    }

    // Upsert user in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", googleUser.email)
      .maybeSingle();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Update name if it was missing
      if (!existingUser.name && googleUser.name) {
        await supabase
          .from("users")
          .update({ name: googleUser.name, email_verified: true })
          .eq("id", userId);
      }
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          name: googleUser.name ?? null,
          email: googleUser.email,
          phone: null,
          password_hash: null,
          student_id: null,
          email_verified: true,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !newUser) {
        return NextResponse.redirect(`${appUrl}?error=google_user_creation_failed`);
      }

      userId = newUser.id;
    }

    // Create session
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    await supabase.from("sessions").insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });

    const res = NextResponse.redirect(appUrl);
    res.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}?error=google_auth_failed`);
  }
}
