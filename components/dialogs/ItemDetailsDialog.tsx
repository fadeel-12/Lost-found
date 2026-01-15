"use client";

import { useMemo } from "react";
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Separator } from "@/components/ui/separator";
import { PotentialMatchesSection, PotentialMatch } from "@/components/PotentialMatchesSection";
import { findPotentialMatches, Item as MatchItem } from "@/lib/potentialMatchesUtils";

export interface LostifyItem {
  id: string;
  title: string;
  category: string;
  type: "lost" | "found";
  location: string;
  date: string;
  imageUrl: string | null;
  description: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  user_id?: string;
  status?: "open" | "recovered" | "deleted";
}

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactOwner: () => void;
  onMarkRecovered: () => void;
  onDeleteItem: () => void;
  item: LostifyItem | null;
  currentUserId: string | null;
  onOpenItemMessages: (itemId: string) => void;
  allItems?: LostifyItem[];
  onItemClick: (item: LostifyItem) => void;
}

export function ItemDetailsDialog({
  open,
  onOpenChange,
  item,
  currentUserId,
  onContactOwner,
  onMarkRecovered,
  onDeleteItem,
  onOpenItemMessages,
  allItems = [],
  onItemClick
}: ItemDetailsDialogProps) {
  const isOwner = !!currentUserId && !!item && item.user_id === currentUserId;

  const potentialMatches = useMemo(() => {
    if (!item) return [];
    if (item.type !== "found") return [];
    if (allItems.length === 0) return [];

    const foundItem: MatchItem = {
      ...item,
      imageUrl: item.imageUrl ?? null,
      contactName: item.contactName ?? "",
      contactEmail: item.contactEmail ?? "",
    };

    const pool: MatchItem[] = allItems.map((it) => ({
      ...it,
      imageUrl: it.imageUrl ?? null,
      contactName: it.contactName ?? "",
      contactEmail: it.contactEmail ?? "",
    }));

    return findPotentialMatches(foundItem, pool);
  }, [item, allItems]);

  const handleMatchClick = (clicked: PotentialMatch) => {
    const normalized: LostifyItem = {
      id: clicked.id,
      title: clicked.title,
      category: clicked.category,
      type: clicked.type,
      location: clicked.location,
      date: clicked.date,
      imageUrl: clicked.imageUrl ?? null,
      description: clicked.description,
      contactName: clicked.contactName,
      contactEmail: clicked.contactEmail,
      contactPhone: clicked.contactPhone,
    };

    onItemClick?.(normalized);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="pr-8">{item.title}</DialogTitle>
            <Badge variant={item.type === 'lost' ? 'destructive' : 'default'} className="shrink-0">
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </Badge>
          </div>
          <DialogDescription>
            View detailed information about this {item.type} item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <ImageWithFallback
              src={item.imageUrl ?? ""}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2">Item Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">{item.category}</Badge>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{item.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {item.type === 'lost' ? 'Lost on' : 'Found on'}
                    </p>
                    <p>{item.date}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3">Contact Information</h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                {item.contactName && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p>{item.contactName}</p>
                    </div>
                  </div>
                )}

                {item.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${item.contactEmail}`} className="text-blue-600 hover:underline">
                        {item.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {item.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${item.contactPhone}`} className="text-blue-600 hover:underline">
                        {item.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!isOwner && (
              <Button className="flex-1 gap-2" onClick={onContactOwner}>
                <MessageCircle className="h-4 w-4" />
                Contact Owner
              </Button>
            )}

            {isOwner && (
              <>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => onOpenItemMessages(item.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={onMarkRecovered}
                  variant="outline"
                  disabled={item.status !== "open"}
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Recovered
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDeleteItem}
                  className="flex-1 gap-2"
                  disabled={item.status !== "open"}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Item
                </Button>
              </>
            )}
          </div>
          {item.type === "found" && (
            <PotentialMatchesSection matches={potentialMatches as any} onItemClick={handleMatchClick} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
