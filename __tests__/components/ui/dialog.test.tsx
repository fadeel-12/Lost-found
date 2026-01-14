import { render, screen } from "@testing-library/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

describe("<Dialog />", () => {
  it("renders content when open", () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <div>Body</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

