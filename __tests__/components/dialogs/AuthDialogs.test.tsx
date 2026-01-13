import { render, screen } from "@testing-library/react";
import { AuthDialogs } from "@/components/dialogs/AuthDialogs";

jest.mock("@/components/dialogs/SignUpDialog", () => ({
  SignUpDialog: ({ open }: any) => (open ? <div>SignUpDialog</div> : null),
}));
jest.mock("@/components/dialogs/SignInDialog", () => ({
  SignInDialog: ({ open }: any) => (open ? <div>SignInDialog</div> : null),
}));
jest.mock("@/components/dialogs/VerifyEmailDialog", () => ({
  VerifyEmailDialog: ({ open, email }: any) =>
    open ? <div>VerifyEmailDialog {email}</div> : null,
}));
jest.mock("@/components/dialogs/ForgotPasswordDialog", () => ({
  ForgotPasswordDialog: ({ open }: any) => (open ? <div>ForgotPasswordDialog</div> : null),
}));

describe("<AuthDialogs />", () => {
  it("renders the correct dialog based on flags", () => {
    render(
      <AuthDialogs
        signInOpen={true}
        signUpOpen={false}
        verifyEmailOpen={true}
        verifyEmail="a@b.com"
        forgotOpen={false}
        forgotEmail=""
        onSignInOpenChange={jest.fn()}
        onSignUpOpenChange={jest.fn()}
        onVerifyEmailOpenChange={jest.fn()}
        setVerifyEmail={jest.fn()}
        onForgotOpenChange={jest.fn()}
        setForgotEmail={jest.fn()}
        onSignedIn={jest.fn()}
      />
    );

    expect(screen.getByText("SignInDialog")).toBeInTheDocument();
    expect(screen.getByText(/VerifyEmailDialog a@b.com/i)).toBeInTheDocument();
  });
});
