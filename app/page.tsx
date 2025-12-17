"use client";

import { Suspense } from "react";
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
        detailsDialogOpen={c.dialogs.detailsDialogOpen}
        setDetailsDialogOpen={c.dialogs.setDetailsDialogOpen}
        selectedItem={c.dialogs.selectedItem}
        itemMessagesDialogOpen={c.dialogs.itemMessagesDialogOpen}
        setItemMessagesDialogOpen={c.dialogs.setItemMessagesDialogOpen}
        itemMessagesItemId={c.dialogs.itemMessagesItemId}
        setItemMessagesItemId={c.dialogs.setItemMessagesItemId}
      />
    </div>
  );
}