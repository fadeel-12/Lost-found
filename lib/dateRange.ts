export type DateRange = "all" | "today" | "yesterday" | "week" | "month" | "3months";

export function parseItemDate(dateStr: string) {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function matchesDateRange(dateStr: string, range: DateRange) {
  if (range === "all") return true;

  const itemDate = parseItemDate(dateStr);
  if (!itemDate) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(now);

  switch (range) {
    case "today":
      return itemDate.getTime() === now.getTime();
    case "yesterday":
      start.setDate(now.getDate() - 1);
      return itemDate.getTime() === start.getTime();
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setDate(now.getDate() - 30);
      break;
    case "3months":
      start.setDate(now.getDate() - 90);
      break;
  }

  return itemDate >= start && itemDate <= now;
}
