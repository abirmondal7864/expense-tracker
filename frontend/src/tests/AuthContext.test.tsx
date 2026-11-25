import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../context/AuthContext";
import API from "../api/axios";

vi.mock("../api/axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/axios")>();
  return {
    ...actual,
    default: {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: { request: { use: vi.fn() } },
    },
  };
});

const TestConsumer = () => {
  const { user, token, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user?.email ?? "none"}</span>
      <span data-testid="user-token">{token ?? "none"}</span>
      <button onClick={() => login("a@b.com", "pass123").catch(() => {})}>
        Do Login
      </button>
      <button
        onClick={() => register("Alice", "a@b.com", "pass123").catch(() => {})}
      >
        Do Register
      </button>
      <button onClick={logout}>Do Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("initializes from localStorage when valid user JSON exists", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: "1",
        name: "Alice",
        email: "alice@example.com",
        token: "jwt-123",
      })
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "alice@example.com"
    );
    expect(screen.getByTestId("user-token")).toHaveTextContent("jwt-123");
  });

  it("handles malformed JSON in localStorage gracefully", () => {
    localStorage.setItem("user", "{bad-json");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
  });

  it("logs in, registers, and logs out updating state and localStorage", async () => {
    const user = userEvent.setup();
    vi.mocked(API.post).mockResolvedValueOnce({
      data: {
        _id: "1",
        name: "Alice",
        email: "a@b.com",
        token: "login-token",
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("Do Login"));
    expect(screen.getByTestId("user-email")).toHaveTextContent("a@b.com");
    expect(screen.getByTestId("user-token")).toHaveTextContent("login-token");
    expect(localStorage.getItem("user")).toContain("login-token");

    await user.click(screen.getByText("Do Logout"));
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(localStorage.getItem("user")).toBeNull();

    vi.mocked(API.post).mockResolvedValueOnce({
      data: {
        _id: "2",
        name: "Alice",
        email: "a@b.com",
        token: "reg-token",
      },
    });

    await user.click(screen.getByText("Do Register"));
    expect(screen.getByTestId("user-token")).toHaveTextContent("reg-token");
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );
    spy.mockRestore();
  });

  it("propagates API error message on login failure", async () => {
    let caughtError: unknown;
    const ErrorProbe = () => {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            try {
              await login("a@b.com", "wrong");
            } catch (e) {
              caughtError = e;
            }
          }}
        >
          Trigger
        </button>
      );
    };

    vi.mocked(API.post).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <AuthProvider>
        <ErrorProbe />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Trigger").click();
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toBe("Invalid credentials");
  });
});
