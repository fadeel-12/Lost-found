"use client";

import Link from "next/link";
import { LogIn, PlusCircle } from "lucide-react";
import { SearchBar } from "@/components/home/SearchBar";
import { Button } from "@/components/ui/button";
import {
  NotificationsPanel,
  type AppNotification,
} from "@/components/home/NotificationsPanel";

type Props = {
  loading: boolean;
  user: any;
  onLogout: () => void;
  onSignIn: () => void;
  onReport: () => void;

  search: {
    onSearch: (v: string) => void;
    selectedLocation: string;
    selectedCategory: string;
    selectedDateRange: any;
    onLocationChange: (v: string) => void;
    onCategoryChange: (v: string) => void;
    onDateRangeChange: (v: any) => void;
    onClearFilters: () => void;
  };

  notifications: AppNotification[];
  onNotificationClick: (n: AppNotification) => void;
  onMarkNotifRead: (id: string) => void | Promise<void>;
  onMarkAllNotifRead: () => void | Promise<void>;
  onDeleteNotif: (id: string) => void | Promise<void>;
};

export function Header({
  loading,
  user,
  onLogout,
  onSignIn,
  onReport,
  search,
  notifications,
  onNotificationClick,
  onMarkNotifRead,
  onMarkAllNotifRead,
  onDeleteNotif,
}: Props) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-blue-600 text-xl font-semibold">
              UIBK Lost and Found
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {!loading && !user ? (
              <Button variant="outline" className="gap-2" onClick={onSignIn}>
                <LogIn className="h-5 w-5" /> Sign In
              </Button>
            ) : (
              user && (
                <>
                  <NotificationsPanel
                    notifications={notifications}
                    onNotificationClick={onNotificationClick}
                    onMarkAsRead={onMarkNotifRead}
                    onMarkAllAsRead={onMarkAllNotifRead}
                    onDeleteNotification={onDeleteNotif}
                  />
                  <Button variant="outline" className="gap-2" onClick={onLogout}>
                    Logout
                  </Button>
                </>
              )
            )}

            <Button className="gap-2" onClick={onReport}>
              <PlusCircle className="h-5 w-5" /> Report Item
            </Button>
          </div>
        </div>

        <SearchBar {...search} />
      </div>
    </header>
  );
}
