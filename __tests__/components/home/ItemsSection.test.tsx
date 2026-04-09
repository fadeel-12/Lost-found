import { render, screen, fireEvent } from "@testing-library/react";
import { ItemsSection } from "@/components/home/ItemsSection";

if (!("ResizeObserver" in globalThis)) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const baseProps = {
  activeTab: "all" as const,
  onTabChange: jest.fn(),
  loadingItems: false,
  filteredCount: 2,
  items: [
    {
      id: "dummy-1",
      title: "Black Wallet",
      category: "Accessories",
      type: "lost" as const,
      location: "Library",
      date: "2026-03-10",
      imageUrl: "",
      description: "Lost wallet",
    },
    {
      id: "dummy-2",
      title: "AirPods",
      category: "Electronics",
      type: "found" as const,
      location: "Mensa",
      date: "2026-03-11",
      imageUrl: "",
      description: "Found earbuds",
    },
  ],
  onItemClick: jest.fn(),
  pagination: {
    page: 1,
    totalPages: 1,
    onPrev: jest.fn(),
    onNext: jest.fn(),
  },
};

describe("<ItemsSection />", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders items list", () => {
    render(<ItemsSection {...baseProps} />);
    expect(screen.getByText("Black Wallet")).toBeInTheDocument();
    expect(screen.getByText("AirPods")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<ItemsSection {...baseProps} loadingItems={true} />);
    expect(screen.getByText(/loading items/i)).toBeInTheDocument();
  });

  it("shows empty state when no items", () => {
    render(<ItemsSection {...baseProps} items={[]} filteredCount={0} />);
    expect(screen.getByText(/no items to display/i)).toBeInTheDocument();
    expect(screen.getByText(/all items have been removed/i)).toBeInTheDocument();
  });

  it("shows remove buttons when onRemoveItem is provided", () => {
    render(<ItemsSection {...baseProps} onRemoveItem={jest.fn()} />);
    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    expect(removeBtns).toHaveLength(2);
  });

  it("does not show remove buttons when onRemoveItem is not provided", () => {
    render(<ItemsSection {...baseProps} />);
    expect(screen.queryByRole("button", { name: /remove item/i })).not.toBeInTheDocument();
  });

  it("opens confirmation dialog when remove button is clicked", () => {
    render(<ItemsSection {...baseProps} onRemoveItem={jest.fn()} />);
    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[0]);

    expect(screen.getByText(/are you sure you want to remove/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^remove$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onRemoveItem with correct id after confirming", () => {
    const onRemoveItem = jest.fn();
    render(<ItemsSection {...baseProps} onRemoveItem={onRemoveItem} />);

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[0]);
    fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));

    expect(onRemoveItem).toHaveBeenCalledWith("dummy-1");
  });

  it("closes confirmation dialog without removing when Cancel is clicked", () => {
    const onRemoveItem = jest.fn();
    render(<ItemsSection {...baseProps} onRemoveItem={onRemoveItem} />);

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[0]);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRemoveItem).not.toHaveBeenCalled();
    expect(screen.queryByText(/are you sure you want to remove/i)).not.toBeInTheDocument();
  });

  it("calls onItemClick when a card is clicked", () => {
    render(<ItemsSection {...baseProps} />);
    fireEvent.click(screen.getByText("Black Wallet"));
    expect(baseProps.onItemClick).toHaveBeenCalledWith(baseProps.items[0]);
  });

  it("shows item count", () => {
    render(<ItemsSection {...baseProps} filteredCount={2} />);
    expect(screen.getByText(/2 items found/i)).toBeInTheDocument();
  });
});
