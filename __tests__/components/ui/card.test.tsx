import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

describe("<Card />", () => {
  it("renders sections", () => {
    render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
  });
});

