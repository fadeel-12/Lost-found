"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/dialogs/SuccessDialog";
import { ReportItemDialog } from "@/components/dialogs/ReportItemDialog";
import { ItemDetailsDialog } from "@/components/dialogs/ItemDetailsDialog";
import { ItemMessagesDialog } from "@/components/dialogs/ItemMessagesDialog";
import { AuthDialogs } from "@/components/dialogs/AuthDialogs";
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog";
import { MyItemsDialog } from "@/components/dialogs/MyItemsDialog";

type Props = {
  user: any;
  setUser: (u: any) => void;
  requireAuth: (fn: () => void | Promise<void>) => void;

  signInOpen: boolean;
  setSignInOpen: (v: boolean) => void;

  reportOpen: boolean;
  setReportOpen: (v: boolean) => void;
  successOpen: boolean;
  setSuccessOpen: (v: boolean) => void;
  successReportType: "lost" | "found";
  onReportSuccess: (t: "lost" | "found") => void;
  onDelete: (itemId: string) => Promise<void>;
  onRecover: (itemId: string) => Promise<void>;

  detailsDialogOpen: boolean;
  setDetailsDialogOpen: (v: boolean) => void;
  selectedItem: any;
  setSelectedItem: (item: any) => void;

  itemMessagesDialogOpen: boolean;
  setItemMessagesDialogOpen: (v: boolean) => void;
  itemMessagesItemId: string | null;
  setItemMessagesItemId: (v: string | null) => void;

  requestOpenMessagesForItem: (itemId: string | null) => void;

  consumePendingMessagesIntent: () => { shouldOpen: boolean; itemId: string | null };
  consumePendingReportIntent: () => { shouldOpen: boolean };

  editProfileOpen: boolean;
  setEditProfileOpen: (v: boolean) => void;

  myItemsOpen: boolean;
  setMyItemsOpen: (v: boolean) => void;

  userProfile: any;
  onUpdateProfile: (p: any) => Promise<void>;
  lostItems: any[];
  foundItems: any[];

  initialChatId: string | null;
  setInitialChatId: (v: string | null) => void;
};

export function Dialogs({
  user,
  setUser,
  requireAuth,
  signInOpen,
  setSignInOpen,
  reportOpen,
  setReportOpen,
  successOpen,
  setSuccessOpen,
  successReportType,
  onReportSuccess,
  detailsDialogOpen,
  setDetailsDialogOpen,
  selectedItem,
  setSelectedItem,
  itemMessagesDialogOpen,
  setItemMessagesDialogOpen,
  itemMessagesItemId,
  setItemMessagesItemId,
  requestOpenMessagesForItem,
  consumePendingMessagesIntent,
  consumePendingReportIntent,
  initialChatId,
  setInitialChatId,
  editProfileOpen,
  setEditProfileOpen,
  myItemsOpen,
  setMyItemsOpen,
  userProfile,
  onUpdateProfile,
  lostItems,
  foundItems,
  onRecover,
  onDelete
}: Props) {
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);

  const [verifyEmail, setVerifyEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [initialChatMeta, setInitialChatMeta] = useState<{ otherUserName?: string; itemTitle?: string } | null>(null);

  const closeAllAuth = () => {
    setSignInOpen(false);
    setSignUpOpen(false);
    setForgotOpen(false);
    setVerifyEmailOpen(false);
  };

  const openMessages = (itemId: string) => {
    setItemMessagesItemId(itemId);
    setItemMessagesDialogOpen(true);
  };

  const startChatAndOpenMessages = async (itemId: string) => {
    try {
      const res = await fetch("/api/chats/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      const chatId = data?.chatId ?? data?.chat?.id ?? null;

      if (chatId) {
        setInitialChatId(chatId);

        setInitialChatMeta({
          otherUserName: data?.otherUser?.name,
          itemTitle: data?.item?.title,
        });
      }

      setItemMessagesItemId(null);
      setItemMessagesDialogOpen(true);

      return true;
    } catch {
      setItemMessagesItemId(null);
      setItemMessagesDialogOpen(true);
      return false;
    }
  };

  return (
    <>
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        reportType={successReportType}
        onReportAnother={() => {
          setSuccessOpen(false);
          setReportOpen(true);
        }}
      />

      <ReportItemDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSuccess={onReportSuccess}
        user={user}
      />

      <ItemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItem}
        onContactOwner={() => {
          const itemId = selectedItem?.id ?? null;
          if (!itemId) return;
          setDetailsDialogOpen(false);
          requireAuth(async () => {
            await startChatAndOpenMessages(itemId);
          });
        }}
        onMarkRecovered={() => {
          const itemId = selectedItem?.id ?? null;
          if (!itemId) return;
          setDetailsDialogOpen(false);
          requireAuth(async () => {
            await onRecover(itemId);
          });
        }}
        onDeleteItem={() => {
          const itemId = selectedItem?.id ?? null;
          if (!itemId) return;
          setDetailsDialogOpen(false);
          requireAuth(async () => {
            await onDelete(itemId);
          });
        }}
        onOpenItemMessages={(itemId) => {
          setDetailsDialogOpen(false);
          openMessages(itemId);
        }}
        currentUserId={user?.id ?? null}
      />

      <ItemMessagesDialog
        open={itemMessagesDialogOpen}
        onOpenChange={(open) => {
          setItemMessagesDialogOpen(open);
          if (!open) setInitialChatId(null);
        }}
        itemId={itemMessagesItemId}
        currentUserId={user?.id ?? null}
        initialChatId={initialChatId}
        initialChatMeta={initialChatMeta}
      />

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
      />

      <MyItemsDialog
        open={myItemsOpen}
        onOpenChange={setMyItemsOpen}
        lostItems={lostItems}
        foundItems={foundItems}
        onItemClick={(item) => {
          setMyItemsOpen(false);
          setSelectedItem(item);
          setDetailsDialogOpen(true);
        }}
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
        onSignedIn={async (u) => {
          setUser(u);

          const msgIntent = consumePendingMessagesIntent();
          if (msgIntent.shouldOpen && msgIntent.itemId) {
            closeAllAuth();
            await startChatAndOpenMessages(msgIntent.itemId);
            return;
          }

          const reportIntent = consumePendingReportIntent();
          if (reportIntent.shouldOpen) {
            closeAllAuth();
            setReportOpen(true);
            return;
          }

          closeAllAuth();
        }}
      />
    </>
  );
}
