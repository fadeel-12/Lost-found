import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("<Input />", () => {
  it("updates value", () => {
    render(<Input aria-label="i" />);
    const el = screen.getByLabelText("i") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "abc" } });
    expect(el.value).toBe("abc");
  });
});

