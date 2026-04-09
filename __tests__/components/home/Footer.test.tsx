import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/home/Footer";

describe("<Footer />", () => {
  it("renders brand name", () => {
    render(<Footer />);
    expect(screen.getAllByText(/UIBK Lost and Found/i).length).toBeGreaterThan(0);
  });

  it("renders brand description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/helping students and staff report/i)
    ).toBeInTheDocument();
  });

  it("renders Quick Links section with Home and University links", () => {
    render(<Footer />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /university of innsbruck/i })
    ).toBeInTheDocument();
  });

  it("renders Policies section with all policy links", () => {
    render(<Footer />);
    expect(screen.getByText("Policies")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(screen.getByRole("link", { name: /terms of use/i })).toHaveAttribute(
      "href",
      "/terms-of-use"
    );
    expect(screen.getByRole("link", { name: /cookie policy/i })).toHaveAttribute(
      "href",
      "/cookie-policy"
    );
    expect(screen.getByRole("link", { name: /data protection/i })).toHaveAttribute(
      "href",
      "/data-protection"
    );
  });

  it("renders Contact section with address", () => {
    render(<Footer />);
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText(/Innrain 52/i)).toBeInTheDocument();
    expect(screen.getByText(/Austria/i)).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /twitter/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  it("social media links open in a new tab", () => {
    render(<Footer />);
    const facebook = screen.getByRole("link", { name: /facebook/i });
    expect(facebook).toHaveAttribute("target", "_blank");
    expect(facebook).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders copyright notice with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});
