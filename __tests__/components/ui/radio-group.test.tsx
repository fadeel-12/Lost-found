import { render, screen } from "@testing-library/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

describe("<RadioGroup />", () => {
  it("renders radio items", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <label htmlFor="a">A</label>
      </RadioGroup>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});

