import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessDialog } from "@/components/dialogs/SuccessDialog";

describe("<SuccessDialog />", () => {
  it("calls onReportAnother when clicked", () => {
    const onOpenChange = jest.fn();
    const onReportAnother = jest.fn();

    render(
      <SuccessDialog
        open={true}
        onOpenChange={onOpenChange}
        reportType="lost"
        onReportAnother={onReportAnother}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /report another item/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onReportAnother).toHaveBeenCalled();
  });
});
