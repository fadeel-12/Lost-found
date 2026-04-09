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
import { useTranslation } from "@/contexts/TranslationContext";
import { Switch } from "@/components/ui/switch";

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
  const { t } = useTranslation();
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
    isPet: false,
    petName: "",
    species: "",
    breed: "",
    petColor: "",
    microchip: "",
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
        toast.error(t.report.loadFailed);
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
      toast.error(t.report.signInRequired);
      return;
    }

    const reportType = formData.type as "lost" | "found";

    const payload = new FormData();
    payload.append("user_id", user.id);
    if (!formData.isPet) payload.append("category_id", formData.category);
    payload.append("location_id", formData.location);
    payload.append("title", formData.isPet ? (formData.petName || formData.species || "Pet") : formData.itemName);
    payload.append("description", formData.description);
    payload.append("date", formData.date);
    payload.append("type", formData.type);
    payload.append("status", "open");

    if (formData.name) payload.append("name", formData.name);
    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.image) payload.append("image", formData.image);
    payload.append("is_pet", String(formData.isPet));
    if (formData.isPet) {
      if (formData.petName) payload.append("pet_name", formData.petName);
      if (formData.species) payload.append("species", formData.species);
      if (formData.breed) payload.append("breed", formData.breed);
      if (formData.petColor) payload.append("pet_color", formData.petColor);
      if (formData.microchip) payload.append("microchip", formData.microchip);
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
        isPet: false,
        petName: "",
        species: "",
        breed: "",
        petColor: "",
        microchip: "",
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.report.title}</DialogTitle>
          <DialogDescription>{t.report.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>{t.report.itemType}</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer">{t.report.lostItem}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="cursor-pointer">{t.report.foundItem}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pet toggle */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-xl">🐾</span>
            <Label htmlFor="isPet" className="flex-1 cursor-pointer">{t.pet.isPet}</Label>
            <Switch
              id="isPet"
              checked={formData.isPet}
              onCheckedChange={(checked) => setFormData({ ...formData, isPet: checked })}
            />
          </div>

          {/* Pet fields */}
          {formData.isPet && (
            <div className="space-y-4 border border-orange-200 rounded-lg p-4 bg-orange-50/50">
              <h3 className="font-medium text-orange-700">{t.pet.petSection}</h3>

              <div className="space-y-2">
                <Label htmlFor="petName">{t.pet.petName}</Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  placeholder={t.pet.petNamePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">{t.pet.species}</Label>
                <Select
                  value={formData.species}
                  onValueChange={(v) => setFormData({ ...formData, species: v })}
                >
                  <SelectTrigger><SelectValue placeholder={t.pet.selectSpecies} /></SelectTrigger>
                  <SelectContent>
                    {["Dog","Cat","Bird","Rabbit","Hamster","Reptile","Other"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">{t.pet.breed}</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder={t.pet.breedPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="petColor">{t.pet.color}</Label>
                <Input
                  id="petColor"
                  value={formData.petColor}
                  onChange={(e) => setFormData({ ...formData, petColor: e.target.value })}
                  placeholder={t.pet.colorPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchip">{t.pet.microchip}</Label>
                <Input
                  id="microchip"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                  placeholder={t.pet.microchipPlaceholder}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="border-b pb-2">{t.report.yourInfo}</h3>

            <div className="space-y-2">
              <Label htmlFor="name">{t.report.fullName} *</Label>
              <Input
                id="name"
                required
                disabled={!!user?.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.report.fullNamePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.report.emailAddress} *</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={!!user?.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.report.emailPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.report.phoneNumber} *</Label>
              <Input
                id="phone"
                type="tel"
                required
                disabled={!!user?.phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t.report.phonePlaceholder}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2">{t.report.itemDetails}</h3>

            {!formData.isPet && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="itemName">{t.report.itemName} *</Label>
                  <Input
                    id="itemName"
                    required={!formData.isPet}
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder={t.report.itemNamePlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t.report.category}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingOptions ? t.report.loadingCategories : t.report.selectCategory}
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
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t.report.descriptionLabel} *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.report.descriptionPlaceholder}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t.report.locationLabel}</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingOptions ? t.report.loadingLocations : t.report.selectLocation}
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
              <Label htmlFor="date">{t.report.date} *</Label>
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
              <Label htmlFor="image">{t.report.uploadImage}</Label>
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
                    {formData.image ? formData.image.name : t.report.clickToUpload}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t.report.imageFormats}</p>
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
              {t.common.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? t.report.submitting : t.report.submitReport}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
