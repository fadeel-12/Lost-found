"use client";

import { useState } from "react";
import { Plane, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ISO 3166-1 alpha-2 country list (common ones + full list subset)
const COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "DE", name: "Germany" },
  { code: "CH", name: "Switzerland" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "SK", name: "Slovakia" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "HR", name: "Croatia" },
  { code: "SI", name: "Slovenia" },
  { code: "TR", name: "Turkey" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" },
].sort((a, b) => a.name.localeCompare(b.name));

interface ShippingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemTitle: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillPhone?: string;
}

export function ShippingRequestDialog({
  open,
  onOpenChange,
  itemId,
  itemTitle,
  prefillName = "",
  prefillEmail = "",
  prefillPhone = "",
}: ShippingRequestDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: prefillName,
    email: prefillEmail,
    phone: prefillPhone,
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    notes: "",
  });

  // Sync prefill when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) {
      setForm((prev) => ({
        ...prev,
        name: prefillName || prev.name,
        email: prefillEmail || prev.email,
        phone: prefillPhone || prev.phone,
      }));
    }
    onOpenChange(val);
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/items/${itemId}/shipping-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit request");
      toast.success("Shipping request sent! The finder will be notified.");
      onOpenChange(false);
      setForm({
        name: prefillName,
        email: prefillEmail,
        phone: prefillPhone,
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        notes: "",
      });
    } catch (err: any) {
      toast.error(err.message ?? "Could not send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" />
            Request International Shipping
          </DialogTitle>
          <DialogDescription>
            Request the finder to ship <strong>{itemTitle}</strong> to your address.
            They will contact you to arrange payment for shipping costs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Contact info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Your Contact Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="sr-name">Full Name *</Label>
                <Input
                  id="sr-name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sr-email">Email *</Label>
                <Input
                  id="sr-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sr-phone">Phone</Label>
                <Input
                  id="sr-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Shipping Address</h3>
            <div className="space-y-1.5">
              <Label htmlFor="sr-addr1">Address Line 1 *</Label>
              <Input
                id="sr-addr1"
                required
                value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
                placeholder="Street address, apartment, suite, unit…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-addr2">Address Line 2</Label>
              <Input
                id="sr-addr2"
                value={form.address_line2}
                onChange={(e) => set("address_line2", e.target.value)}
                placeholder="Building, floor (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sr-city">City *</Label>
                <Input
                  id="sr-city"
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sr-state">State / Region</Label>
                <Input
                  id="sr-state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="State / Province"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sr-postal">Postal Code *</Label>
                <Input
                  id="sr-postal"
                  required
                  value={form.postal_code}
                  onChange={(e) => set("postal_code", e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country *</Label>
                <Select value={form.country} onValueChange={(v) => set("country", v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="sr-notes">Note to Finder (optional)</Label>
            <Textarea
              id="sr-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any extra details — proof of ownership, urgency, etc."
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-sm text-amber-800">
            <Package className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Shipping costs are arranged directly between you and the finder. This request only notifies them of your address.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={submitting || !form.country}>
              {submitting ? "Sending…" : "Send Shipping Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
