import { render, screen } from "@testing-library/react";
import React from "react";

test("renders hello text", () => {
  render(<div>Hello Jest</div>);
  expect(screen.getByText("Hello Jest")).toBeInTheDocument();
});
