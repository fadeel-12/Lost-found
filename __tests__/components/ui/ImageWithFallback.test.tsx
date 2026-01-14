import { render, screen, fireEvent } from "@testing-library/react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

describe("<ImageWithFallback />", () => {
  it("renders fallback when src is missing", () => {
    render(<ImageWithFallback alt="x" src="" />);
    expect(screen.getByAltText(/error loading image/i)).toBeInTheDocument();
  });

  it("switches to fallback on error", () => {
    render(<ImageWithFallback alt="ok" src="/broken.png" />);
    const img = screen.getByAltText("ok") as HTMLImageElement;
    fireEvent.error(img);
    expect(screen.getByAltText(/error loading image/i)).toBeInTheDocument();
  });
});

