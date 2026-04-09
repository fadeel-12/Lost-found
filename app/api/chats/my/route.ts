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

  // Fetch all chats for this user (including ones with no messages yet)
  const { data: chats, error: detailsErr } = await supabase
    .from("chats")
    .select(`
      id,
      item_id,
      user1_id,
      user2_id,
      created_at,
      items:items ( id, title, type ),
      user1:users!chats_user1_id_fkey ( id, name, email ),
      user2:users!chats_user2_id_fkey ( id, name, email )
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (detailsErr) {
    console.error("chats details error", detailsErr);
    return NextResponse.json({ chats: [] });
  }

  const chatIds = (chats ?? []).map((c: any) => c.id);

  // Fetch last message + unread count per chat in one query
  const { data: messages } = chatIds.length
    ? await supabase
        .from("messages")
        .select("id, chat_id, message, created_at, sender_id, is_read")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Group messages by chat_id
  const msgByChatId: Record<string, any[]> = {};
  for (const msg of messages ?? []) {
    if (!msgByChatId[msg.chat_id]) msgByChatId[msg.chat_id] = [];
    msgByChatId[msg.chat_id].push(msg);
  }

  const mapped = (chats ?? []).map((c: any) => {
    const isUser1 = c.user1_id === user.id;
    const other = isUser1 ? c.user2 : c.user1;
    const chatMsgs = msgByChatId[c.id] ?? [];
    const lastMsg = chatMsgs[0] ?? null;
    const unreadCount = chatMsgs.filter(
      (m) => m.sender_id !== user.id && !m.is_read
    ).length;

    return {
      id: c.id,
      itemId: c.item_id ?? null,
      itemTitle: (c.items as any)?.title ?? "Item",
      itemType: (c.items as any)?.type ?? null,
      otherUserId: other?.id ?? null,
      otherUserName: other?.name ?? "User",
      otherUserEmail: other?.email ?? "",
      lastMessage: lastMsg?.message ?? null,
      lastMessageAt: lastMsg?.created_at ?? c.created_at,
      unreadCount,
    };
  });

  mapped.sort((a, b) => {
    const ta = new Date(a.lastMessageAt).getTime();
    const tb = new Date(b.lastMessageAt).getTime();
    return tb - ta;
  });

  return NextResponse.json({ chats: mapped });
}
