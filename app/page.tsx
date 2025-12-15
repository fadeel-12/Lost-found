"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "../components/SearchBar";
import { Button } from "../components/button";
import { PlusCircle, Package, LogIn } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import { ItemCard } from "../components/ItemCard";
import { useAuth } from "../hooks/useAuth";
import { AuthDialogs } from "../components/dialogs/AuthDialogs";
import { ItemDetailsDialog } from "../components/dialogs/ItemDetailsDialog";
import { ReportItemDialog } from "../components/dialogs/ReportItemDialog";
import { SuccessDialog } from '../components/dialogs/SuccessDialog';
import { LOCATIONS } from "../components/SearchBar";

function HomeContent() {
  const {
    user,
    loading,
    shouldOpenSignInFromQuery,
    clearShouldOpenSignInFromQuery,
    setUser,
    logout,
  } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [reportOpen, setReportOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successReportType, setSuccessReportType] = useState<'lost' | 'found'>('lost');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [openReportAfterLogin, setOpenReportAfterLogin] = useState(false);

  async function loadItems() {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      console.log("Loaded items:", data);
      setItems(data);
    } catch (e) {
      console.error("Failed to load items:", e);
    } finally {
      setLoadingItems(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  if (!loading && shouldOpenSignInFromQuery) {
    setSignInOpen(true);
    clearShouldOpenSignInFromQuery();
  }

  const parseItemDate = (dateStr: string) => {
    const parsed = new Date(dateStr);

    if (isNaN(parsed.getTime())) {
      console.warn("Invalid date:", dateStr);
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };


  const matchesDateRange = (dateStr: string, range: string) => {
    if (range === "all") return true;

    const itemDate = parseItemDate(dateStr);
    if (!itemDate) return false;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(now);

    switch (range) {
      case "today":
        return itemDate.getTime() === now.getTime();

      case "yesterday":
        start.setDate(now.getDate() - 1);
        return itemDate.getTime() === start.getTime();

      case "week":
        start.setDate(now.getDate() - 7);
        break;

      case "month":
        start.setDate(now.getDate() - 30);
        break;

      case "3months":
        start.setDate(now.getDate() - 90);
        break;

      default:
        return true;
    }

    return itemDate >= start && itemDate <= now;
  };


  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      q === "" ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    const matchesTab =
      activeTab === "all" || item.status === activeTab;

    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation = (() => {
      if (selectedLocation === "all") return true;

      const loc = LOCATIONS.find((l) => l.value === selectedLocation);
      if (!loc) return true;

      const exactLocation = loc.label.split(",")[0].toLowerCase();
      return item.location.toLowerCase().includes(exactLocation);
    })();

    const matchesDate =
      matchesDateRange(item.date, selectedDateRange);

    return matchesSearch && matchesTab && matchesCategory && matchesLocation && matchesDate;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleReportItemClick = () => {
    if (loading) return;
    if (!user) {
      setSignInOpen(true);
      setOpenReportAfterLogin(true);
      return;
    }
    setReportOpen(true);
  };

  const handleContactOwner = () => {
    if (loading) return;
    if (!user) {
      setDetailsDialogOpen(false);
      setSignInOpen(true);
      return;
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleReportSuccess = (reportType: 'lost' | 'found') => {
    setSuccessReportType(reportType);
    setReportOpen(false);
    setSuccessOpen(true);
    loadItems()
  };

  const handleReportAnother = () => {
    setSuccessOpen(false);
    setReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <h1 className="text-blue-600 text-xl font-semibold">UIBK Lost and Found</h1>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {user === undefined ? null : !user ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setSignInOpen(true)}
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={logout}
                >
                  Logout
                </Button>
              )}

              <Button className="gap-2" onClick={handleReportItemClick}>
                <PlusCircle className="h-5 w-5" />
                Report Item
              </Button>
            </div>
          </div>

          <SearchBar
            onSearch={handleSearch}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
            onLocationChange={setSelectedLocation}
            onCategoryChange={setSelectedCategory}
            onDateRangeChange={setSelectedDateRange}
            onClearFilters={() => {
              setSelectedLocation('all');
              setSelectedCategory('all');
              setSelectedDateRange('all');
            }}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} found
          </p>
        </div>

        {loadingItems ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-gray-500">Loading items...</h3>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} {...item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>Lost & Found - Helping reunite people with their belongings</p>
        </div>
      </footer>

      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        reportType={successReportType}
        onReportAnother={handleReportAnother}
      />

      <ReportItemDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSuccess={handleReportSuccess}
        user={user}
      />

      <ItemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItem}
        onContactOwner={handleContactOwner}
      />

      <AuthDialogs
        signInOpen={signInOpen}
        onSignInOpenChange={setSignInOpen}
        signUpOpen={signUpOpen}
        onSignUpOpenChange={setSignUpOpen}
        verifyEmailOpen={verifyEmailOpen}
        onVerifyEmailOpenChange={setVerifyEmailOpen}
        verifyEmail={verifyEmail}
        setVerifyEmail={setVerifyEmail}
        forgotOpen={forgotOpen}
        onForgotOpenChange={setForgotOpen}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        onSignedIn={(user) => {
          setUser(user);
          if (openReportAfterLogin) {
            setReportOpen(true);
            setOpenReportAfterLogin(false);
          }
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading Lostify…</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}