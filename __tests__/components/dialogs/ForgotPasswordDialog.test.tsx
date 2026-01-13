import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordDialog } from "@/components/dialogs/ForgotPasswordDialog";

describe("<ForgotPasswordDialog />", () => {
  it("sends reset request and closes", async () => {
    const onOpenChange = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<ForgotPasswordDialog open={true} onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
