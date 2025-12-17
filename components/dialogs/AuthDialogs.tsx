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

export function AuthDialogs(props: AuthDialogsProps) {
  const closeAll = () => {
    props.onSignInOpenChange(false);
    props.onSignUpOpenChange(false);
    props.onVerifyEmailOpenChange(false);
    props.onForgotOpenChange(false);
  };

  const openSignUp = () => {
    closeAll();
    props.onSignUpOpenChange(true);
  };

  const openSignIn = () => {
    closeAll();
    props.onSignInOpenChange(true);
  };

  const openVerify = (email: string) => {
    closeAll();
    props.setVerifyEmail(email);
    props.onVerifyEmailOpenChange(true);
  };

  const openForgot = (email?: string) => {
    closeAll();
    props.setForgotEmail(email || "");
    props.onForgotOpenChange(true);
  };

  return (
    <>
      <SignUpDialog
        open={props.signUpOpen}
        onOpenChange={props.onSignUpOpenChange}
        onSwitchToSignIn={openSignIn}
      />

      <SignInDialog
        open={props.signInOpen}
        onOpenChange={props.onSignInOpenChange}
        onSwitchToSignUp={openSignUp}
        onEmailNotVerified={openVerify}
        onForgotPassword={openForgot}
        onSignedIn={props.onSignedIn}
      />

      <VerifyEmailDialog
        open={props.verifyEmailOpen}
        email={props.verifyEmail}
        onOpenChange={props.onVerifyEmailOpenChange}
      />

      <ForgotPasswordDialog
        open={props.forgotOpen}
        onOpenChange={props.onForgotOpenChange}
        forgotEmail={props.forgotEmail}
      />
    </>
  );
}
