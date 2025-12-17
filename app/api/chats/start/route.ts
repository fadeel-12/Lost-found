import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, title, type, user_id")
      .eq("id", itemId)
      .maybeSingle();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const ownerId = item.user_id as string;

    if (ownerId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot start a chat with yourself as the owner" },
        { status: 400 }
      );
    }

    const [user1Id, user2Id] =
      currentUser.id < ownerId
        ? [currentUser.id, ownerId]
        : [ownerId, currentUser.id];

    const { data: existingChat, error: existingChatError } = await supabase
      .from("chats")
      .select("id")
      .eq("item_id", itemId)
      .eq("user1_id", user1Id)
      .eq("user2_id", user2Id)
      .maybeSingle();

    if (existingChatError && existingChatError.code !== "PGRST116") {
      console.error("existingChatError", existingChatError);
    }

    let chatId: string;

    if (existingChat) {
      chatId = existingChat.id;
    } else {
      const { data: newChat, error: insertError } = await supabase
        .from("chats")
        .insert({
          item_id: itemId,
          user1_id: user1Id,
          user2_id: user2Id,
        })
        .select("id")
        .single();

      if (insertError || !newChat) {
        console.error("insertError", insertError);
        return NextResponse.json(
          { error: "Failed to create chat" },
          { status: 500 }
        );
      }

      chatId = newChat.id;
    }

    const { data: otherUser, error: otherUserError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", ownerId)
      .maybeSingle();

    if (otherUserError || !otherUser) {
      return NextResponse.json(
        { error: "Failed to load other user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      chatId,
      item: {
        id: item.id,
        title: item.title,
        type: item.type as "lost" | "found",
      },
      otherUser,
    });
  } catch (err) {
    console.error("start chat error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
