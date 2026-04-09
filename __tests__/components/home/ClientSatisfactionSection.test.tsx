import { render, screen } from "@testing-library/react";
import { ClientSatisfactionSection } from "@/components/home/ClientSatisfactionSection";

describe("<ClientSatisfactionSection />", () => {
  it("renders the section heading", () => {
    render(<ClientSatisfactionSection />);
    expect(
      screen.getByText(/trusted by the UIBK community/i)
    ).toBeInTheDocument();
  });

  it("renders the subheading description", () => {
    render(<ClientSatisfactionSection />);
    expect(
      screen.getByText(/thousands of students and staff/i)
    ).toBeInTheDocument();
  });

  it("renders all 4 stat values", () => {
    render(<ClientSatisfactionSection />);
    expect(screen.getByText("94%")).toBeInTheDocument();
    expect(screen.getByText("1,200+")).toBeInTheDocument();
    expect(screen.getByText("3,500+")).toBeInTheDocument();
    expect(screen.getByText("< 48h")).toBeInTheDocument();
  });

  it("renders all 4 stat labels", () => {
    render(<ClientSatisfactionSection />);
    expect(screen.getByText("Recovery Rate")).toBeInTheDocument();
    expect(screen.getByText("Items Recovered")).toBeInTheDocument();
    expect(screen.getByText("Registered Users")).toBeInTheDocument();
    expect(screen.getByText("Avg. Response Time")).toBeInTheDocument();
  });

  it("renders all 3 testimonial names", () => {
    render(<ClientSatisfactionSection />);
    expect(screen.getByText("Anna M.")).toBeInTheDocument();
    expect(screen.getByText("Prof. Klaus R.")).toBeInTheDocument();
    expect(screen.getByText("Sofia T.")).toBeInTheDocument();
  });

  it("renders all 3 testimonial roles", () => {
    render(<ClientSatisfactionSection />);
    expect(screen.getByText("Student, Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Faculty, Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Student, Biology")).toBeInTheDocument();
  });

  it("renders testimonial quote text", () => {
    render(<ClientSatisfactionSection />);
    expect(screen.getByText(/lost my laptop bag/i)).toBeInTheDocument();
    expect(screen.getByText(/returned my USB drive/i)).toBeInTheDocument();
    expect(screen.getByText(/less than 2 minutes/i)).toBeInTheDocument();
  });
});
