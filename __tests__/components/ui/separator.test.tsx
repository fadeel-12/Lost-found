import { render } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("<Separator />", () => {
  it("renders", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeTruthy();
  });
});

