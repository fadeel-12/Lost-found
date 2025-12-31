import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ chats: [] });

  const { data: chatRows, error: chatErr } = await supabase
    .from("chats")
    .select("id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .limit(500);

  if (chatErr) {
    console.error("chats list error", chatErr);
    return NextResponse.json({ chats: [] });
  }

  const chatIds = (chatRows ?? []).map((c) => c.id);
  if (chatIds.length === 0) return NextResponse.json({ chats: [] });

  const { data: msgChatRows, error: msgErr } = await supabase
    .from("messages")
    .select("chat_id")
    .in("chat_id", chatIds)
    .limit(2000);

  if (msgErr) {
    console.error("messages chat_id error", msgErr);
    return NextResponse.json({ chats: [] });
  }

  const nonEmptyChatIds = Array.from(
    new Set((msgChatRows ?? []).map((m) => m.chat_id).filter(Boolean))
  );

  if (nonEmptyChatIds.length === 0) {
    return NextResponse.json({ chats: [] });
  }

  const { data: chats, error: detailsErr } = await supabase
    .from("chats")
    .select(
      `
      id,
      item_id,
      user1_id,
      user2_id,
      created_at,
      items:items ( id, title, type ),
      user1:users!chats_user1_id_fkey ( id, name, email ),
      user2:users!chats_user2_id_fkey ( id, name, email ),
      messages:messages ( message, created_at, sender_id )
    `
    )
    .in("id", nonEmptyChatIds)
    .order("created_at", { foreignTable: "messages", ascending: false })
    .limit(1, { foreignTable: "messages" });

  if (detailsErr) {
    console.error("chats details error", detailsErr);
    return NextResponse.json({ chats: [] });
  }

  const mapped = (chats ?? []).map((c: any) => {
    const isUser1 = c.user1_id === user.id;
    const other = isUser1 ? c.user2 : c.user1;

    const lastMsg = Array.isArray(c.messages) ? c.messages[0] : null;

    return {
      id: c.id,
      itemId: c.item_id ?? null,
      itemTitle: c.items?.title ?? "Item",
      itemType: c.items?.type ?? null,
      otherUserId: other?.id ?? null,
      otherUserName: other?.name ?? "User",
      otherUserEmail: other?.email ?? "",
      lastMessage: lastMsg?.message ?? null,
      lastMessageAt: lastMsg?.created_at ?? c.created_at,
    };
  });

  mapped.sort((a: any, b: any) => {
    const ta = new Date(a.lastMessageAt).getTime();
    const tb = new Date(b.lastMessageAt).getTime();
    return tb - ta;
  });

  return NextResponse.json({ chats: mapped });
}