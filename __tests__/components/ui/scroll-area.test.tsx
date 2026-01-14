import { render, screen } from "@testing-library/react";
import { ScrollArea } from "@/components/ui/scroll-area";

describe("<ScrollArea />", () => {
  it("renders children", () => {
    render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

