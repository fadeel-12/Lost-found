import { useMemo } from "react";
import { matchesDateRange, DateRange } from "@/lib/dateRange";

export type Filters = {
  searchQuery: string;
  activeTab: "all" | "lost" | "found";
  selectedCategory: string;
  selectedLocation: string;
  selectedDateRange: DateRange;
  locations: { value: string; label: string }[];
};

export function useItemFilters(items: any[], f: Filters) {
  return useMemo(() => {
    const q = f.searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        q === "" ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      const matchesTab = f.activeTab === "all" || item.type === f.activeTab;

      const matchesCategory =
        f.selectedCategory === "all" ||
        item.category?.toLowerCase() === f.selectedCategory.toLowerCase();

      const matchesLocation = (() => {
        if (f.selectedLocation === "all") return true;
        const loc = f.locations.find((l) => l.value === f.selectedLocation);
        if (!loc) return true;
        const exact = loc.label.split(",")[0].toLowerCase();
        return item.location?.toLowerCase().includes(exact);
      })();

      const matchesDate = matchesDateRange(item.date, f.selectedDateRange);

      return matchesSearch && matchesTab && matchesCategory && matchesLocation && matchesDate;
    });
  }, [items, f]);
}
