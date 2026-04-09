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

  const { data: matches, error } = await supabase
    .from("matches")
    .select("lost_item_id, found_item_id, match_score, location_match_score, match_type")
    .or(`lost_item_id.eq.${id},found_item_id.eq.${id}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json([]);
  }

  const counterpartIds = matches.map((m) =>
    m.lost_item_id === id ? m.found_item_id : m.lost_item_id
  );

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select(`
      id, title, description, date, type, imageUrl, user_id, status,
      is_pet, pet_name, species, breed, pet_color, microchip,
      category:categories ( name ),
      location:locations ( name ),
      user:users ( name, email, phone )
    `)
    .in("id", counterpartIds)
    .eq("status", "open");

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const result = (items ?? []).map((item: any) => {
    const matchRow = matches.find(
      (m) => m.lost_item_id === item.id || m.found_item_id === item.id
    );

    const isMicrochipMatch = matchRow?.match_type === "microchip";
    const score = isMicrochipMatch ? 100 : Math.round((matchRow?.match_score ?? 0) * 100);

    const matchReasons: string[] = [];

    if (isMicrochipMatch) {
      matchReasons.push("🔬 Microchip ID match");
    } else {
      if (matchRow?.location_match_score > 0) matchReasons.push("Same location");
      if (score >= 80) matchReasons.push("High similarity");
      else if (score >= 60) matchReasons.push("Good similarity");
      else matchReasons.push("Possible match");
    }

    return {
      id: item.id,
      title: item.title,
      category: item.category?.name ?? "",
      type: item.type,
      location: item.location?.name ?? "",
      date: formatDate(item.date),
      imageUrl: item.imageUrl,
      description: item.description,
      contactName: item.user?.name ?? "",
      contactEmail: item.user?.email ?? "",
      contactPhone: item.user?.phone ?? "",
      user_id: item.user_id,
      status: item.status,
      is_pet: item.is_pet ?? false,
      pet_name: item.pet_name ?? null,
      species: item.species ?? null,
      microchip: item.microchip ?? null,
      matchScore: score,
      matchReasons,
      isMicrochipMatch,
    };
  });

  // Microchip matches always float to top, then sort by score
  result.sort((a, b) => {
    if (a.isMicrochipMatch !== b.isMicrochipMatch) {
      return a.isMicrochipMatch ? -1 : 1;
    }
    return b.matchScore - a.matchScore;
  });

  return NextResponse.json(result);
}
