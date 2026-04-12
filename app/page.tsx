"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { AppNotification } from "@/components/home/NotificationsPanel";
import { Header } from "@/components/home/Header";
import { ItemsSection } from "@/components/home/ItemsSection";
import { Dialogs } from "@/components/home/Dialogs";
import { Footer } from "@/components/home/Footer";
import { ClientSatisfactionSection } from "@/components/home/ClientSatisfactionSection";
import { ReviewDialog } from "@/components/dialogs/ReviewDialog";
import { NotificationDetailDialog } from "@/components/dialogs/NotificationDetailDialog";
import { QRTagsDialog } from "@/components/dialogs/QRTagsDialog";
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
  const [notifDetailOpen, setNotifDetailOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

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

  // Auto-open QR tags dialog when returning from Stripe payment success
  useEffect(() => {
    if (searchParams.get("qr_tags") === "open") {
      c.profile.setQrTagsOpen(true);
      router.replace("/", { scroll: false });
    }
  }, [searchParams]);

  const handleNotificationClick = (n: AppNotification) => {
    setSelectedNotif(n);
    setNotifDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        onMyQRTags={() => c.profile.setQrTagsOpen(true)}
        userAvatar={c.profile.profile.avatarUrl}
      />

      <ItemsSection
        activeTab={c.filters.activeTab}
        onTabChange={c.filters.setActiveTab}
        loadingItems={c.data.loadingItems}
        filteredCount={c.data.filteredItems.length}
        items={c.data.currentItems}
        onItemClick={c.actions.openDetails}
        onRemoveItem={c.data.removeItem}
        pagination={{
          page: c.pagination.currentPage,
          totalPages: c.pagination.totalPages,
          onPrev: () => c.pagination.setCurrentPage((p) => p - 1),
          onNext: () => c.pagination.setCurrentPage((p) => p + 1),
        }}
      />

      <ClientSatisfactionSection />

      <Footer />

      <NotificationDetailDialog
        open={notifDetailOpen}
        onOpenChange={setNotifDetailOpen}
        notification={selectedNotif}
        onViewItem={(item) => {
          setNotifDetailOpen(false);
          c.actions.openDetails(item);
        }}
        onOpenChat={(conversationId) => {
          setInitialChatId(conversationId);
          c.dialogs.setItemMessagesItemId(null);
          c.dialogs.setItemMessagesDialogOpen(true);
        }}
      />

      <ReviewDialog
        open={c.review.reviewOpen}
        onOpenChange={c.review.setReviewOpen}
        userId={c.auth.user?.id ?? ""}
        itemId={c.review.reviewItemId ?? ""}
      />

      <QRTagsDialog
        open={c.profile.qrTagsOpen}
        onOpenChange={c.profile.setQrTagsOpen}
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