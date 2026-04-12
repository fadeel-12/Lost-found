"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProfileDropdownProps {
  onEditProfile: () => void;
  onMyItems: () => void;
  onMyQRTags: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function ProfileDropdown({
  onEditProfile,
  onMyItems,
  onMyQRTags,
  userName,
  userEmail,
  userAvatar,
}: ProfileDropdownProps) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative overflow-hidden rounded-full p-0 h-9 w-9 border-2">
          {userAvatar ? (
            <img src={userAvatar} alt={userName ?? "Profile"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">
              {initials}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer w-full">
            <LayoutDashboard className="h-4 w-4 text-blue-500" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onEditProfile} className="cursor-pointer">
          <span>Edit Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onMyItems} className="cursor-pointer">
          <span>My Items</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onMyQRTags} className="cursor-pointer">
          <span>My QR Tags</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
