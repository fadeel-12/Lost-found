import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("items")
    .select(`
      id, title, description, date, type, imageUrl, user_id, status,
      category:categories ( name ),
      location:locations ( name ),
      user:users ( name, email, phone )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    category: (data.category as any)?.name ?? "",
    type: data.type,
    location: (data.location as any)?.name ?? "",
    date: formatDate(data.date),
    imageUrl: data.imageUrl,
    description: data.description,
    contactName: (data.user as any)?.name ?? "",
    contactEmail: (data.user as any)?.email ?? "",
    contactPhone: (data.user as any)?.phone ?? "",
    user_id: data.user_id,
    status: data.status,
  });
}
