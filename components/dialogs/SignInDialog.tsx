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
import { useTranslation } from "@/contexts/TranslationContext";

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
  const { t } = useTranslation();
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
    onSwitchToSignUp?.();
  };

  const handleForgotClick = () => {
    onForgotPassword?.(formData.email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LogIn className="h-6 w-6 text-blue-600" />
            <DialogTitle>{t.auth.signIn}</DialogTitle>
          </div>
          <DialogDescription>{t.auth.signInDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <a href="/api/auth/google" className="w-full">
            <Button type="button" variant="outline" className="w-full gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t.auth.continueWithGoogle}
            </Button>
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signInEmail">{t.auth.emailAddress}</Label>
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
              <Label htmlFor="signInPassword">{t.auth.password}</Label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={handleForgotClick}
              >
                {t.auth.forgotPassword}
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
              {t.common.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              {t.auth.signIn}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            {t.auth.noAccount}{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleSwitchToSignUp}
            >
              {t.auth.signUp}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
