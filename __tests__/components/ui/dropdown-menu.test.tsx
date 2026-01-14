import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@radix-ui/react-dropdown-menu", () => ({
  __esModule: true,
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: any) => <div>{children}</div>,
  Content: ({ children, ...props }: any) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, onSelect, ...props }: any) => (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        onSelect?.(e);
      }}
    >
      {children}
    </button>
  ),
  Group: ({ children }: any) => <div>{children}</div>,
  CheckboxItem: ({ children }: any) => <div>{children}</div>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioItem: ({ children }: any) => <div>{children}</div>,
  Label: ({ children }: any) => <div>{children}</div>,
  Separator: () => <hr />,
  Sub: ({ children }: any) => <div>{children}</div>,
  SubTrigger: ({ children }: any) => <div>{children}</div>,
  SubContent: ({ children }: any) => <div>{children}</div>,
}));

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

describe("<DropdownMenu />", () => {
  it("renders items and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();

    await user.click(screen.getByText("Item"));
    expect(onSelect).toHaveBeenCalled();
  });
});

