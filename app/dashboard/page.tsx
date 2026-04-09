"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, MapPin, QrCode, CheckCircle, Clock, XCircle,
  ArrowLeft, Bell, TrendingUp, Package, Layers, PawPrint,
  LogOut, Tag, RefreshCw, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = "open" | "recovered" | "deleted";
type TagStatus  = "pending_payment" | "active" | "deactivated" | "expired";

interface DashItem {
  id: string;
  title: string;
  type: "lost" | "found";
  status: ItemStatus;
  date: string;
  imageUrl: string | null;
  is_pet: boolean;
  pet_name: string | null;
  species: string | null;
  category: string;
  location: string;
}

interface DashTag {
  id: string;
  label: string;
  status: TagStatus;
  is_pet: boolean;
  microchip: string | null;
  created_at: string;
  expires_at: string | null;
}

interface Stats {
  totalItems: number;
  lostOpen: number;
  foundOpen: number;
  recovered: number;
  petItems: number;
  qrActive: number;
  qrPending: number;
  qrExpired: number;
  matchCount: number;
  unreadNotifications: number;
}

interface DashData {
  user: { name: string | null; email: string };
  stats: Stats;
  items: DashItem[];
  qrTags: DashTag[];
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ItemStatus }) {
  const map: Record<ItemStatus, { label: string; cls: string }> = {
    open:      { label: "Open",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
    recovered: { label: "Recovered", cls: "bg-green-50 text-green-700 border-green-200" },
    deleted:   { label: "Deleted",   cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const { label, cls } = map[status] ?? map.open;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function TagStatusIcon({ status }: { status: TagStatus }) {
  if (status === "active")          return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "pending_payment") return <Clock className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-gray-400" />;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found" | "pets">("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData(await res.json());
      setError("");
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{error || "Something went wrong"}</p>
          <Button className="mt-4" onClick={() => fetchData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { user, stats, items, qrTags } = data;

  // Filtered items for tabs
  const filteredItems = items.filter((i) => {
    if (i.status === "deleted") return false;
    if (activeTab === "lost")  return i.type === "lost" && !i.is_pet;
    if (activeTab === "found") return i.type === "found" && !i.is_pet;
    if (activeTab === "pets")  return i.is_pet;
    return true;
  });

  const pendingTags = qrTags.filter((t) => t.status === "pending_payment");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top nav bar ── */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 font-bold text-xl tracking-tight">Lostify</Link>
            <span className="text-gray-300 text-lg">/</span>
            <span className="text-gray-600 font-medium text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-gray-500"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {stats.unreadNotifications > 0 && (
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 relative text-gray-500">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {stats.unreadNotifications > 9 ? "9+" : stats.unreadNotifications}
                  </span>
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Welcome banner ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Welcome back</p>
              <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
              <p className="text-blue-100 text-sm mt-1">{user.email}</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-blue-100">Total Reports</p>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-bold">{stats.recovered}</p>
                <p className="text-xs text-blue-100">Recovered</p>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-bold">{stats.matchCount}</p>
                <p className="text-xs text-blue-100">Matches</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Search className="h-5 w-5 text-red-600" />}
            label="Lost Items"
            value={stats.lostOpen}
            sub="currently open"
            color="bg-red-50"
          />
          <StatCard
            icon={<Package className="h-5 w-5 text-blue-600" />}
            label="Found Items"
            value={stats.foundOpen}
            sub="currently open"
            color="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            label="Recovered"
            value={stats.recovered}
            sub="total resolved"
            color="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            label="Matches Found"
            value={stats.matchCount}
            sub="potential matches"
            color="bg-purple-50"
          />
        </div>

        {/* ── Second stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<PawPrint className="h-5 w-5 text-orange-600" />}
            label="Pet Reports"
            value={stats.petItems}
            sub="lost & found pets"
            color="bg-orange-50"
          />
          <StatCard
            icon={<QrCode className="h-5 w-5 text-blue-600" />}
            label="Active QR Tags"
            value={stats.qrActive}
            sub="downloadable"
            color="bg-blue-50"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            label="Expired Tags"
            value={stats.qrExpired}
            sub="need renewal"
            color="bg-red-50"
          />
          <StatCard
            icon={<Bell className="h-5 w-5 text-rose-600" />}
            label="Notifications"
            value={stats.unreadNotifications}
            sub="unread"
            color="bg-rose-50"
          />
        </div>

        {/* ── Main content: Items + QR Tags ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Items section (2/3 width) ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">My Items</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filteredItems.length}
                </span>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["all", "lost", "found", "pets"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                      activeTab === tab
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "pets" ? "🐾 Pets" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <Layers className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No items to show</p>
                <Link href="/">
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                    Report an Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[540px] overflow-y-auto">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {item.is_pet ? "🐾" : "📦"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.is_pet && item.pet_name ? `${item.pet_name} (${item.title})` : item.title}
                        </p>
                        {item.is_pet && (
                          <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-1.5 py-0.5">
                            🐾 {item.species ?? "Pet"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs font-medium ${item.type === "lost" ? "text-red-600" : "text-blue-600"}`}>
                          {item.type === "lost" ? "Lost" : "Found"}
                        </span>
                        {item.category && (
                          <span className="text-xs text-gray-400">· {item.category}</span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-0.5 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />{item.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-400">{items.length} total item{items.length !== 1 ? "s" : ""}</p>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 gap-1">
                    View on Homepage
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Right column: QR Tags ── */}
          <div className="space-y-5">

            {/* QR Tags card */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">QR Tags</h3>
                </div>
                <Link href="/?qr_tags=open">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                    Manage
                  </Button>
                </Link>
              </div>

              {/* Summary pills */}
              {(() => {
                const activeTags      = qrTags.filter((t) => t.status === "active");
                const pendingTags     = qrTags.filter((t) => t.status === "pending_payment");
                const deactivatedTags = qrTags.filter((t) => t.status === "deactivated");
                const expiredTags     = qrTags.filter((t) => t.status === "expired");
                return (
                  <div className="flex gap-2 px-5 py-3 border-b bg-gray-50 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {activeTags.length} Active
                    </div>
                    {pendingTags.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        {pendingTags.length} Pending
                      </div>
                    )}
                    {expiredTags.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {expiredTags.length} Expired
                      </div>
                    )}
                    {deactivatedTags.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {deactivatedTags.length} Inactive
                      </div>
                    )}
                  </div>
                );
              })()}

              {qrTags.length === 0 ? (
                <div className="py-10 text-center">
                  <Tag className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No QR tags yet</p>
                  <Link href="/?qr_tags=open">
                    <Button variant="outline" size="sm" className="mt-2 gap-1 text-xs">
                      Create Tag
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {qrTags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-3 px-4 py-2.5">
                      <TagStatusIcon status={tag.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {tag.is_pet ? "🐾 " : ""}{tag.label}
                          </span>
                        </div>
                        {tag.is_pet && tag.microchip && (
                          <p className="text-xs text-orange-600 font-mono">Chip: {tag.microchip}</p>
                        )}
                        {tag.expires_at && tag.status === "active" && (() => {
                          const exp = new Date(tag.expires_at);
                          const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const soon = daysLeft <= 30;
                          return (
                            <p className={`text-xs ${soon ? "text-amber-600 font-medium" : "text-gray-400"}`}>
                              {soon ? "⚠️ " : ""}Expires {exp.toLocaleDateString()}
                            </p>
                          );
                        })()}
                        {tag.status === "expired" && tag.expires_at && (
                          <p className="text-xs text-red-400">
                            Expired {new Date(tag.expires_at).toLocaleDateString()}
                          </p>
                        )}
                        {tag.status !== "active" && tag.status !== "expired" && (
                          <p className="text-xs text-gray-400">
                            {new Date(tag.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          tag.status === "active"
                            ? "text-green-700 border-green-200"
                            : tag.status === "pending_payment"
                            ? "text-amber-700 border-amber-200"
                            : tag.status === "expired"
                            ? "text-red-500 border-red-200"
                            : "text-gray-400 border-gray-200"
                        }`}
                      >
                        {tag.status === "pending_payment" ? "Unpaid" : tag.status.charAt(0).toUpperCase() + tag.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment disabled — no pending payment banner */}
            </div>

            {/* Quick links card */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors group">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Browse Items</p>
                    <p className="text-xs text-gray-400">View all lost &amp; found</p>
                  </div>
                </Link>

                <Link href="/?qr_tags=open" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition-colors group">
                  <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <QrCode className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manage QR Tags</p>
                    <p className="text-xs text-gray-400">Create, download, pay</p>
                  </div>
                </Link>

                {stats.matchCount > 0 && (
                  <Link href="/" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50 transition-colors group">
                    <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">View Matches</p>
                      <p className="text-xs text-gray-400">{stats.matchCount} potential match{stats.matchCount !== 1 ? "es" : ""} found</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Activity summary bar ── */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            Items Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Open Lost",      count: stats.lostOpen,  total: stats.totalItems, color: "bg-red-400" },
              { label: "Open Found",     count: stats.foundOpen, total: stats.totalItems, color: "bg-blue-400" },
              { label: "Recovered",      count: stats.recovered, total: stats.totalItems, color: "bg-green-400" },
              { label: "Pet Reports",    count: stats.petItems,  total: stats.totalItems, color: "bg-orange-400" },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <span className="text-xs font-bold text-gray-700">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: total > 0 ? `${Math.round((count / total) * 100)}%` : "0%" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {total > 0 ? Math.round((count / total) * 100) : 0}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-4 border-t">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">© 2025 Lostify · University Lost &amp; Found</p>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-gray-400 gap-1.5">
              <LogOut className="h-3.5 w-3.5" />
              Back to App
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
