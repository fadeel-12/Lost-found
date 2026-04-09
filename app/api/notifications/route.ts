import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ notifications: [] });

    const { data, error } = await supabase
        .from("notifications")
        .select("id, notification_type, message, is_read, created_at")
        .eq("recipient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("notifications list error", error);
        return NextResponse.json({ notifications: [] });
    }

    const notifications = (data ?? []).map((row) => {
        let parsed: any = null;
        try {
            parsed = row.message ? JSON.parse(row.message) : null;
        } catch { }

        if (row.notification_type === "message") {
            return {
                id: row.id,
                type: "message",
                title: parsed?.senderName
                    ? `New message from ${parsed.senderName}`
                    : "New message",
                message: parsed?.text ?? "",
                timestamp: row.created_at,
                read: !!row.is_read,
                conversationId: parsed?.conversationId,
                itemId: parsed?.itemId,
                senderName: parsed?.senderName,
                senderEmail: parsed?.senderEmail,
            };
        }

        if (row.notification_type === "item_match") {
            return {
                id: row.id,
                type: "item_match",
                title: parsed?.title ?? "Potential match found",
                message: parsed?.text ?? "We found a potential match for your item.",
                timestamp: row.created_at,
                read: !!row.is_read,
                itemId: parsed?.itemId,
                matchItemId: parsed?.matchItemId,
            };
        }

        if (row.notification_type === "item_claimed") {
            return {
                id: row.id,
                type: "item_claimed",
                title: parsed?.title ?? "Item claimed",
                message: parsed?.text ?? "Your item has been claimed.",
                timestamp: row.created_at,
                read: !!row.is_read,
                itemId: parsed?.itemId,
                matchItemId: parsed?.matchItemId,
            };
        }

        const rawMsg = typeof row.message === "string" ? row.message : "";
        const isQRTag = rawMsg.includes("QR-tagged item");
        return {
            id: row.id,
            type: (row.notification_type ?? "system"),
            title: isQRTag ? "Item Found via QR Tag" : "Notification",
            message: rawMsg,
            timestamp: row.created_at,
            read: !!row.is_read,
        };
    });

    return NextResponse.json({ notifications });
}