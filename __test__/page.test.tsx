import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

test("Page", () => {
  render(<Page />);
  // expect(screen.getByText("World Food Passport")).toBeDefined();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "World Food Passport is the restaurant tracker for your food world.",
    }),
  ).toBeDefined();
});
// const Page = () => {
//   return (
//     <div>
//       <h1>Home</h1>
//       <a href="/about">About</a>
//     </div>
//   );
// };

// test("Page", () => {
//   render(<Page />);
//   expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeDefined();
// });
