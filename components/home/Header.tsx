"use client";

import Link from "next/link";
import { LogIn, PlusCircle, Globe } from "lucide-react";
import { SearchBar } from "@/components/home/SearchBar";
import { Button } from "@/components/ui/button";
import {
  NotificationsPanel,
  type AppNotification,
} from "@/components/home/NotificationsPanel";
import { ProfileDropdown } from "@/components/home/ProfileDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/TranslationContext";
import { LOCALES } from "@/lib/i18n";

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

  onEditProfile: () => void;
  onMyItems: () => void;
  onMyQRTags: () => void;
};

export function Header({
  loading,
  user,
  onSignIn,
  onReport,
  search,
  notifications,
  onNotificationClick,
  onMarkNotifRead,
  onMarkAllNotifRead,
  onDeleteNotif,
  onEditProfile,
  onMyItems,
  onMyQRTags,
}: Props) {
  const { t, locale, setLocale } = useTranslation();
  const currentLocaleLabel = LOCALES.find((l) => l.value === locale)?.label ?? "EN";

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <h1 className="text-blue-600 text-base sm:text-xl font-semibold">
              {t.header.title}
            </h1>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 px-2 sm:px-3">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLocaleLabel}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LOCALES.map((loc) => (
                  <DropdownMenuItem
                    key={loc.value}
                    onClick={() => setLocale(loc.value)}
                    className={locale === loc.value ? "font-semibold text-blue-600" : ""}
                  >
                    {loc.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!loading && !user ? (
              <Button variant="outline" size="sm" className="gap-1.5 px-2 sm:px-4" onClick={onSignIn}>
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t.header.signIn}</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            ) : (
              user && (
                <>
                  <ProfileDropdown
                    userName={user?.name}
                    userEmail={user?.email}
                    onEditProfile={onEditProfile}
                    onMyItems={onMyItems}
                    onMyQRTags={onMyQRTags}
                  />

                  <NotificationsPanel
                    notifications={notifications}
                    onNotificationClick={onNotificationClick}
                    onMarkAsRead={onMarkNotifRead}
                    onMarkAllAsRead={onMarkAllNotifRead}
                    onDeleteNotification={onDeleteNotif}
                  />
                </>
              )
            )}

            <Button size="sm" className="gap-1.5 px-2 sm:px-4" onClick={onReport}>
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t.header.reportItem}</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        </div>

        <SearchBar {...search} />
      </div>
    </header>
  );
}
