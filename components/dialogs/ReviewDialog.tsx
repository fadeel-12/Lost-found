"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/TranslationContext";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  itemId: string;
  onSubmitted?: () => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  userId,
  itemId,
  onSubmitted,
}: ReviewDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRating(0);
    setHovered(0);
    setComment("");
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error(t.review.selectRating);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, item_id: itemId, rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      toast.success(t.review.success);
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch {
      toast.error(t.review.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.review.title}</DialogTitle>
          <DialogDescription>{t.review.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    star <= (hovered || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder={t.review.placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSkip}>
              {t.review.skip}
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t.review.submitting : t.review.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
