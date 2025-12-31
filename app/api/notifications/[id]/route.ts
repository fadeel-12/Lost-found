import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function isUuid(id: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
    );
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await context.params;
    if (!id || !isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("recipient_user_id", user.id)
        .select("id, is_read")
        .single();

    if (error) {
        console.error("mark read error", { error, id, userId: user.id });
        return NextResponse.json({ error: "Failed", details: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updated: data });
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await context.params;
    if (!id || !isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("recipient_user_id", user.id);

    if (error) {
        console.error("delete notification error", { error, id, userId: user.id });
        return NextResponse.json({ error: "Failed", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}