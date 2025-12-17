"use client";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VerifyEmailDialogProps {
  open: boolean;
  email: string;
  onOpenChange: (open: boolean) => void;
}

export function VerifyEmailDialog({ open, email, onOpenChange }: VerifyEmailDialogProps) {
  const handleResendEmail = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.warning || "Could not resend verification email");
      } else {
        toast.success("Verification email resent! Check your inbox.");
      }
    } catch (err) {
      toast.error("Network error. Try again later.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email Verification Required</DialogTitle>
          <DialogDescription>
            Your account ({email}) is not verified yet. Please check your email and click the verification link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={handleResendEmail}>
            Resend Verification Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
