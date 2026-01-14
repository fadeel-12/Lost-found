import { render, screen, fireEvent } from "@testing-library/react";
import { ItemCard } from "@/components/home/ItemCard";

describe("<ItemCard />", () => {
  it("renders item details and handles click", () => {
    const onClick = jest.fn();

    render(
      <ItemCard
        id="1"
        title="Black Wallet"
        category="Wallet"
        type="lost"
        location="Main Building"
        date="2026-01-10"
        imageUrl="/test.jpg"
        description="Lost near the entrance"
        onClick={onClick}
      />
    );

    expect(screen.getByText("Black Wallet")).toBeInTheDocument();
    expect(screen.getByText(/^Lost$/)).toBeInTheDocument();
    expect(screen.getByText(/main building/i)).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Black Wallet"));
    expect(onClick).toHaveBeenCalled();
  });
});

