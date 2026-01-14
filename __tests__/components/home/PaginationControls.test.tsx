import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControls } from "@/components/home/PaginationControls";

describe("<PaginationControls />", () => {
  it("renders and navigates", () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    render(<PaginationControls page={1} totalPages={3} onPrev={onPrev} onNext={onNext} />);

    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it("returns null when only one page", () => {
    const { container } = render(
      <PaginationControls page={1} totalPages={1} onPrev={jest.fn()} onNext={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

