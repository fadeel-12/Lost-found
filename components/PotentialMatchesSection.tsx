import { Search, MapPin, Calendar, TrendingUp, Info } from "lucide-react";
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

  const getMatchQualityColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  const getMatchQualityLabel = (score: number) => {
    if (score >= 80) return "High Match";
    if (score >= 60) return "Good Match";
    return "Possible Match";
  };

  const highMatches = matches.filter((m) => m.matchScore >= 80).length;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-green-50 rounded-lg">
            <Search className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">Potential Matches Found</h3>
            <p className="text-sm text-gray-600">
              {matches.length} {matches.length === 1 ? "person has" : "people have"} reported losing similar items
              {highMatches > 0 && (
                <span className="text-green-700">
                  {" "}
                  ({highMatches} high {highMatches === 1 ? "match" : "matches"})
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
            className={`p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
              item.matchScore >= 80
                ? "border-l-green-500"
                : item.matchScore >= 60
                ? "border-l-blue-500"
                : "border-l-amber-500"
            }`}
            onClick={() => onItemClick(item)}
          >
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
                    <h4 className="text-gray-900 truncate mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                        Lost
                      </Badge>
                      <Badge className={`text-xs ${getMatchQualityColor(item.matchScore)}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {item.matchScore}% - {getMatchQualityLabel(item.matchScore)}
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
                    <span>Lost on {item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-green-700">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
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
