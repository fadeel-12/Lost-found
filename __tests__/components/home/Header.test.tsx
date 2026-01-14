import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/home/Header";

describe("<Header />", () => {
  const baseProps = {
    loading: false,
    user: null as any,
    onLogout: jest.fn(),
    onSignIn: jest.fn(),
    onReport: jest.fn(),
    search: {
      onSearch: jest.fn(),
      selectedLocation: "",
      selectedCategory: "",
      selectedDateRange: null,
      onLocationChange: jest.fn(),
      onCategoryChange: jest.fn(),
      onDateRangeChange: jest.fn(),
      onClearFilters: jest.fn(),
    },
    notifications: [],
    onNotificationClick: jest.fn(),
    onMarkNotifRead: jest.fn(),
    onMarkAllNotifRead: jest.fn(),
    onDeleteNotif: jest.fn(),
    onEditProfile: jest.fn(),
    onMyItems: jest.fn(),
  };

  it("renders app title and Report Item button", () => {
    render(<Header {...baseProps} />);

    expect(screen.getByText(/UIBK Lost and Found/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /report item/i })).toBeInTheDocument();
  });

  it("shows Sign In button when no user", () => {
    render(<Header {...baseProps} />);

    const btn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(btn);
    expect(baseProps.onSignIn).toHaveBeenCalled();
  });

  it("shows Logout when user exists", () => {
    render(
      <Header
        {...baseProps}
        user={{ id: "u1", name: "A", email: "a@b.com" }}
      />
    );

    const logout = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logout);
    expect(baseProps.onLogout).toHaveBeenCalled();
  });
});

