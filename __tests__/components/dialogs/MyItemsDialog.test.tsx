import { render, screen, fireEvent } from "@testing-library/react";
import { MyItemsDialog } from "@/components/dialogs/MyItemsDialog";

describe("<MyItemsDialog />", () => {
  it("renders items and handles click", () => {
    const onItemClick = jest.fn();

    render(
      <MyItemsDialog
        open={true}
        onOpenChange={jest.fn()}
        lostItems={[
          {
            id: "l1",
            title: "Lost Wallet",
            category: "Wallet",
            type: "lost",
            location: "Main",
            date: "2026-01-01",
            imageUrl: "",
            description: "desc",
          },
        ]}
        foundItems={[]}
        onItemClick={onItemClick}
      />
    );

    expect(screen.getByText(/My Items/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Lost Wallet/i));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "l1" })
    );
  });
});
