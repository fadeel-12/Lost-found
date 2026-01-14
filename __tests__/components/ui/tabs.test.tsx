import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Tabs", () => {
  it("renders triggers and shows the active tab content", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>

        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();

    // defaultValue="a" should show A content
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("switches tabs when clicking a trigger (uncontrolled)", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>

        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByText("B"));

    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("calls onValueChange when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    await user.click(screen.getByText("B"));

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
});

