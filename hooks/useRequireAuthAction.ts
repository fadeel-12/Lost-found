"use client";

export function useRequireAuthAction(
  user: any,
  loading: boolean,
  openSignIn: () => void
) {
  return (action: () => void) => {
    if (loading) return;
    if (!user) {
      openSignIn();
      return;
    }
    action();
  };
}
