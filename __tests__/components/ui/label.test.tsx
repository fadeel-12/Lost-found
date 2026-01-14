import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("<Label />", () => {
  it("renders", () => {
    render(<Label htmlFor="x">Hello</Label>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

