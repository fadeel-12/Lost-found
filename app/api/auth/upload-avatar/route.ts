import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `avatars/${user.id}.${ext}`;

  const { data, error } = await supabase.storage
    .from("item-images")
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[upload-avatar] storage error:", error.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("item-images")
    .getPublicUrl(data.path);

  const avatarUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to save avatar URL" }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl });
}
