import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignInDialog } from "@/components/dialogs/SignInDialog";

describe("<SignInDialog />", () => {
  it("submits and calls onSignedIn on success", async () => {
    const onOpenChange = jest.fn();
    const onSignedIn = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "u1", email_verified: true } }),
    });

    render(
      <SignInDialog
        open={true}
        onOpenChange={onOpenChange}
        onSignedIn={onSignedIn}
      />
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onSignedIn).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u1" })
    );
  });
});
