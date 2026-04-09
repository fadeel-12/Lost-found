import { render, screen, fireEvent } from "@testing-library/react";
import { ItemCard } from "@/components/home/ItemCard";

const baseProps = {
  id: "1",
  title: "Black Wallet",
  category: "Wallet",
  type: "lost" as const,
  location: "Main Building",
  date: "2026-01-10",
  imageUrl: "/test.jpg",
  description: "Lost near the entrance",
};

describe("<ItemCard />", () => {
  it("renders item details and handles click", () => {
    const onClick = jest.fn();
    render(<ItemCard {...baseProps} onClick={onClick} />);

    expect(screen.getByText("Black Wallet")).toBeInTheDocument();
    expect(screen.getByText(/^Lost$/)).toBeInTheDocument();
    expect(screen.getByText(/main building/i)).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Black Wallet"));
    expect(onClick).toHaveBeenCalled();
  });

  it("does not show remove button when onRemove is not provided", () => {
    render(<ItemCard {...baseProps} />);
    expect(screen.queryByRole("button", { name: /remove item/i })).not.toBeInTheDocument();
  });

  it("shows remove button when onRemove is provided", () => {
    render(<ItemCard {...baseProps} onRemove={jest.fn()} />);
    expect(screen.getByRole("button", { name: /remove item/i })).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", () => {
    const onRemove = jest.fn();
    const onClick = jest.fn();
    render(<ItemCard {...baseProps} onClick={onClick} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button", { name: /remove item/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("does not trigger onClick when remove button is clicked", () => {
    const onRemove = jest.fn();
    const onClick = jest.fn();
    render(<ItemCard {...baseProps} onClick={onClick} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button", { name: /remove item/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders found badge for found type", () => {
    render(<ItemCard {...baseProps} type="found" />);
    expect(screen.getByText(/^Found$/)).toBeInTheDocument();
  });
});
