import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/components/home/SearchBar";

describe("<SearchBar />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("debounces search input and calls onSearch", () => {
    const onSearch = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        selectedLocation="all"
        selectedCategory="all"
        selectedDateRange="all"
        onLocationChange={jest.fn()}
        onCategoryChange={jest.fn()}
        onDateRangeChange={jest.fn()}
        onClearFilters={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search for lost or found/i);
    fireEvent.change(input, { target: { value: "wallet" } });

    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith("wallet");
  });

  it("Search button triggers immediate search", () => {
    const onSearch = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        selectedLocation="all"
        selectedCategory="all"
        selectedDateRange="all"
        onLocationChange={jest.fn()}
        onCategoryChange={jest.fn()}
        onDateRangeChange={jest.fn()}
        onClearFilters={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search for lost or found/i), {
      target: { value: "keys" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
    expect(onSearch).toHaveBeenCalledWith("keys");
  });
});
    
