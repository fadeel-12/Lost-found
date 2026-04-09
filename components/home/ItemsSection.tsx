"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "@/components/home/ItemCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Tab = "all" | "lost" | "found" | "pets";

type Props = {
  activeTab: Tab;
  onTabChange: (v: Tab) => void;

  loadingItems: boolean;
  filteredCount: number;

  items: any[];
  onItemClick: (item: any) => void;
  onRemoveItem?: (id: string) => void;

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
  onRemoveItem,
  pagination,
}: Props) {
  const { t } = useTranslation();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (pendingRemoveId && onRemoveItem) {
      onRemoveItem(pendingRemoveId);
    }
    setPendingRemoveId(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as Tab)} className="mb-8">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
          <TabsTrigger value="all">{t.items.allItems}</TabsTrigger>
          <TabsTrigger value="lost">{t.items.lostItems}</TabsTrigger>
          <TabsTrigger value="found">{t.items.foundItems}</TabsTrigger>
          <TabsTrigger value="pets">🐾 {t.pet.petsTab}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <p className="text-gray-600">
          {filteredCount === 1
            ? t.items.itemFound
            : t.items.itemsFound.replace("{count}", String(filteredCount))}
        </p>
      </div>

      {loadingItems ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-gray-500">{t.items.loadingItems}</h3>
        </div>
      ) : items.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick(item)}
                onRemove={onRemoveItem ? () => setPendingRemoveId(item.id) : undefined}
              />
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
          <h3 className="text-gray-500 mb-2">
            {activeTab === "pets" ? t.pet.noPets : t.items.noItemsToDisplay}
          </h3>
          <p className="text-gray-400">
            {activeTab === "pets" ? t.pet.noPetsDesc : t.items.allItemsRemoved}
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingRemoveId} onOpenChange={(open) => !open && setPendingRemoveId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.itemDetails.removeItem}</DialogTitle>
            <DialogDescription>{t.itemDetails.removeConfirm}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setPendingRemoveId(null)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleConfirmRemove}>
              {t.common.remove}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
