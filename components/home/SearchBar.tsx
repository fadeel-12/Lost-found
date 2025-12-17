"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const LOCATIONS = [
  { value: "all", label: "All Locations" },
  { value: "hauptgebaude", label: "Main Building (Hauptgebäude), Innrain 52" },
  { value: "library", label: "University Library (Universitätsbibliothek), Innrain 50" },
  { value: "mensa", label: "Mensa (Student Cafeteria), Herzog-Siegmund-Ufer 15" },
  { value: "law", label: "Faculty of Law (Rechtswissenschaften), Innrain 52d" },
  { value: "usi", label: "USI Sports Center (Universitäts-Sportinstitut), Fürstenweg 185" },
  { value: "geology", label: "Bruno Sander Building (Geologie), Innrain 52f" },
  { value: "theology", label: "Faculty of Theology (Theologie), Karl-Rahner-Platz 1" },
  { value: "chemistry", label: "Chemistry Building (Chemie), Innrain 80-82" },
  { value: "physics", label: "Physics Building (Physik), Technikerstraße 25" },
  { value: "biology", label: "Biology Building (Biologie), Technikerstraße 25" },
  { value: "mathematics", label: "Mathematics Building (Mathematik), Technikerstraße 13" },
  { value: "pharmacy", label: "Pharmacy Building (Pharmazie), Innrain 80-82" },
  { value: "architecture", label: "Architecture Building (Architektur), Technikerstraße 21" },
  { value: "sowi", label: "Faculty of Social Sciences (SoWi), Universitätsstraße 15" },
  { value: "psychology", label: "Psychology Building (Psychologie), Innrain 52f" },
  { value: "education", label: "Faculty of Education (LehrerInnenbildung), Liebeneggstraße 8" },
  { value: "ccb", label: "Center for Chemistry and Biomedicine (CCB), Innrain 80-82" },
  { value: "geiwi", label: "GeiWi Faculty Building, Innrain 52" },
  { value: "technik", label: "Faculty of Engineering (Technik), Technikerstraße 13" },
  { value: "atrium", label: "Atrium Building, Universitätsstraße 15" },
  { value: "bwz", label: "Business & Economics (BWZ), Universitätsstraße 15" },
];

export const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "wallet", label: "Wallet" },
  { value: "keys", label: "Keys" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "documents", label: "Documents" },
  { value: "clothing", label: "Clothing" },
  { value: "jewelry", label: "Jewelry" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports Equipment" },
  { value: "personal", label: "Personal Items" },
  { value: "other", label: "Other" },
];

export const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "3months", label: "Last 3 Months" },
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  selectedLocation: string;
  selectedCategory: string;
  selectedDateRange: string;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  onClearFilters: () => void;
}

export function SearchBar({
  onSearch,
  selectedLocation,
  selectedCategory,
  selectedDateRange,
  onLocationChange,
  onCategoryChange,
  onDateRangeChange,
  onClearFilters,
}: SearchBarProps) {
  const [searchInput, setSearchInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    selectedLocation !== "all" ||
    selectedCategory !== "all" ||
    selectedDateRange !== "all";

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleClearAll = () => {
    setSearchInput("");
    onSearch("");
    onClearFilters();
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, onSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400 ml-3" />
          <Input
            type="text"
            placeholder="Search for lost or found items..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                    {
                      [
                        selectedLocation !== "all",
                        selectedCategory !== "all",
                        selectedDateRange !== "all",
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          <Button onClick={handleSearch} className="shrink-0">
            Search
          </Button>
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-gray-700">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2 text-gray-600 hover:text-gray-900 h-8"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="location-filter"
                    className="text-sm text-gray-600"
                  >
                    Location
                  </Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={onLocationChange}
                  >
                    <SelectTrigger id="location-filter" className="h-10">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((location) => (
                        <SelectItem
                          key={location.value}
                          value={location.value}
                        >
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category-filter"
                    className="text-sm text-gray-600"
                  >
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={onCategoryChange}
                  >
                    <SelectTrigger id="category-filter" className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="date-filter"
                    className="text-sm text-gray-600"
                  >
                    Date Range
                  </Label>
                  <Select
                    value={selectedDateRange}
                    onValueChange={onDateRangeChange}
                  >
                    <SelectTrigger id="date-filter" className="h-10">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active:</span>

                    {selectedLocation !== "all" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <span className="text-xs text-blue-500">Location:</span>
                        {
                          LOCATIONS.find(
                            (l) => l.value === selectedLocation
                          )?.label.split(",")[0]
                        }
                        <button
                          onClick={() => onLocationChange("all")}
                          className="hover:text-blue-900 ml-1"
                          aria-label="Remove location filter"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedCategory !== "all" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <span className="text-xs text-green-500">
                          Category:
                        </span>
                        {
                          CATEGORIES.find(
                            (c) => c.value === selectedCategory
                          )?.label
                        }
                        <button
                          onClick={() => onCategoryChange("all")}
                          className="hover:text-green-900 ml-1"
                          aria-label="Remove category filter"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedDateRange !== "all" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <span className="text-xs text-purple-500">
                          Date:
                        </span>
                        {
                          DATE_RANGES.find(
                            (d) => d.value === selectedDateRange
                          )?.label
                        }
                        <button
                          onClick={() => onDateRangeChange("all")}
                          className="hover:text-purple-900 ml-1"
                          aria-label="Remove date filter"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {(hasActiveFilters || searchInput) && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            Clear All Search & Filters
          </Button>
        </div>
      )}
    </div>
  );
}
