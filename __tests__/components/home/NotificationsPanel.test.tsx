import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NotificationsPanel,
  type AppNotification,
} from "@/components/home/NotificationsPanel";

jest.mock("@/components/ui/dropdown-menu", () => {
  const React = require("react");

  return {
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  };
});

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

describe("<NotificationsPanel /> (stable)", () => {
  it("renders header + unread badge and clicking notification calls handlers", async () => {
    const user = userEvent.setup();

    const onNotificationClick = jest.fn();
    const onMarkAsRead = jest.fn();
    const onMarkAllAsRead = jest.fn();
    const onDeleteNotification = jest.fn();

    const notifications: AppNotification[] = [
      {
        id: "n1",
        type: "system",
        title: "Welcome",
        message: "Hello!",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];

    render(
      <NotificationsPanel
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDeleteNotification={onDeleteNotification}
      />
    );

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Hello!")).toBeInTheDocument();

    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: /welcome/i }));

    expect(onMarkAsRead).toHaveBeenCalledWith("n1");
    expect(onNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "n1" })
    );

    await user.click(screen.getByRole("button", { name: /mark all read/i }));
    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it("shows empty state when no notifications", () => {
    render(
      <NotificationsPanel
        notifications={[]}
        onNotificationClick={jest.fn()}
        onMarkAsRead={jest.fn()}
        onMarkAllAsRead={jest.fn()}
        onDeleteNotification={jest.fn()}
      />
    );

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });
});

