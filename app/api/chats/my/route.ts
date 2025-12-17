import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: chats, error: chatsError } = await supabase
      .from("chats")
      .select(`
        id,
        item:items (
          id,
          title,
          type
        ),
        user1:users!chats_user1_id_fkey (
          id,
          name,
          email
        ),
        user2:users!chats_user2_id_fkey (
          id,
          name,
          email
        ),
        created_at
      `)
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (chatsError || !chats) {
      console.error("chatsError", chatsError);
      return NextResponse.json(
        { error: "Failed to load chats" },
        { status: 500 }
      );
    }

    const result = [];

    for (const chat of chats as any[]) {
      const { data: lastMsg, error: lastMsgError } = await supabase
        .from("messages")
        .select("id, message, sender_id, created_at")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastMsgError) {
        console.error("lastMsgError for chat", chat.id, lastMsgError);
      }

      const isUser1 = chat.user1?.id === currentUser.id;
      const otherUser = isUser1 ? chat.user2 : chat.user1;

      result.push({
        id: chat.id,
        itemId: chat.item?.id ?? null,
        itemTitle: chat.item?.title ?? "Unknown item",
        itemType: chat.item?.type ?? null,
        otherUserId: otherUser?.id ?? null,
        otherUserName: otherUser?.name ?? "Unknown user",
        otherUserEmail: otherUser?.email ?? "",
        lastMessage: lastMsg?.message ?? null,
        lastMessageAt: lastMsg?.created_at ?? chat.created_at,
      });
    }

    return NextResponse.json({ chats: result });
  } catch (err) {
    console.error("GET /api/chats/my error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
