"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LOCATIONS } from "@/components/home/SearchBar";
import type { AppNotification } from "@/components/home/NotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { useItemFilters } from "@/hooks/useItemFilters";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";

type Tab = "all" | "lost" | "found";
type ReportType = "lost" | "found";

export function useHomeController() {
  const { user, loading, setUser, logout } = useAuth();
  const { items, loadingItems, reload } = useItems();
  const profile = useProfile(user?.id ?? null);

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
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [myItemsDialogOpen, setMyItemsDialogOpen] = useState(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id ?? null);

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

  const openMessagesInbox = () => {
    setDetailsDialogOpen(false);
    setItemMessagesItemId(null);
    setItemMessagesDialogOpen(true);
  };

  const onNotificationClick = (n: AppNotification) => {
    if (n.type === "message") {
      openMessagesInbox();
      return;
    }
    if (n.itemId) {
      openMessagesInbox();
    }
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


  const updateItemStatus = async (
    itemId: string,
    status: "deleted" | "recovered"
  ) => {
    const res = await fetch("/api/auth/me/items", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
        status,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update status");
    }

    return res.json();
  }

  const handleRecover = async (itemId: string) => {
    await updateItemStatus(itemId, "recovered");
    toast.success("Item marked as recovered");

    await profile.fetchMyItems();
    await reload();
  };

  const handleDelete = async (itemId: string) => {
    await updateItemStatus(itemId, "deleted");
    toast.success("Item marked as deleted");
    await profile.fetchMyItems();
    await reload();
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
      onReportSuccess,
      handleRecover,
      handleDelete,
    },

    notifications: {
      notifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      onNotificationClick,
    },

    profile: {
      profile: profile.profile,
      fetchProfile: profile.fetchProfile,
      updateProfile: profile.updateProfile,
      fetchMyItems: profile.fetchMyItems,
      lostItems: profile.lostItems,
      foundItems: profile.foundItems,
      editProfileDialogOpen,
      setEditProfileDialogOpen,
      myItemsDialogOpen,
      setMyItemsDialogOpen,
    },
  };
}
