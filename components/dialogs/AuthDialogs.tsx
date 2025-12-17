"use client";

import { SignUpDialog } from "@/components/dialogs/SignUpDialog";
import { SignInDialog } from "@/components/dialogs/SignInDialog";
import { VerifyEmailDialog } from "@/components/dialogs/VerifyEmailDialog";
import { ForgotPasswordDialog } from "@/components/dialogs/ForgotPasswordDialog";
import type { User } from "@/hooks/useAuth";

type AuthDialogsProps = {
  signInOpen: boolean;
  signUpOpen: boolean;
  verifyEmailOpen: boolean;
  verifyEmail: string;
  forgotOpen: boolean;
  forgotEmail: string;
  onSignInOpenChange: (open: boolean) => void;
  onSignUpOpenChange: (open: boolean) => void;
  onVerifyEmailOpenChange: (open: boolean) => void;
  setVerifyEmail: (email: string) => void;
  onForgotOpenChange: (open: boolean) => void;
  setForgotEmail: (email: string) => void;
  onSignedIn: (user: User) => void;
};

export function AuthDialogs({
  signInOpen,
  signUpOpen,
  verifyEmailOpen,
  verifyEmail,
  forgotOpen,
  forgotEmail,
  onSignInOpenChange,
  onSignUpOpenChange,
  onVerifyEmailOpenChange,
  setVerifyEmail,
  onForgotOpenChange,
  setForgotEmail,
  onSignedIn,
}: AuthDialogsProps) {
  const handleSwitchToSignUp = () => {
    onSignInOpenChange(false);
    onSignUpOpenChange(true);
  };

  const handleSwitchToSignIn = () => {
    onSignUpOpenChange(false);
    onSignInOpenChange(true);
  };

  return (
    <>
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={onSignUpOpenChange}
        onSwitchToSignIn={handleSwitchToSignIn}
      />

      <SignInDialog
        open={signInOpen}
        onOpenChange={onSignInOpenChange}
        onSwitchToSignUp={handleSwitchToSignUp}
        onEmailNotVerified={(email) => {
          setVerifyEmail(email);
          onVerifyEmailOpenChange(true);
        }}
        onForgotPassword={(email) => {
          setForgotEmail(email || "");
          onForgotOpenChange(true);
        }}
        onSignedIn={onSignedIn}
      />

      <VerifyEmailDialog
        open={verifyEmailOpen}
        email={verifyEmail}
        onOpenChange={onVerifyEmailOpenChange}
      />

      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={onForgotOpenChange}
        forgotEmail={forgotEmail}
      />
    </>
  );
}
