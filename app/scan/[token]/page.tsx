"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

type TagInfo = {
  id: string;
  label: string;
  description?: string;
};

type Step = "loading" | "found_form" | "submitting" | "success" | "error";

export default function ScanPage() {
  const { token } = useParams<{ token: string }>();

  const [tag, setTag] = useState<TagInfo | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [notFound, setNotFound] = useState(false);

  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/qr-tags/scan/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setTag(data);
        setStep("found_form");
      })
      .catch(() => {
        setNotFound(true);
        setStep("error");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStep("submitting");
    try {
      const res = await fetch(`/api/qr-tags/scan/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, location, contactInfo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setStep("success");
    } catch (err: any) {
      setStep("found_form");
      alert(`Failed to send: ${err?.message ?? "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 text-xl font-semibold">
            UIBK Lost and Found
          </Link>
          <p className="text-gray-500 text-sm mt-1">Secure item recovery</p>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Loader2 className="h-10 w-10 text-blue-500 mx-auto animate-spin mb-3" />
            <p className="text-gray-500">Looking up this item tag…</p>
          </div>
        )}

        {/* Not found */}
        {step === "error" && notFound && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tag Not Found</h2>
            <p className="text-gray-500 text-sm">
              This QR tag does not exist or has been removed.
            </p>
            <Link href="/" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
              Go to Lostify home
            </Link>
          </div>
        )}

        {/* Found form */}
        {step === "found_form" && tag && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  You scanned: <span className="font-bold">{tag.label}</span>
                </p>
                {tag.description && (
                  <p className="text-xs text-blue-600 mt-0.5">{tag.description}</p>
                )}
              </div>
            </div>

            <h2 className="text-gray-800 font-semibold text-lg mb-1">
              Found this item?
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Send an anonymous message to the owner. Your personal info is optional — only share what you are comfortable with.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Message to owner *
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={3}
                  placeholder="e.g. I found your laptop bag near the main library entrance."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Where did you find it? (optional)
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Library, 2nd floor"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">
                  Your contact info (optional)
                </Label>
                <Input
                  id="contactInfo"
                  placeholder="Phone number or email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={!message.trim()}>
                Send Anonymous Message
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              The owner will be notified. Your submission is anonymous unless you provide contact info.
            </p>
          </div>
        )}

        {/* Success */}
        {step === "submitting" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Loader2 className="h-10 w-10 text-blue-500 mx-auto animate-spin mb-3" />
            <p className="text-gray-500">Sending message…</p>
          </div>
        )}

        {step === "success" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Message Sent!</h2>
            <p className="text-gray-500 text-sm mb-6">
              The owner has been notified. Thank you for helping return this item!
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">Back to Lostify</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
