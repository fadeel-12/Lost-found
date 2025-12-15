import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mailer";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, student_id } = await req.json();

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert([{ 
        name, 
        email, 
        phone,
        password_hash: hash, 
        student_id,
        email_verified: false
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    const token = uuidv4();

    const { error: tokenError } = await supabase.from("email_verification_tokens").insert([
      {
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), 
      },
    ]);

    if (tokenError) throw tokenError;

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    try {
      await sendMail(
        user.email,
        "Verify Your Email",
        `
          <p>Hello ${user.name},</p>
          <p>Thanks for registering your account!</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verifyLink}">Verify Email</a></p>
          <br/>
          <p>This link expires in 1 hour.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      return NextResponse.json({
        success: true,
        user,
        warning: "Account created, but verification email could not be sent.",
      });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
