import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VerifyEmailDialog } from "@/components/dialogs/VerifyEmailDialog";

describe("<VerifyEmailDialog />", () => {
  it("resends verification email", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <VerifyEmailDialog open={true} email="user@example.com" onOpenChange={jest.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/resend-verification",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        })
      )
    );
  });
});
