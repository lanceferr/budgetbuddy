import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockRegister = jest.fn();
jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
    isLoading: false,
  }),
}));

describe("Register Page", () => {
  beforeEach(() => jest.clearAllMocks());

  function setup() {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  }

  test("renders heading and subtitle", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/start your financial journey today/i)
    ).toBeInTheDocument();
  });

  test("renders input fields", () => {
    setup();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("shows error if password is too short", () => {
    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "test" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText(/password must be at least 8 characters long/i)
    ).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  test("submits registration data", () => {
    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "test" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockRegister).toHaveBeenCalledWith({
      username: "test",
      email: "test@example.com",
      password: "password123",
    });
  });

  test("navigates to dashboard on success", async () => {
    mockRegister.mockResolvedValue({ message: "Success" });

    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows API error message", async () => {
    mockRegister.mockRejectedValue(new Error("Email already in use"));

    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByText("Email already in use")).toBeInTheDocument()
    );
  });
});
