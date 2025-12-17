"use client";

import { SuccessDialog } from "@/components/dialogs/SuccessDialog";
import { ReportItemDialog } from "@/components/dialogs/ReportItemDialog";
import { ItemDetailsDialog } from "@/components/dialogs/ItemDetailsDialog";
import { ItemMessagesDialog } from "@/components/dialogs/ItemMessagesDialog";
import { AuthDialogs } from "@/components/dialogs/AuthDialogs";

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

  detailsDialogOpen: boolean;
  setDetailsDialogOpen: (v: boolean) => void;
  selectedItem: any;

  itemMessagesDialogOpen: boolean;
  setItemMessagesDialogOpen: (v: boolean) => void;
  itemMessagesItemId: string | null;
  setItemMessagesItemId: (v: string | null) => void;
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
  itemMessagesDialogOpen,
  setItemMessagesDialogOpen,
  itemMessagesItemId,
  setItemMessagesItemId,
}: Props) {
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
        onContactOwner={() =>
          requireAuth(async () => {
            const res = await fetch("/api/chats/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ itemId: selectedItem?.id }),
            });
            if (!res.ok) return;
            setDetailsDialogOpen(false);
            setItemMessagesItemId(selectedItem?.id ?? null);
            setItemMessagesDialogOpen(true);
          })
        }
        onOpenItemMessages={(itemId) => {
          setDetailsDialogOpen(false);
          setItemMessagesItemId(itemId);
          setItemMessagesDialogOpen(true);
        }}
        currentUserId={user?.id ?? null}
      />

      <ItemMessagesDialog
        open={itemMessagesDialogOpen}
        onOpenChange={setItemMessagesDialogOpen}
        itemId={itemMessagesItemId}
        currentUserId={user?.id ?? null}
      />

      <AuthDialogs
        signInOpen={signInOpen}
        onSignInOpenChange={setSignInOpen}
        signUpOpen={false}
        onSignUpOpenChange={() => {}}
        verifyEmailOpen={false}
        onVerifyEmailOpenChange={() => {}}
        verifyEmail={""}
        setVerifyEmail={() => {}}
        forgotOpen={false}
        onForgotOpenChange={() => {}}
        forgotEmail={""}
        setForgotEmail={() => {}}
        onSignedIn={(u) => setUser(u)}
      />
    </>
  );
}
