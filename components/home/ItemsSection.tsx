"use client";

import { Package } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "@/components/home/ItemCard";
import { PaginationControls } from "@/components/home/PaginationControls";

type Tab = "all" | "lost" | "found";

type Props = {
  activeTab: Tab;
  onTabChange: (v: Tab) => void;

  loadingItems: boolean;
  filteredCount: number;

  items: any[];
  onItemClick: (item: any) => void;

  pagination: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
  };
};

export function ItemsSection({
  activeTab,
  onTabChange,
  loadingItems,
  filteredCount,
  items,
  onItemClick,
  pagination,
}: Props) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as Tab)} className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <p className="text-gray-600">
          {filteredCount} {filteredCount === 1 ? "item" : "items"} found
        </p>
      </div>

      {loadingItems ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-gray-500">Loading items...</h3>
        </div>
      ) : items.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} {...item} onClick={() => onItemClick(item)} />
            ))}
          </div>

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrev={pagination.onPrev}
            onNext={pagination.onNext}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-500 mb-2">No items found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </main>
  );
}
