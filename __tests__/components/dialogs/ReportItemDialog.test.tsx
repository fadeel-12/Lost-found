import { render, screen, waitFor } from "@testing-library/react";
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
          json: async () => ({
            categories: [{ id: "cat-1", name: "Bags" }],
          }),
        } as any;
      }

      if (url === "/api/locations") {
        return {
          ok: true,
          json: async () => ({
            locations: [{ id: "loc-1", name: "Library" }],
          }),
        } as any;
      }

      return { ok: true, json: async () => ({}) } as any;
    }) as any;
  });

  it("renders when open", async () => {
    render(<ReportItemDialog open={true} onOpenChange={jest.fn()} user={null} />);

    expect(await screen.findByText(/report item/i)).toBeInTheDocument();
    expect(
      screen.getByText(/fill in the details to report a lost or found item/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories");
      expect(global.fetch).toHaveBeenCalledWith("/api/locations");
    });
  });

  it("does not fetch options when closed", async () => {
    render(<ReportItemDialog open={false} onOpenChange={jest.fn()} user={null} />);

    expect(screen.queryByText(/report item/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
