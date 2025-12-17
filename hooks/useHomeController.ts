"use client";

import { useMemo, useState } from "react";
import { LOCATIONS } from "@/components/home/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { useItemFilters } from "@/hooks/useItemFilters";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";

type Tab = "all" | "lost" | "found";
type ReportType = "lost" | "found";

export function useHomeController() {
  const { user, loading, setUser, logout } = useAuth();
  const { items, loadingItems, reload } = useItems();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<any>("all");

  const filteredItems = useItemFilters(items, {
    searchQuery,
    activeTab,
    selectedCategory,
    selectedLocation,
    selectedDateRange,
    locations: LOCATIONS,
  });

  const paginationDeps = useMemo(
    () => [searchQuery, selectedCategory, selectedLocation, activeTab, selectedDateRange],
    [searchQuery, selectedCategory, selectedLocation, activeTab, selectedDateRange]
  );

  const { currentPage, setCurrentPage, totalPages, currentItems } = usePagination(
    filteredItems,
    6,
    paginationDeps
  );

  const [signInOpen, setSignInOpen] = useState(false);
  const requireAuth = useRequireAuthAction(user, loading, () => setSignInOpen(true));

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successReportType, setSuccessReportType] = useState<ReportType>("lost");
  const [itemMessagesDialogOpen, setItemMessagesDialogOpen] = useState(false);
  const [itemMessagesItemId, setItemMessagesItemId] = useState<string | null>(null);
  const [pendingChatItemId, setPendingChatItemId] = useState<string | null>(null);
  const [pendingOpenMessagesAfterLogin, setPendingOpenMessagesAfterLogin] = useState(false);
  const [pendingOpenReportAfterLogin, setPendingOpenReportAfterLogin] = useState(false);

  const clearFilters = () => {
    setSelectedLocation("all");
    setSelectedCategory("all");
    setSelectedDateRange("all");
  };

  const openReport = () => {
    setDetailsDialogOpen(false);

    if (!user && !loading) {
      setPendingOpenReportAfterLogin(true);
      setSignInOpen(true);
      return;
    }

    requireAuth(() => setReportOpen(true));
  };

  const openDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const onReportSuccess = (reportType: ReportType) => {
    setSuccessReportType(reportType);
    setReportOpen(false);
    setSuccessOpen(true);
    reload();
  };

  const requestOpenMessagesForItem = (itemId: string | null) => {
    if (!itemId) return;

    setDetailsDialogOpen(false);

    if (!user && !loading) {
      setPendingChatItemId(itemId);
      setPendingOpenMessagesAfterLogin(true);
      setSignInOpen(true);
      return;
    }

    setItemMessagesItemId(itemId);
    setItemMessagesDialogOpen(true);
  };

  const consumePendingMessagesIntent = () => {
    const shouldOpen = pendingOpenMessagesAfterLogin && !!pendingChatItemId;
    const itemId = pendingChatItemId;

    setPendingOpenMessagesAfterLogin(false);
    setPendingChatItemId(null);

    return { shouldOpen, itemId };
  };

  const consumePendingReportIntent = () => {
    const shouldOpen = pendingOpenReportAfterLogin;
    setPendingOpenReportAfterLogin(false);
    return { shouldOpen };
  };


  return {
    auth: {
      user,
      loading,
      setUser,
      logout,
      signInOpen,
      setSignInOpen,
      requireAuth,
    },

    data: {
      loadingItems,
      filteredItems,
      currentItems,
      reload,
    },

    filters: {
      searchQuery,
      setSearchQuery,
      activeTab,
      setActiveTab,
      selectedLocation,
      setSelectedLocation,
      selectedCategory,
      setSelectedCategory,
      selectedDateRange,
      setSelectedDateRange,
      clearFilters,
    },

    pagination: {
      currentPage,
      setCurrentPage,
      totalPages,
    },

    dialogs: {
      selectedItem,
      setSelectedItem,
      detailsDialogOpen,
      setDetailsDialogOpen,
      reportOpen,
      setReportOpen,
      successOpen,
      setSuccessOpen,
      successReportType,
      setSuccessReportType,
      itemMessagesDialogOpen,
      setItemMessagesDialogOpen,
      itemMessagesItemId,
      setItemMessagesItemId,
      requestOpenMessagesForItem,
      consumePendingMessagesIntent,
      consumePendingReportIntent,
    },

    actions: {
      openReport,
      openDetails,
      onReportSuccess
    },
  };
}
