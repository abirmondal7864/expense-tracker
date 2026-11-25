import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
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

describe("LoginPage", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: undefined,
          login: mockLogin,
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it("submits email and password and navigates on success", async () => {
    const user = userEvent.setup();
    const successSpy = vi.spyOn(toastUtils, "successToast");
    mockLogin.mockResolvedValueOnce({
      _id: "1",
      name: "Alice",
      email: "alice@example.com",
      token: "jwt",
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith("alice@example.com", "secret123");
    expect(successSpy).toHaveBeenCalledWith("Login successful!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows error toast when login fails", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(toastUtils, "errorToast");
    mockLogin.mockRejectedValueOnce(new Error("Invalid email or password"));

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(errorSpy).toHaveBeenCalledWith("Invalid email or password");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
