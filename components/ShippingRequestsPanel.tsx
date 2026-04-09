"use client";

import { useCallback, useEffect, useState } from "react";
import { Plane, Check, X, Truck, Package, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type ShippingRequest = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  notes: string | null;
  status: "pending" | "accepted" | "shipped" | "delivered" | "rejected";
  tracking_number: string | null;
  created_at: string;
};

const STATUS_BADGE: Record<ShippingRequest["status"], { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  accepted:  { label: "Accepted",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped:   { label: "Shipped",   className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
  rejected:  { label: "Rejected",  className: "bg-red-100 text-red-800 border-red-200" },
};

interface Props {
  itemId: string;
}

export function ShippingRequestsPanel({ itemId }: Props) {
  const [requests, setRequests] = useState<ShippingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}/shipping-requests`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail — the item may not be theirs
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateRequest = async (
    reqId: string,
    update: { status?: string; tracking_number?: string }
  ) => {
    setUpdating(reqId);
    try {
      const res = await fetch(`/api/shipping-requests/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, ...data } : r)));
      toast.success("Shipping request updated.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not update request.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading || requests.length === 0) return null;

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mt-4 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">
            Shipping Requests
          </span>
          {pending > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {pending} new
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-blue-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-600" />
        )}
      </button>

      {expanded && (
        <div className="divide-y">
          {requests.map((req) => {
            const badge = STATUS_BADGE[req.status];
            const isUpdating = updating === req.id;
            return (
              <div key={req.id} className="p-4 space-y-3 bg-white">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{req.requester_name}</p>
                    <p className="text-sm text-gray-500">{req.requester_email}</p>
                    {req.requester_phone && (
                      <p className="text-sm text-gray-500">{req.requester_phone}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                </div>

                {/* Address */}
                <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                  <p className="font-medium text-gray-500 text-xs mb-1">SHIP TO</p>
                  <p>{req.address_line1}</p>
                  {req.address_line2 && <p>{req.address_line2}</p>}
                  <p>{req.city}{req.state ? `, ${req.state}` : ""} {req.postal_code}</p>
                  <p className="font-medium">{req.country}</p>
                </div>

                {req.notes && (
                  <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
                    &ldquo;{req.notes}&rdquo;
                  </p>
                )}

                {/* Tracking number (shown when accepted or shipped) */}
                {(req.status === "accepted" || req.status === "shipped") && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tracking number (optional)"
                      value={trackingInputs[req.id] ?? req.tracking_number ?? ""}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      className="text-sm h-8"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      disabled={isUpdating}
                      onClick={() =>
                        updateRequest(req.id, {
                          tracking_number: trackingInputs[req.id] ?? req.tracking_number ?? "",
                        })
                      }
                    >
                      Save
                    </Button>
                  </div>
                )}

                {req.tracking_number && req.status !== "accepted" && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    Tracking: <span className="font-mono font-medium text-gray-700">{req.tracking_number}</span>
                  </p>
                )}

                <Separator />

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        disabled={isUpdating}
                        onClick={() => updateRequest(req.id, { status: "accepted" })}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5 text-xs"
                        disabled={isUpdating}
                        onClick={() => updateRequest(req.id, { status: "rejected" })}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {req.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={isUpdating}
                      onClick={() =>
                        updateRequest(req.id, {
                          status: "shipped",
                          tracking_number: trackingInputs[req.id] ?? req.tracking_number ?? "",
                        })
                      }
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Mark as Shipped
                    </Button>
                  )}
                  {req.status === "shipped" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={isUpdating}
                      onClick={() => updateRequest(req.id, { status: "delivered" })}
                    >
                      <Package className="h-3.5 w-3.5" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
