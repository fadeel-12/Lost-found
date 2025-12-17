"use client";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 gap-2">
      <Button variant="outline" disabled={page === 1} onClick={onPrev}>
        Prev
      </Button>

      <span className="px-4 py-2 text-gray-700">
        Page {page} of {totalPages}
      </span>

      <Button variant="outline" disabled={page === totalPages} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
