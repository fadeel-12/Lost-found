import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/link", () => {
  return function Link(props: any) {
    const { href, children, ...rest } = props;
    const resolvedHref =
      typeof href === "string" ? href : href?.pathname || "#";

    return React.createElement(
      "a",
      { href: resolvedHref, ...rest },
      children
    );
  };
});

jest.mock("next/image", () => {
  return function Image(props: any) {
    const { alt, ...rest } = props;
    return React.createElement("img", { alt: alt || "", ...rest });
  };
});


jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(""),
  usePathname: () => "/",
}));

// sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}));

// Default fetch mock (override per-test when needed)
if (!global.fetch) {
  global.fetch = jest.fn();
}

