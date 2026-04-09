"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import {
  Plus, Trash2, Download, QrCode, Loader2, Tag,
  ShoppingCart, CheckCircle, XCircle, CreditCard, Info,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type TagStatus = "pending_payment" | "active" | "deactivated" | "expired";

type QRTag = {
  id: string;
  token: string;
  label: string;
  description?: string;
  created_at: string;
  status: TagStatus;
  is_pet?: boolean;
  microchip?: string | null;
  expires_at?: string | null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getScanUrl(token: string) {
  return typeof window !== "undefined"
    ? `${window.location.origin}/scan/${token}`
    : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/scan/${token}`;
}

// ─── Beautiful QR Tag Card (printable design) ────────────────────────────────
function QRTagVisual({ tag }: { tag: QRTag }) {
  const url = getScanUrl(tag.token);
  const isPet = tag.is_pet;

  // Pet theme: warm orange/amber gradient
  const headerGradient = isPet
    ? "linear-gradient(135deg, #c2410c 0%, #ea580c 60%, #f97316 100%)"
    : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)";
  const headerTextColor  = isPet ? "#fed7aa" : "#bfdbfe";
  const qrAreaBg         = isPet ? "#fff7ed" : "#f8faff";
  const qrBorderColor    = isPet ? "#fed7aa" : "#dbeafe";
  const qrShadowColor    = isPet ? "rgba(234,88,12,0.12)" : "rgba(37,99,235,0.12)";
  const fgColor          = isPet ? "#7c2d12" : "#1e3a8a";

  return (
    <div
      style={{
        width: 220,
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        border: "1.5px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div style={{ background: headerGradient, padding: "14px 12px 10px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: headerTextColor, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>
          {isPet ? "🐾 Scan to Find My Owner 📱" : "🔍 Find Me • Scan Me 📱"}
        </div>
      </div>

      {/* QR Code area */}
      <div style={{ background: qrAreaBg, display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 16px 12px" }}>
        <div style={{ background: "#fff", padding: 8, borderRadius: 10, boxShadow: `0 2px 8px ${qrShadowColor}`, border: `1.5px solid ${qrBorderColor}` }}>
          <QRCode value={url} size={120} fgColor={fgColor} bgColor="#fff" />
        </div>
      </div>

      {/* Label / pet name */}
      <div style={{ background: "#fff", padding: "10px 14px 8px", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
        <div
          style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={tag.label}
        >
          {tag.label}
        </div>
        {tag.description && (
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tag.description}
          </div>
        )}
        {isPet && tag.microchip && (
          <div style={{ fontSize: 9, color: "#c2410c", marginTop: 4, fontFamily: "monospace", letterSpacing: 0.5 }}>
            Chip: {tag.microchip}
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div style={{ background: headerGradient, padding: "6px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 9, color: headerTextColor, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>
          Lostify · Lost &amp; Found
        </div>
      </div>
    </div>
  );
}

// ─── Active tag row (with download) ──────────────────────────────────────────
function ActiveTagCard({ tag, onDelete }: { tag: QRTag; onDelete: (id: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement("a");
      link.download = `qr-${tag.label.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-4 items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Preview */}
      <div ref={cardRef} className="shrink-0">
        <QRTagVisual tag={tag} />
      </div>

      {/* Info + actions */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            Active
          </span>
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate">{tag.label}</p>
        {tag.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tag.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Created {new Date(tag.created_at).toLocaleDateString()}
        </p>
        {tag.expires_at && (() => {
          const exp = new Date(tag.expires_at);
          const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const soon = daysLeft <= 30;
          return (
            <p className={`text-xs mt-0.5 font-medium ${soon ? "text-amber-600" : "text-gray-400"}`}>
              {soon ? "⚠️ " : ""}Expires {exp.toLocaleDateString()} {soon ? `(${daysLeft}d left)` : ""}
            </p>
          );
        })()}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            size="sm"
            className="gap-1.5 text-xs h-7 px-3"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Download PNG
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(tag.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const PET_TAG_PRICE  = 10.00;
const ITEM_TAG_PRICE = 1.00;

function cartTotal(tags: QRTag[]) {
  return tags.reduce((sum, t) => sum + (t.is_pet ? PET_TAG_PRICE : ITEM_TAG_PRICE), 0);
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────
export function QRTagsDialog({ open, onOpenChange }: Props) {
  const [tags, setTags] = useState<QRTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isPet, setIsPet] = useState(false);
  const [microchip, setMicrochip] = useState("");

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr-tags");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load QR tags.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchTags();
  }, [open, fetchTags]);

  const pendingTags     = tags.filter((t) => t.status === "pending_payment");
  const activeTags      = tags.filter((t) => t.status === "active");
  const deactivatedTags = tags.filter((t) => t.status === "deactivated");
  const expiredTags     = tags.filter((t) => t.status === "expired");

  const resetForm = () => {
    setLabel("");
    setDescription("");
    setIsPet(false);
    setMicrochip("");
    setShowForm(false);
  };

  // Add tag to cart (pending_payment) — no payment yet
  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/qr-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          description: description.trim(),
          is_pet: isPet,
          microchip: isPet ? microchip.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add tag");
      setTags((prev) => [data, ...prev]);
      resetForm();
      toast.success(`"${data.label}" added to cart.`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not add tag.");
    } finally {
      setSaving(false);
    }
  };

  // Pay for all pending tags at once
  const handlePayAll = async () => {
    const ids = pendingTags.map((t) => t.id);
    if (ids.length === 0) return;
    setPaying(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initiate payment");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message ?? "Failed to initiate payment.");
      setPaying(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/qr-tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tag removed.");
    } catch {
      toast.error("Failed to delete tag.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            My QR Tags
          </DialogTitle>
          <DialogDescription>
            Create QR tags for your valuables or pets. Tags activate instantly and are valid for 6 months.
          </DialogDescription>
        </DialogHeader>

        {/* ── Add to cart form ── */}
        {!showForm ? (
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Tag to Cart
          </Button>
        ) : (
          <form
            onSubmit={handleAddToCart}
            className={`border rounded-xl p-4 space-y-3 ${isPet ? "border-orange-200 bg-orange-50/40" : "border-blue-200 bg-blue-50/40"}`}
          >
            <p className={`text-sm font-semibold ${isPet ? "text-orange-800" : "text-blue-800"}`}>New QR Tag</p>

            {/* Pet toggle */}
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${isPet ? "bg-orange-100 border-orange-300" : "bg-gray-50 border-gray-200"}`}>
              <span className="text-xl">🐾</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">This is a pet tag</p>
                <p className="text-xs text-gray-500">€10.00 — durable pet ID with owner contact</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPet}
                onClick={() => { setIsPet((v) => !v); setMicrochip(""); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPet ? "bg-orange-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPet ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Microchip field (pet only) + warning */}
            {isPet && (
              <div className="space-y-2">
                <Label htmlFor="tag-microchip">Microchip Number (optional)</Label>
                <Input
                  id="tag-microchip"
                  placeholder="e.g. 956000012345678"
                  value={microchip}
                  onChange={(e) => setMicrochip(e.target.value)}
                />
                {microchip.trim() && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
                    <span>
                      Your pet has a microchip — registered vets can already identify them.
                      A QR tag is a great <strong>backup</strong> so any finder (without a scanner) can reach you instantly.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tag-label">{isPet ? "Pet Name *" : "Item Label *"}</Label>
              <Input
                id="tag-label"
                required
                autoFocus={!isPet}
                placeholder={isPet ? "e.g. Buddy, Luna" : "e.g. My Laptop Bag, Student ID Card"}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag-desc">Description (optional)</Label>
              <Textarea
                id="tag-desc"
                rows={2}
                placeholder={isPet ? "Breed, colour, any distinguishing marks" : "Any extra details for the finder"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Tag type indicator */}
            <div className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 ${isPet ? "bg-orange-100 text-orange-800" : "bg-blue-50 text-blue-700"}`}>
              <span>{isPet ? "🐾 Pet QR Tag" : "🔖 Item QR Tag"}</span>
              <span className="font-medium">Valid 6 months · Free</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 gap-2 ${isPet ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                disabled={saving || !label.trim()}
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
                  : <><CheckCircle className="h-4 w-4" />Create Tag</>
                }
              </Button>
            </div>
          </form>
        )}

        {/* ── Cart: pending payment (payment disabled) ── */}
        {false && pendingTags.length > 0 && (
          <div className="rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Cart — {pendingTags.length} tag{pendingTags.length > 1 ? "s" : ""} awaiting payment
                </span>
              </div>
              <span className="text-sm font-bold text-amber-800">
                €{cartTotal(pendingTags).toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-amber-100 bg-white">
              {pendingTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="shrink-0 text-base">{tag.is_pet ? "🐾" : "🔖"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tag.label}</p>
                    {tag.is_pet && tag.microchip && (
                      <p className="text-xs text-orange-600 font-mono truncate">Chip: {tag.microchip}</p>
                    )}
                    {tag.description && (
                      <p className="text-xs text-gray-400 truncate">{tag.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${tag.is_pet ? "text-orange-700" : "text-amber-700"}`}>
                    {tag.is_pet ? "€10.00" : "€1.00"}
                  </span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
              <div className="text-xs text-amber-700">
                Activates instantly · Valid for 6 months
              </div>
              <Button
                size="sm"
                className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                onClick={handlePayAll}
                disabled={paying}
              >
                {paying
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Redirecting…</>
                  : <><CreditCard className="h-3.5 w-3.5" />Pay €{cartTotal(pendingTags).toFixed(2)}</>
                }
              </Button>
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div className="py-10 text-center">
            <Loader2 className="h-8 w-8 text-gray-300 mx-auto animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading tags…</p>
          </div>
        )}

        {/* ── Active tags ── */}
        {!loading && activeTags.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-700">
                Active Tags ({activeTags.length})
              </span>
            </div>
            <div className="space-y-3">
              {activeTags.map((tag) => (
                <ActiveTagCard key={tag.id} tag={tag} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* ── Expired tags ── */}
        {!loading && expiredTags.length > 0 && (
          <>
            {(activeTags.length > 0 || deactivatedTags.length > 0) && <Separator />}
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-red-700">
                  Expired Tags ({expiredTags.length})
                </span>
                <span className="text-xs text-red-400 ml-1">— renew to reactivate</span>
              </div>
              <div className="divide-y divide-red-50 bg-white">
                {expiredTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-3 px-4 py-2.5 opacity-75">
                    <span className="text-base shrink-0">{tag.is_pet ? "🐾" : "🔖"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate line-through">{tag.label}</p>
                      {tag.expires_at && (
                        <p className="text-xs text-red-400">
                          Expired {new Date(tag.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs text-red-400 border-red-200 shrink-0">
                      Expired
                    </Badge>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Deactivated tags ── */}
        {!loading && deactivatedTags.length > 0 && (
          <>
            {activeTags.length > 0 && <Separator />}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">
                  Deactivated ({deactivatedTags.length})
                </span>
              </div>
              {deactivatedTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                  <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 truncate line-through">{tag.label}</p>
                  </div>
                  <Badge variant="outline" className="text-xs text-gray-400">Deactivated</Badge>
                  <button onClick={() => handleDelete(tag.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && tags.length === 0 && (
          <div className="py-10 text-center">
            <Tag className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No QR tags yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Add tags to your cart, then pay once to activate them all.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
