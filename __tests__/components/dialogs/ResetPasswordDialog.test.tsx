import { render, screen, fireEvent } from "@testing-library/react";
import { ResetPasswordDialog } from "@/components/dialogs/ResetPasswordDialog";

describe("<ResetPasswordDialog />", () => {
  it("shows validation message for short password", () => {
    render(<ResetPasswordDialog open={true} token="t" onDone={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
