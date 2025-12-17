"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (reportType: 'lost' | 'found') => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    email_verified: boolean;
    verified_at: string | null;
    created_at: string;
    student_id: string | null;
  } | null | undefined;
}

type Category = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

export function ReportItemDialog({ open, onOpenChange, onSuccess, user }: ReportItemDialogProps) {

  const [formData, setFormData] = useState({
    type: "lost",
    name: "",
    email: "",
    phone: "",
    itemName: "",
    category: "",
    description: "",
    location: "",
    date: "",
    image: null as File | null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [catRes, locRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
        ]);

        if (!catRes.ok) throw new Error('Failed to load categories');
        if (!locRes.ok) throw new Error('Failed to load locations');

        const catJson = await catRes.json();
        const locJson = await locRes.json();

        setCategories(catJson.categories ?? []);
        setLocations(locJson.locations ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load categories/locations. Please try again.');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  useEffect(() => {
    if (open && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be signed in to report an item.");
      return;
    }

    if (!formData.category || !formData.location) {
      toast.error("Please select both category and location.");
      return;
    }

    const reportType = formData.type as "lost" | "found";

    const payload = new FormData();
    payload.append("user_id", user.id);
    payload.append("category_id", formData.category);
    payload.append("location_id", formData.location);
    payload.append("title", formData.itemName);
    payload.append("description", formData.description);
    payload.append("date", formData.date);
    payload.append("type", formData.type);
    payload.append("status", "open");

    if (formData.name) payload.append("name", formData.name);
    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/items", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit item");
      }

      setFormData({
        type: "lost",
        name: "",
        email: "",
        phone: "",
        itemName: "",
        category: "",
        description: "",
        location: "",
        date: "",
        image: null,
      });

      if (onSuccess) {
        onSuccess(reportType);
      } else {
        toast.success(`${reportType === 'lost' ? 'Lost' : 'Found'} item report submitted successfully!`);
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Could not submit item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Item</DialogTitle>
          <DialogDescription>
            Fill in the details to report a lost or found item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Item Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer">Lost Item</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="cursor-pointer">Found Item</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2">Your Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                disabled={!!user?.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={!!user?.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                disabled={!!user?.phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2">Item Details</h3>

            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="e.g. Black Backpack, iPhone 14, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingOptions ? 'Loading categories...' : 'Select a category'}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed description including color, brand, distinctive features..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingOptions ? 'Loading locations...' : 'Select a location'}
                  />
                </SelectTrigger>

                <SelectContent className="max-h-56">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Upload Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {formData.image ? formData.image.name : 'Click to upload an image'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
