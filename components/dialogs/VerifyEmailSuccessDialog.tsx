"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VerifyEmailSuccessDialogProps {
  open: boolean;
  token: string;
  onDone: () => void;
}

export function VerifyEmailSuccessDialog({ open, token, onDone }: VerifyEmailSuccessDialogProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "expired">(
    "idle"
  );

  useEffect(() => {
    if (!open || !token) return;

    setStatus("loading");

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error === "Token expired") {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          toast.error(data.error || "Could not verify email");
          return;
        }

        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err) {
        setStatus("error");
        toast.error("Network error. Please try again.");
      }
    };

    verify();
  }, [open, token]);

  const title =
    status === "success"
      ? "Email Verified"
      : status === "expired"
      ? "Verification Link Expired"
      : status === "error"
      ? "Verification Failed"
      : "Verifying Email…";

  const description =
    status === "success"
      ? "Your email has been successfully verified. You can now sign in to your account."
      : status === "expired"
      ? "This verification link has expired. Please request a new verification email from the sign-in dialog."
      : status === "error"
      ? "This verification link is invalid or something went wrong. Please try again or request a new link."
      : "Please wait while we verify your email…";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {status !== "loading" && (
          <div className="mt-4 flex justify-end">
            <Button onClick={onDone}>OK</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
