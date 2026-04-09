import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignInDialog } from "@/components/dialogs/SignInDialog";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}));

describe("<SignInDialog />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign in dialog when open", () => {
    render(<SignInDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByRole("heading", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<SignInDialog open={false} onOpenChange={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Google sign in button linking to /api/auth/google", () => {
    render(<SignInDialog open={true} onOpenChange={jest.fn()} />);
    expect(
      screen.getByRole("link", { name: /continue with google/i })
    ).toHaveAttribute("href", "/api/auth/google");
  });

  it("renders email and password fields", () => {
    render(<SignInDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<SignInDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

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

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onSignedIn).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u1" })
    );
  });

  it("shows error toast on invalid credentials", async () => {
    const { toast } = require("sonner");

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid email or password" }),
    });

    render(<SignInDialog open={true} onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
    });
  });

  it("shows message and calls onEmailNotVerified when email not verified", async () => {
    const { toast } = require("sonner");
    const onEmailNotVerified = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { email_verified: false } }),
    });

    render(
      <SignInDialog
        open={true}
        onOpenChange={jest.fn()}
        onEmailNotVerified={onEmailNotVerified}
      />
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "unverified@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(toast.message).toHaveBeenCalledWith(
        expect.stringMatching(/verify your email/i)
      );
      expect(onEmailNotVerified).toHaveBeenCalledWith("unverified@example.com");
    });
  });

  it("calls onForgotPassword with current email when Forgot password is clicked", () => {
    const onForgotPassword = jest.fn();
    render(
      <SignInDialog
        open={true}
        onOpenChange={jest.fn()}
        onForgotPassword={onForgotPassword}
      />
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByText(/forgot password/i));
    expect(onForgotPassword).toHaveBeenCalledWith("user@test.com");
  });

  it("calls onSwitchToSignUp when Sign Up link is clicked", () => {
    const onSwitchToSignUp = jest.fn();
    render(
      <SignInDialog
        open={true}
        onOpenChange={jest.fn()}
        onSwitchToSignUp={onSwitchToSignUp}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(onSwitchToSignUp).toHaveBeenCalled();
  });

  it("closes when Cancel is clicked", () => {
    const onOpenChange = jest.fn();
    render(<SignInDialog open={true} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
