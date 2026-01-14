import { render, screen } from "@testing-library/react";
import { Dialogs } from "@/components/home/Dialogs";

jest.mock("@/components/dialogs/SuccessDialog", () => ({
  SuccessDialog: ({ open }: any) => (open ? <div>SuccessDialog</div> : null),
}));
jest.mock("@/components/dialogs/ReportItemDialog", () => ({
  ReportItemDialog: ({ open }: any) => (open ? <div>ReportItemDialog</div> : null),
}));
jest.mock("@/components/dialogs/ItemDetailsDialog", () => ({
  ItemDetailsDialog: ({ open }: any) => (open ? <div>ItemDetailsDialog</div> : null),
}));
jest.mock("@/components/dialogs/ItemMessagesDialog", () => ({
  ItemMessagesDialog: ({ open }: any) => (open ? <div>ItemMessagesDialog</div> : null),
}));
jest.mock("@/components/dialogs/AuthDialogs", () => ({
  AuthDialogs: ({ signInOpen, signUpOpen }: any) => (
    <div>AuthDialogs {String(signInOpen)} {String(signUpOpen)}</div>
  ),
}));
jest.mock("@/components/dialogs/EditProfileDialog", () => ({
  EditProfileDialog: ({ open }: any) => (open ? <div>EditProfileDialog</div> : null),
}));
jest.mock("@/components/dialogs/MyItemsDialog", () => ({
  MyItemsDialog: ({ open }: any) => (open ? <div>MyItemsDialog</div> : null),
}));

describe("<Dialogs />", () => {
  it("renders dialog shells based on open flags", () => {
    render(
      <Dialogs
        user={null}
        setUser={jest.fn()}
        requireAuth={jest.fn()}
        signInOpen={true}
        setSignInOpen={jest.fn()}
        reportOpen={true}
        setReportOpen={jest.fn()}
        successOpen={true}
        setSuccessOpen={jest.fn()}
        successReportType="lost"
        onReportSuccess={jest.fn()}
        onDelete={jest.fn().mockResolvedValue(undefined)}
        onRecover={jest.fn().mockResolvedValue(undefined)}
        detailsDialogOpen={false}
        setDetailsDialogOpen={jest.fn()}
        selectedItem={null}
        setSelectedItem={jest.fn()}
        itemMessagesDialogOpen={false}
        setItemMessagesDialogOpen={jest.fn()}
        itemMessagesItemId={null}
        setItemMessagesItemId={jest.fn()}
        requestOpenMessagesForItem={jest.fn()}
        consumePendingMessagesIntent={() => ({ shouldOpen: false, itemId: null })}
        consumePendingReportIntent={() => ({ shouldOpen: false })}
        editProfileOpen={false}
        setEditProfileOpen={jest.fn()}
        myItemsOpen={false}
        setMyItemsOpen={jest.fn()}
        userProfile={null}
        onUpdateProfile={jest.fn().mockResolvedValue(undefined)}
        lostItems={[]}
        foundItems={[]}
        initialChatId={null}
        setInitialChatId={jest.fn()}
      />
    );

    expect(screen.getByText("SuccessDialog")).toBeInTheDocument();
    expect(screen.getByText("ReportItemDialog")).toBeInTheDocument();
    expect(screen.getByText(/AuthDialogs true/i)).toBeInTheDocument();
  });
});
      
