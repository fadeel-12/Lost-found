"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  Trash2,
  Plane,
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
import { ShippingRequestDialog } from "@/components/dialogs/ShippingRequestDialog";
import { ShippingRequestsPanel } from "@/components/ShippingRequestsPanel";

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
  is_pet?: boolean;
  pet_name?: string | null;
  species?: string | null;
  breed?: string | null;
  pet_color?: string | null;
  microchip?: string | null;
}

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactOwner: () => void;
  onMarkRecovered: () => void;
  onDeleteItem: () => void;
  item: LostifyItem | null;
  currentUserId: string | null;
  currentUser?: { name: string | null; email: string; phone: string | null } | null;
  onOpenItemMessages: (itemId: string) => void;
  onItemClick: (item: LostifyItem) => void;
}

export function ItemDetailsDialog({
  open,
  onOpenChange,
  item,
  currentUserId,
  currentUser,
  onContactOwner,
  onMarkRecovered,
  onDeleteItem,
  onOpenItemMessages,
  onItemClick,
}: ItemDetailsDialogProps) {
  const isOwner = !!currentUserId && !!item && item.user_id === currentUserId;

  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  useEffect(() => {
    if (!open || !item?.id) {
      setPotentialMatches([]);
      return;
    }

    setLoadingMatches(true);
    fetch(`/api/items/${item.id}/matches`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setPotentialMatches(Array.isArray(data) ? data : []))
      .catch(() => setPotentialMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [open, item?.id]);

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
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {item.is_pet && (
            <div className="space-y-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-700 flex items-center gap-2">
                🐾 Pet Details
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-sm">
                {item.pet_name && (
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{item.pet_name}</p></div>
                )}
                {item.species && (
                  <div><p className="text-gray-500">Species</p><p className="font-medium">{item.species}</p></div>
                )}
                {item.breed && (
                  <div><p className="text-gray-500">Breed</p><p className="font-medium">{item.breed}</p></div>
                )}
                {item.pet_color && (
                  <div><p className="text-gray-500">Color / Markings</p><p className="font-medium">{item.pet_color}</p></div>
                )}
                {item.microchip && (
                  <div className="col-span-2"><p className="text-gray-500">Microchip</p><p className="font-medium font-mono">{item.microchip}</p></div>
                )}
              </div>
            </div>
          )}

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

          <div className="flex gap-3 pt-4 flex-wrap">
            {!isOwner && item.type === "found" && (
              <Button
                variant="outline"
                className="flex-1 gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setShippingOpen(true)}
              >
                <Plane className="h-4 w-4" />
                Request Shipping
              </Button>
            )}
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
          {/* Finder: shipping requests panel */}
          {isOwner && item.type === "found" && (
            <ShippingRequestsPanel itemId={item.id} />
          )}

          {loadingMatches ? (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center py-6 text-sm text-gray-400">
              Searching for potential matches…
            </div>
          ) : (
            <PotentialMatchesSection
              matches={potentialMatches}
              onItemClick={handleMatchClick}
            />
          )}
        </div>
      </DialogContent>

      {/* Shipping request form — shown to non-owners of found items */}
      <ShippingRequestDialog
        open={shippingOpen}
        onOpenChange={setShippingOpen}
        itemId={item.id}
        itemTitle={item.title}
        prefillName={currentUser?.name ?? ""}
        prefillEmail={currentUser?.email ?? ""}
        prefillPhone={currentUser?.phone ?? ""}
      />
    </Dialog>
  );
}
