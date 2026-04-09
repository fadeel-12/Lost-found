import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { sendMail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await ctx.params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .maybeSingle();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.user1_id !== user.id && chat.user2_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id, sender_id, message, image_url, is_read, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Get messages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await ctx.params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .maybeSingle();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.user1_id !== user.id && chat.user2_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse FormData (supports text + optional image)
    const formData = await req.formData();
    const text = (formData.get("text") as string | null) ?? "";
    const imageFile = formData.get("image") as File | null;

    if (!text.trim() && !imageFile) {
      return NextResponse.json({ error: "Message or image is required" }, { status: 400 });
    }

    // Upload image to Supabase Storage if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const filePath = `${chatId}/${user.id}/${Date.now()}.${ext}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("chat-images")
        .upload(filePath, imageFile, { contentType: imageFile.type, upsert: false });

      if (storageError) {
        console.error("Image upload error:", storageError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(storageData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    // Insert message with optional image_url
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        message: text.trim() || null,
        image_url: imageUrl,
        is_read: false,
      })
      .select("id, sender_id, message, image_url, is_read, created_at")
      .maybeSingle();

    if (insertError) {
      console.error("Insert message error:", insertError);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Notify recipient
    const recipientId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;

    const [{ data: recipient }, { data: item }] = await Promise.all([
      supabase.from("users").select("id, name, email").eq("id", recipientId).maybeSingle(),
      supabase.from("items").select("title").eq("id", chat.item_id).maybeSingle(),
    ]);

    if (recipient?.id) {
      const notifText = imageUrl
        ? text.trim()
          ? `${text.trim()} [image]`
          : "📷 Sent an image"
        : text.length > 80
        ? `${text.slice(0, 80)}…`
        : text;

      await supabase.from("notifications").insert({
        recipient_user_id: recipient.id,
        recipient_email: recipient.email,
        notification_type: "message",
        message: JSON.stringify({
          senderName: user.name ?? "Someone",
          senderEmail: user.email,
          text: notifText,
          conversationId: chatId,
          itemId: chat.item_id ?? null,
        }),
        is_sent: true,
        is_read: false,
      });

      if (recipient.email) {
        const emailBody = imageUrl
          ? `<p>Hi ${recipient.name ?? "there"},</p>
             <p><strong>${user.name ?? "Someone"}</strong> sent you an image${item?.title ? ` about <strong>${item.title}</strong>` : ""}.</p>
             ${text.trim() ? `<p>${text}</p>` : ""}
             <img src="${imageUrl}" style="max-width:400px;border-radius:8px" alt="attachment" />
             <p>Open Lostify to reply.</p>`
          : `<p>Hi ${recipient.name ?? "there"},</p>
             <p><strong>${user.name ?? "Someone"}</strong> sent you a message${item?.title ? ` about <strong>${item.title}</strong>` : ""}:</p>
             <blockquote style="border-left:4px solid #ccc;padding:8px 16px;color:#555">${text}</blockquote>
             <p>Open Lostify to reply.</p>`;

        sendMail(
          recipient.email,
          `New message from ${user.name ?? "a user"}`,
          emailBody
        ).catch(() => {});
      }
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
