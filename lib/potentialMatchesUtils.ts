export interface Item {
  id: string;
  title: string;
  category: string;
  type: "lost" | "found";
  location: string;
  date: string;
  imageUrl: string | null;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

export function extractBuildingName(location: string): string {
  const match = location.match(/^([^,(]+)/);
  return match ? match[1].trim() : location;
}

export function parseItemDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  return new Date();
}

export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter((w) => words2.includes(w));

  if (commonWords.length > 0) {
    return (commonWords.length * 2) / (words1.length + words2.length);
  }

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export function calculateMatchScore(foundItem: Item, lostItem: Item): number {
  let score = 0;

  const foundBuilding = extractBuildingName(foundItem.location);
  const lostBuilding = extractBuildingName(lostItem.location);

  if (foundBuilding.toLowerCase() === lostBuilding.toLowerCase()) {
    score += 30;
  } else if (
    foundItem.location.toLowerCase().includes(lostBuilding.toLowerCase()) ||
    lostItem.location.toLowerCase().includes(foundBuilding.toLowerCase())
  ) {
    score += 15;
  }

  if (foundItem.category.toLowerCase() === lostItem.category.toLowerCase()) {
    score += 25;
  }

  const nameSimilarity = calculateStringSimilarity(foundItem.title, lostItem.title);
  score += nameSimilarity * 30;

  const foundDate = parseItemDate(foundItem.date);
  const lostDate = parseItemDate(lostItem.date);
  const diffDays = Math.abs(foundDate.getTime() - lostDate.getTime()) / (1000 * 60 * 60 * 24);

  score += Math.max(0, 15 - diffDays * 3);

  return Math.round(score);
}

export function findPotentialMatches(
  foundItem: Item,
  allItems: Item[],
  minMatchScore: number = 40
): Array<Item & { matchScore: number; matchReasons: string[] }> {
  if (foundItem.type !== "found") return [];

  const foundBuilding = extractBuildingName(foundItem.location);
  const foundDate = parseItemDate(foundItem.date);

  return allItems
    .filter((it) => it.type === "lost")
    .filter((it) => it.id !== foundItem.id)
    .map((it) => {
      const matchScore = calculateMatchScore(foundItem, it);
      const matchReasons: string[] = [];

      const lostBuilding = extractBuildingName(it.location);
      if (foundBuilding.toLowerCase() === lostBuilding.toLowerCase()) {
        matchReasons.push("Same location");
      }

      if (foundItem.category.toLowerCase() === it.category.toLowerCase()) {
        matchReasons.push("Same category");
      }

      const nameSimilarity = calculateStringSimilarity(foundItem.title, it.title);
      if (nameSimilarity > 0.6) matchReasons.push("Similar name");

      const lostDate = parseItemDate(it.date);
      const diffDays = Math.round(
        Math.abs(foundDate.getTime() - lostDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      matchReasons.push(`${diffDays} ${diffDays === 1 ? "day" : "days"} apart`);

      return { ...it, matchScore, matchReasons };
    })
    .filter((it) => it.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}
