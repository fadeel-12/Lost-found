"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
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

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  studentId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => Promise<void> | void;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  userProfile,
  onUpdateProfile,
}: Props) {
  const [edited, setEdited] = useState<UserProfile>(userProfile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setEdited(userProfile);
  }, [open, userProfile]);

  const handleInput = (field: keyof UserProfile, value: string) => {
    setEdited((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async () => {
    if (!edited.name.trim()) return toast.error("Name is required");
    if (!edited.phone.trim()) return toast.error("Phone number is required");

    try {
      setSaving(true);
      await onUpdateProfile(edited);
      toast.success("Profile updated successfully!");
      onOpenChange(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEdited(userProfile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={edited.name}
                onChange={(e) => handleInput("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={edited.email}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={edited.phone}
                onChange={(e) => handleInput("phone", e.target.value)}
                placeholder="+43 664 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={edited.studentId}
                onChange={(e) => handleInput("studentId", e.target.value)}
                placeholder="e.g., 12345678"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="gap-2" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
