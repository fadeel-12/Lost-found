import { Search, MapPin, Calendar, TrendingUp, Info, Dna } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export interface PotentialMatch {
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
  matchScore: number;
  matchReasons: string[];
  isMicrochipMatch?: boolean;
  microchip?: string | null;
  is_pet?: boolean;
  pet_name?: string | null;
  species?: string | null;
}

interface PotentialMatchesSectionProps {
  matches: PotentialMatch[];
  onItemClick: (item: PotentialMatch) => void;
}

export function PotentialMatchesSection({ matches, onItemClick }: PotentialMatchesSectionProps) {
  if (matches.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mt-2">No Potential Matches Found</h3>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number, isMicrochip?: boolean) => {
    if (isMicrochip) return "text-purple-700 bg-purple-50 border-purple-200";
    if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  const getScoreLabel = (score: number, isMicrochip?: boolean) => {
    if (isMicrochip) return "Definitive Match";
    if (score >= 80) return "High Match";
    if (score >= 60) return "Good Match";
    return "Possible Match";
  };

  const getBorderColor = (score: number, isMicrochip?: boolean) => {
    if (isMicrochip) return "border-l-purple-500";
    if (score >= 80) return "border-l-green-500";
    if (score >= 60) return "border-l-blue-500";
    return "border-l-amber-500";
  };

  const microchipMatches = matches.filter((m) => m.isMicrochipMatch).length;
  const highMatches = matches.filter((m) => !m.isMicrochipMatch && m.matchScore >= 80).length;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${microchipMatches > 0 ? "bg-purple-50" : "bg-green-50"}`}>
            {microchipMatches > 0
              ? <Dna className="h-5 w-5 text-purple-600" />
              : <Search className="h-5 w-5 text-green-600" />
            }
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">Potential Matches Found</h3>
            <p className="text-sm text-gray-600">
              {matches.length} {matches.length === 1 ? "match" : "matches"} found
              {microchipMatches > 0 && (
                <span className="text-purple-700 font-medium">
                  {" "}— {microchipMatches} definitive microchip {microchipMatches === 1 ? "match" : "matches"} 🔬
                </span>
              )}
              {!microchipMatches && highMatches > 0 && (
                <span className="text-green-700">
                  {" "}({highMatches} high {highMatches === 1 ? "match" : "matches"})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {matches.map((item) => (
          <Card
            key={item.id}
            className={`p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getBorderColor(item.matchScore, item.isMicrochipMatch)} ${
              item.isMicrochipMatch ? "bg-purple-50/30 ring-1 ring-purple-200" : ""
            }`}
            onClick={() => onItemClick(item)}
          >
            {/* Microchip match banner */}
            {item.isMicrochipMatch && (
              <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-purple-100 border border-purple-200 rounded-lg">
                <Dna className="h-4 w-4 text-purple-600 shrink-0" />
                <p className="text-xs font-semibold text-purple-800">
                  Definitive match — Microchip ID confirmed
                  {item.microchip && (
                    <span className="font-mono ml-1 text-purple-600">({item.microchip})</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <ImageWithFallback
                  src={item.imageUrl ?? ""}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 truncate mb-1">
                      {item.is_pet && item.pet_name ? `${item.pet_name} (${item.title})` : item.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${item.type === "lost"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"}`}
                      >
                        {item.type === "lost" ? "Lost" : "Found"}
                      </Badge>
                      {item.is_pet && item.species && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          🐾 {item.species}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getScoreColor(item.matchScore, item.isMicrochipMatch)}`}
                      >
                        {item.isMicrochipMatch
                          ? <><Dna className="h-3 w-3 mr-1" />100%</>
                          : <><TrendingUp className="h-3 w-3 mr-1" />{item.matchScore}%</>
                        }
                        {" — "}{getScoreLabel(item.matchScore, item.isMicrochipMatch)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{item.type === "lost" ? "Lost on" : "Found on"} {item.date}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${item.isMicrochipMatch ? "text-purple-700" : "text-green-700"}`}>
                    {item.isMicrochipMatch
                      ? <Dna className="h-3.5 w-3.5 flex-shrink-0" />
                      : <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    }
                    <span>{item.matchReasons.join(" • ")}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
