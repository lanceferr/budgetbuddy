// Home.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../pages/Home";

describe("Home Page", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });

  test("renders header with logo", () => {
    expect(screen.getByText("Budget Buddy")).toBeInTheDocument();
  });

  test("renders hero section with main heading", () => {
    expect(
      screen.getByRole("heading", {
        name: /Your Smart Finance Companion for Student Life/i,
      })
    ).toBeInTheDocument();
  });

  test("renders hero section paragraph", () => {
    expect(
      screen.getByText(
        /Managing money as a student doesn't have to be complicated/i
      )
    ).toBeInTheDocument();
  });

  test("renders Get Started and Login buttons in header", () => {
    expect(screen.getAllByText("Login")[0]).toHaveAttribute("href", "/login");
    expect(screen.getAllByText("Get Started")[0]).toHaveAttribute(
      "href",
      "/register"
    );
  });

  test("renders feature titles", () => {
    const features = [
      "💰 Expense Tracking",
      "🎯 Smart Budgeting",
      "📊 Visual Insights",
      "💵 Income Tracking",
      "🔒 Secure & Private",
      "🔔 Smart Alerts",
    ];

    features.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  test("renders footer", () => {
    expect(screen.getByText(/© 2025 Budget Buddy/i)).toBeInTheDocument();
  });
});
