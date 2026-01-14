import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("<Badge />", () => {
  it("renders text", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag")).toBeInTheDocument();
  });
});

