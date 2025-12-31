import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { id } = await req.json();
    if (typeof id !== "string") {
        return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("recipient_user_id", user.id);

    if (error) {
        console.error("POST /api/notifications/mark-read error:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}