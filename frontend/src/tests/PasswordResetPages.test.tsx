import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import API from "../api/axios";
import * as toastUtils from "../utils/toast";

vi.mock("../api/axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/axios")>();
  return {
    ...actual,
    default: {
      post: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      interceptors: { request: { use: vi.fn() } },
    },
  };
});

describe("ForgotPasswordPage & ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("ForgotPasswordPage submits email and shows success toast", async () => {
    const user = userEvent.setup();
    const successSpy = vi.spyOn(toastUtils, "successToast");
    vi.mocked(API.post).mockResolvedValueOnce({
      data: { message: "Token sent to email!" },
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(API.post).toHaveBeenCalledWith("/auth/forgotpassword", {
      email: "alice@example.com",
    });
    expect(successSpy).toHaveBeenCalledWith("Token sent to email!");
  });

  it("ForgotPasswordPage shows error toast on failure", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(toastUtils, "errorToast");
    vi.mocked(API.post).mockRejectedValueOnce(new Error("User not found"));

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email address/i),
      "missing@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(errorSpy).toHaveBeenCalledWith("User not found");
  });

  it("ResetPasswordPage validates matching passwords and resets password", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(toastUtils, "errorToast");
    const successSpy = vi.spyOn(toastUtils, "successToast");

    render(
      <MemoryRouter initialEntries={["/reset-password/abc-token"]}>
        <Routes>
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/dashboard" element={<div>Dashboard Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/new password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(errorSpy).toHaveBeenCalledWith("Passwords do not match");

    vi.mocked(API.put).mockResolvedValueOnce({
      data: {
        _id: "1",
        name: "Alice",
        email: "alice@example.com",
        token: "new-jwt",
        message: "Password reset successful",
      },
    });

    const confirmInput = screen.getByLabelText(/confirm password/i);
    await user.clear(confirmInput);
    await user.type(confirmInput, "password123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(API.put).toHaveBeenCalledWith("/auth/resetpassword/abc-token", {
      password: "password123",
    });
    expect(successSpy).toHaveBeenCalledWith("Password reset successful");
    expect(await screen.findByText("Dashboard Target")).toBeInTheDocument();
  });
});
