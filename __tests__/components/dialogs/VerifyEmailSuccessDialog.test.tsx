import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { VerifyEmailSuccessDialog } from "@/components/dialogs/VerifyEmailSuccessDialog";

describe("<VerifyEmailSuccessDialog />", () => {
  it("verifies token and shows OK button", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const onDone = jest.fn();

    render(<VerifyEmailSuccessDialog open={true} token="t123" onDone={onDone} />);

    await waitFor(() => expect(screen.getByText(/Email Verified/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^ok$/i }));
    expect(onDone).toHaveBeenCalled();
  });
});
