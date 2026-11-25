import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import { AuthContext } from "../context/AuthContext";
import * as toastUtils from "../utils/toast";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () =>
    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: undefined,
          login: vi.fn(),
          register: mockRegister,
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it("validates minimum password length before calling register", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(toastUtils, "errorToast");

    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "123");

    // Submit form directly to bypass native HTML5 minLength constraint in jsdom
    const form = screen
      .getByRole("button", { name: /register/i })
      .closest("form")!;
    fireEvent.submit(form);

    expect(
      screen.getByText("Password must be at least 6 characters.")
    ).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith(
      "Password must be at least 6 characters."
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("registers a new user and navigates to home on success", async () => {
    const user = userEvent.setup();
    const successSpy = vi.spyOn(toastUtils, "successToast");
    mockRegister.mockResolvedValueOnce({
      _id: "1",
      name: "Alice",
      email: "alice@example.com",
      token: "jwt",
    });

    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(mockRegister).toHaveBeenCalledWith(
      "Alice",
      "alice@example.com",
      "password123"
    );
    expect(successSpy).toHaveBeenCalledWith("Registration successful!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays error message when registration fails", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error("User already exists"));

    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
  });
});
