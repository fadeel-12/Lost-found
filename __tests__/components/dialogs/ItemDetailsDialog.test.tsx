import { render, screen, fireEvent } from "@testing-library/react";
import { ItemDetailsDialog } from "@/components/dialogs/ItemDetailsDialog";

describe("<ItemDetailsDialog />", () => {
  const baseItem = {
    id: "i1",
    title: "Wallet",
    category: "Wallet",
    type: "lost" as const,
    location: "Main Building",
    date: "2026-01-10",
    imageUrl: "/x",
    description: "desc",
    user_id: "owner1",
    status: "open" as const,
  };

  it("shows Contact Owner button for non-owner", () => {
    const onContactOwner = jest.fn();

    render(
      <ItemDetailsDialog
        open={true}
        onOpenChange={jest.fn()}
        item={baseItem}
        currentUserId="other"
        onContactOwner={onContactOwner}
        onMarkRecovered={jest.fn()}
        onDeleteItem={jest.fn()}
        onOpenItemMessages={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /contact owner/i }));
    expect(onContactOwner).toHaveBeenCalled();
  });

  it("shows owner actions for owner", () => {
    const onOpenItemMessages = jest.fn();
    render(
      <ItemDetailsDialog
        open={true}
        onOpenChange={jest.fn()}
        item={baseItem}
        currentUserId="owner1"
        onContactOwner={jest.fn()}
        onMarkRecovered={jest.fn()}
        onDeleteItem={jest.fn()}
        onOpenItemMessages={onOpenItemMessages}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^messages$/i }));
    expect(onOpenItemMessages).toHaveBeenCalledWith("i1");
  });
});
