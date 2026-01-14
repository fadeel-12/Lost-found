import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("<Textarea />", () => {
  it("updates value", () => {
    render(<Textarea aria-label="t" />);
    const el = screen.getByLabelText("t") as HTMLTextAreaElement;
    fireEvent.change(el, { target: { value: "hi" } });
    expect(el.value).toBe("hi");
  });
});

