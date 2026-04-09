"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";

const STAT_VALUES = ["94%", "1,200+", "3,500+", "< 48h"];

const FALLBACK_TESTIMONIALS = [
  {
    name: "Anna M.",
    role: "Student, Computer Science",
    rating: 5,
    text: "I lost my laptop bag between lectures and found it within a day through Lostify. Incredibly fast and easy to use!",
  },
  {
    name: "Prof. Klaus R.",
    role: "Faculty, Mathematics",
    rating: 5,
    text: "A student returned my USB drive with important research data after finding it via Lostify. This platform is a real asset for our campus.",
  },
  {
    name: "Sofia T.",
    role: "Student, Biology",
    rating: 4,
    text: "Reporting a found item took less than 2 minutes. The potential match feature is brilliant — it connected me with the owner automatically.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function ClientSatisfactionSection() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setReviews(data);
      })
      .catch(() => {});
  }, []);

  const testimonials =
    reviews.length > 0
      ? reviews.map((r) => ({
          name: r.user?.name ?? "Anonymous",
          role: "UIBK Community Member",
          rating: r.rating,
          text: r.comment || "Great experience recovering my item through Lostify!",
        }))
      : FALLBACK_TESTIMONIALS;

  return (
    <section className="bg-white border-t">
      <div className="container mx-auto px-4 py-16">

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t.satisfaction.heading}
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            {t.satisfaction.subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {[
            { value: STAT_VALUES[0], label: t.satisfaction.recoveryRate },
            { value: STAT_VALUES[1], label: t.satisfaction.itemsRecovered },
            { value: STAT_VALUES[2], label: t.satisfaction.registeredUsers },
            { value: STAT_VALUES[3], label: t.satisfaction.avgResponse },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 flex flex-col gap-4">
              <Quote className="h-6 w-6 text-blue-100 fill-blue-100" />
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <StarRating rating={t.rating} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
