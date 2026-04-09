import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignUpDialog } from "@/components/dialogs/SignUpDialog";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("<SignUpDialog />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign up dialog when open", () => {
    render(<SignUpDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<SignUpDialog open={false} onOpenChange={jest.fn()} />);
    expect(screen.queryByText(/create account/i)).not.toBeInTheDocument();
  });

  it("renders Google sign up button", () => {
    render(<SignUpDialog open={true} onOpenChange={jest.fn()} />);
    expect(
      screen.getByRole("link", { name: /sign up with google/i })
    ).toHaveAttribute("href", "/api/auth/google");
  });

  it("renders all form fields", () => {
    render(<SignUpDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<SignUpDialog open={true} onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("calls onSwitchToSignIn when Sign In link is clicked", () => {
    const onSwitchToSignIn = jest.fn();
    render(
      <SignUpDialog
        open={true}
        onOpenChange={jest.fn()}
        onSwitchToSignIn={onSwitchToSignIn}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(onSwitchToSignIn).toHaveBeenCalled();
  });

  it("submits form and calls onSwitchToSignIn on success", async () => {
    const onSwitchToSignIn = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, user: { id: "u1" } }),
    });

    render(
      <SignUpDialog
        open={true}
        onOpenChange={jest.fn()}
        onSwitchToSignIn={onSwitchToSignIn}
      />
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+43 664 123 4567" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "securepass123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "securepass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(onSwitchToSignIn).toHaveBeenCalled();
    });
  });

  it("shows error when email already registered", async () => {
    const { toast } = require("sonner");

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Email already registered" }),
    });

    render(<SignUpDialog open={true} onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+43 664 000 0000" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already registered");
    });
  });
});
