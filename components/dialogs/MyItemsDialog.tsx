"use client";

import { MapPin, Calendar, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export interface UserItem {
  id: string;
  title: string;
  category: string;
  type: "lost" | "found";
  location: string;
  date: string;
  imageUrl: string;
  description: string;
  status?: "open" | "recovered" | "deleted";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lostItems: UserItem[];
  foundItems: UserItem[];
  onItemClick?: (item: UserItem) => void;
};

export function MyItemsDialog({
  open,
  onOpenChange,
  lostItems,
  foundItems,
  onItemClick,
}: Props) {
  const renderItemCard = (item: UserItem) => (
    <div
      key={item.id}
      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors relative"
      onClick={() => onItemClick?.(item)}
    >
      {item.status === "recovered" && (
        <Badge className="absolute top-2 right-2 bg-green-600">Recovered</Badge>
      )}

      {item.status === "deleted" && (
        <Badge className="absolute top-2 right-2 bg-red-600">Deleted</Badge>
      )}

      <div className="flex gap-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-md flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
            No Image
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.date}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>My Items</DialogTitle>
          <DialogDescription>View your reported lost and found items</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="lost" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
            <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="mt-4 flex-1 overflow-y-auto min-h-0">
            {lostItems.length > 0 ? (
              <div className="space-y-3 pr-2">
                {lostItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-1">No lost items reported</p>
                <p className="text-sm text-gray-400">You haven't reported any lost items yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="mt-4 flex-1 overflow-y-auto min-h-0">
            {foundItems.length > 0 ? (
              <div className="space-y-3 pr-2">
                {foundItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-1">No found items reported</p>
                <p className="text-sm text-gray-400">You haven't reported any found items yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
