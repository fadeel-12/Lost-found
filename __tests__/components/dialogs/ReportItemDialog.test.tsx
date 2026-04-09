import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReportItemDialog } from "@/components/dialogs/ReportItemDialog";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function mockBrowserApis() {
  if (!("ResizeObserver" in globalThis)) {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!("matchMedia" in globalThis)) {
    global.matchMedia = () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
}

const mockUser = {
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  phone: "+43 664 000 0000",
  email_verified: true,
  verified_at: null,
  created_at: "2024-01-01",
  student_id: null,
};

describe("<ReportItemDialog />", () => {
  beforeAll(() => {
    mockBrowserApis();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn(async (url: any) => {
      if (url === "/api/categories") {
        return {
          ok: true,
          json: async () => ({ categories: [{ id: "cat-1", name: "Bags" }] }),
        } as any;
      }
      if (url === "/api/locations") {
        return {
          ok: true,
          json: async () => ({ locations: [{ id: "loc-1", name: "Library" }] }),
        } as any;
      }
      return { ok: true, json: async () => ({}) } as any;
    }) as any;
  });

  it("renders when open", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={null} />);
    expect(await screen.findByText(/report item/i)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ReportItemDialog open={false} onOpenChange={jest.fn()} user={null} />);
    expect(screen.queryByText(/report item/i)).not.toBeInTheDocument();
  });

  it("fetches categories and locations on open", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={null} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories");
      expect(global.fetch).toHaveBeenCalledWith("/api/locations");
    });
  });

  it("does not fetch options when closed", async () => {
    render(<ReportItemDialog open={false} onOpenChange={jest.fn()} user={null} />);
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("category field is not required", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={mockUser} />);
    await screen.findByText(/report item/i);

    const categoryLabel = screen.getByText("Category");
    expect(categoryLabel.textContent).not.toContain("*");
  });

  it("location field is not required", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={mockUser} />);
    await screen.findByText(/report item/i);

    const locationLabel = screen.getByText("Location");
    expect(locationLabel.textContent).not.toContain("*");
  });

  it("submits successfully without category and location selected", async () => {
    const onSuccess = jest.fn();

    global.fetch = jest.fn(async (url: any) => {
      if (url === "/api/categories") {
        return { ok: true, json: async () => ({ categories: [] }) } as any;
      }
      if (url === "/api/locations") {
        return { ok: true, json: async () => ({ locations: [] }) } as any;
      }
      if (url === "/api/items") {
        return { ok: true, json: async () => ({ id: "item-1" }) } as any;
      }
      return { ok: true, json: async () => ({}) } as any;
    }) as any;

    render(
      <ReportItemDialog open={true} onOpenChange={jest.fn()} user={mockUser} onSuccess={onSuccess} />
    );

    await screen.findByText(/report item/i);

    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: "Lost Wallet" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Brown leather wallet" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2026-03-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("lost");
    });
  });

  it("pre-fills user info when user is logged in", async () => {
    render(
      <ReportItemDialog open={true} onOpenChange={jest.fn()} user={mockUser} />
    );
    await screen.findByText(/report item/i);

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+43 664 000 0000")).toBeInTheDocument();
  });

  it("shows lost and found radio options", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={null} />);
    await screen.findByText(/report item/i);

    expect(screen.getByLabelText(/lost item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/found item/i)).toBeInTheDocument();
  });

  it("closes when Cancel is clicked", async () => {
    const onOpenChange = jest.fn();
    render(<ReportItemDialog open={true} onOpenChange={onOpenChange} user={null} />);
    await screen.findByText(/report item/i);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
