"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { AppNotification } from "@/components/home/NotificationsPanel";
import { Header } from "@/components/home/Header";
import { ItemsSection } from "@/components/home/ItemsSection";
import { Dialogs } from "@/components/home/Dialogs";
import { useHomeController } from "@/hooks/useHomeController";

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

function HomeContent() {
  const c = useHomeController();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [initialChatId, setInitialChatId] = useState<string | null>(null);

  useEffect(() => {
    const signIn = searchParams.get("showSignIn");

    if (signIn !== "true") return;

    if (c.auth.loading) return;

    if (!c.auth.user) {
      c.auth.setSignInOpen(true);
    } else {
      c.auth.setSignInOpen(false);
    }

    router.replace("/", { scroll: false });
  }, [searchParams, router, c.auth.loading, c.auth.user]);

  const handleNotificationClick = (n: AppNotification) => {
    if (n.type === "message" && n.conversationId) {
      setInitialChatId(n.conversationId);
      c.dialogs.setItemMessagesItemId(null);
      c.dialogs.setItemMessagesDialogOpen(true);
      return;
    }

    const targetItemId =
      n.type === "item_match" ? (n.matchItemId ?? null) : (n.itemId ?? null);
    if (!targetItemId) return;
    const item = c.data.filteredItems.find((x: any) => x.id === targetItemId);
    if (item) {
      c.actions.openDetails(item);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        loading={c.auth.loading}
        user={c.auth.user}
        onLogout={c.auth.logout}
        onSignIn={() => c.auth.setSignInOpen(true)}
        onReport={c.actions.openReport}
        search={{
          onSearch: c.filters.setSearchQuery,
          selectedLocation: c.filters.selectedLocation,
          selectedCategory: c.filters.selectedCategory,
          selectedDateRange: c.filters.selectedDateRange,
          onLocationChange: c.filters.setSelectedLocation,
          onCategoryChange: c.filters.setSelectedCategory,
          onDateRangeChange: c.filters.setSelectedDateRange,
          onClearFilters: c.filters.clearFilters,
        }}
        notifications={c.notifications.notifications}
        onNotificationClick={handleNotificationClick}
        onMarkNotifRead={c.notifications.markAsRead}
        onMarkAllNotifRead={c.notifications.markAllAsRead}
        onDeleteNotif={c.notifications.deleteNotification}
        onEditProfile={async () => {
          await c.profile.fetchProfile();
          c.profile.setEditProfileDialogOpen(true);
        }}
        onMyItems={async () => {
          await c.profile.fetchMyItems();
          c.profile.setMyItemsDialogOpen(true);
        }}
      />

      <ItemsSection
        activeTab={c.filters.activeTab}
        onTabChange={c.filters.setActiveTab}
        loadingItems={c.data.loadingItems}
        filteredCount={c.data.filteredItems.length}
        items={c.data.currentItems}
        onItemClick={c.actions.openDetails}
        pagination={{
          page: c.pagination.currentPage,
          totalPages: c.pagination.totalPages,
          onPrev: () => c.pagination.setCurrentPage((p) => p - 1),
          onNext: () => c.pagination.setCurrentPage((p) => p + 1),
        }}
      />

      <Dialogs
        items={c.dialogs.items}
        user={c.auth.user}
        setUser={c.auth.setUser}
        requireAuth={c.auth.requireAuth}
        signInOpen={c.auth.signInOpen}
        setSignInOpen={c.auth.setSignInOpen}
        reportOpen={c.dialogs.reportOpen}
        setReportOpen={c.dialogs.setReportOpen}
        successOpen={c.dialogs.successOpen}
        setSuccessOpen={c.dialogs.setSuccessOpen}
        successReportType={c.dialogs.successReportType}
        onReportSuccess={c.actions.onReportSuccess}
        onRecover={c.actions.handleRecover}
        onDelete={c.actions.handleDelete}
        detailsDialogOpen={c.dialogs.detailsDialogOpen}
        setDetailsDialogOpen={c.dialogs.setDetailsDialogOpen}
        selectedItem={c.dialogs.selectedItem}
        setSelectedItem={c.dialogs.setSelectedItem}
        itemMessagesDialogOpen={c.dialogs.itemMessagesDialogOpen}
        setItemMessagesDialogOpen={c.dialogs.setItemMessagesDialogOpen}
        itemMessagesItemId={c.dialogs.itemMessagesItemId}
        setItemMessagesItemId={c.dialogs.setItemMessagesItemId}
        requestOpenMessagesForItem={c.dialogs.requestOpenMessagesForItem}
        consumePendingMessagesIntent={c.dialogs.consumePendingMessagesIntent}
        consumePendingReportIntent={c.dialogs.consumePendingReportIntent}
        editProfileOpen={c.profile.editProfileDialogOpen}
        setEditProfileOpen={c.profile.setEditProfileDialogOpen}
        myItemsOpen={c.profile.myItemsDialogOpen}
        setMyItemsOpen={c.profile.setMyItemsDialogOpen}
        userProfile={c.profile.profile}
        onUpdateProfile={c.profile.updateProfile}
        lostItems={c.profile.lostItems}
        foundItems={c.profile.foundItems}
        initialChatId={initialChatId}
        setInitialChatId={setInitialChatId}
      />
    </div>
  );
}