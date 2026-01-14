import { render, screen, fireEvent } from "@testing-library/react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

describe("<Collapsible />", () => {
  it("toggles content", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden</CollapsibleContent>
      </Collapsible>
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });
});

