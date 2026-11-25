import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";
import * as expenseApi from "../api/expenseApi";
import * as authService from "../services/authService";
import API from "../api/axios";
import { getErrorMessage } from "../utils/error";

vi.mock("../api/axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/axios")>();
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: { request: { use: vi.fn() } },
    },
  };
});

describe("Routes, API clients, and error utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("PrivateRoute redirects to /login when unauthenticated and renders children when authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login View</div>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Private Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login View")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("token", "my-token");
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login View</div>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Private Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Private Content")).toBeInTheDocument();
  });

  it("ProtectedRoute checks AuthContext user token", () => {
    render(
      <AuthContext.Provider
        value={{
          user: { _id: "1", name: "Alice", email: "a@b.com", token: "tok" },
          token: "tok",
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("expenseApi calls correct endpoints with Authorization header", async () => {
    vi.mocked(API.get).mockResolvedValueOnce({ data: [] });
    await expenseApi.getExpenses("tok-1");
    expect(API.get).toHaveBeenCalledWith("/expenses", {
      headers: { Authorization: "Bearer tok-1" },
    });

    vi.mocked(API.post).mockResolvedValueOnce({ data: { _id: "1" } });
    await expenseApi.addExpense({ title: "Lunch", amount: 100 }, "tok-1");
    expect(API.post).toHaveBeenCalledWith(
      "/expenses",
      { title: "Lunch", amount: 100 },
      { headers: { Authorization: "Bearer tok-1" } }
    );

    vi.mocked(API.put).mockResolvedValueOnce({ data: { _id: "1" } });
    await expenseApi.updateExpense("1", { amount: 200 }, "tok-1");
    expect(API.put).toHaveBeenCalledWith(
      "/expenses/1",
      { amount: 200 },
      { headers: { Authorization: "Bearer tok-1" } }
    );

    vi.mocked(API.delete).mockResolvedValueOnce({ data: { message: "ok" } });
    await expenseApi.deleteExpense("1", "tok-1");
    expect(API.delete).toHaveBeenCalledWith("/expenses/1", {
      headers: { Authorization: "Bearer tok-1" },
    });
  });

  it("authService handles success and normalizes errors", async () => {
    vi.mocked(API.post).mockResolvedValueOnce({ data: { token: "t1" } });
    const loginRes = await authService.loginUser({
      email: "a@b.com",
      password: "123",
    });
    expect(loginRes.token).toBe("t1");

    vi.mocked(API.post).mockRejectedValueOnce("unknown");
    await expect(
      authService.registerUser({ name: "A", email: "a@b.com", password: "123" })
    ).rejects.toThrow("Registration failed");
  });

  it("getErrorMessage returns fallback for non-Error values", () => {
    expect(getErrorMessage("unexpected", "Fallback")).toBe("Fallback");
  });
});
