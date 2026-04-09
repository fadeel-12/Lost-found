import { render, screen, } from "@testing-library/react";
import { ProfileDropdown } from "@/components/home/ProfileDropdown";
import userEvent from "@testing-library/user-event";

describe("<ProfileDropdown />", () => {
  it("opens menu and triggers actions", async () => {
    const user = userEvent.setup();
    const onEditProfile = jest.fn();
    const onMyItems = jest.fn();
    render(<ProfileDropdown
      onEditProfile={onEditProfile}
      onMyItems={onMyItems}
      onMyQRTags={jest.fn()}
      userName="User"
      userEmail="user@example.com"
    />);

    await user.click(screen.getByRole("button"));

    const edit = await screen.findByText(/edit profile/i);
    expect(edit).toBeInTheDocument();

    await user.click(edit);
    expect(onEditProfile).toHaveBeenCalled();
  });
});

