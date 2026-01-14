import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

describe("<Avatar />", () => {
  it("renders fallback", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

