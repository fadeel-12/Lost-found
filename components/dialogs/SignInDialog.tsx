"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
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
import type { User } from "@/hooks/useAuth";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
  onEmailNotVerified?: (email: string) => void;
  onForgotPassword?: (email: string) => void;
  onSignedIn?: (user: User) => void;
}

export function SignInDialog({
  open,
  onOpenChange,
  onSwitchToSignUp,
  onEmailNotVerified,
  onForgotPassword,
  onSignedIn,
}: SignInDialogProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid email or password");
        return;
      }

      if (data.user && data.user.email_verified === false) {
        toast.message("Please verify your email before signing in.");
        onOpenChange(false);
        onEmailNotVerified?.(formData.email);
        return;
      }

      toast.success("Successfully signed in!");
      setFormData({ email: "", password: "" });
      onOpenChange(false);

      if (data.user) {
        onSignedIn?.(data.user as User);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleSwitchToSignUp = () => {
    onOpenChange(false);
    onSwitchToSignUp?.();
  };

  const handleForgotClick = () => {
    onOpenChange(false);
    onForgotPassword?.(formData.email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LogIn className="h-6 w-6 text-blue-600" />
            <DialogTitle>Sign In</DialogTitle>
          </div>
          <DialogDescription>
            Sign in to your Lost &amp; Found account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signInEmail">Email Address</Label>
            <Input
              id="signInEmail"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="signInPassword">Password</Label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={handleForgotClick}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="signInPassword"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
            />
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
            <Button type="submit" className="flex-1">
              Sign In
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleSwitchToSignUp}
            >
              Sign Up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
