import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { conversationId } = await req.json();
    if (!conversationId || typeof conversationId !== "string") {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_user_id", user.id)
        .eq("notification_type", "message")
        .like("message", `%${conversationId}%`);

    if (error) {
        console.error("mark-chat-read notification error", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}