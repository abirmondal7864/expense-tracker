import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../pages/DashboardPage";
import { AuthContext } from "../context/AuthContext";
import * as expenseApi from "../api/expenseApi";
import type { Expense } from "../types";

vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
}));

vi.mock("../api/expenseApi");

const sampleExpenses: Expense[] = [
  {
    _id: "exp-1",
    user: "user-1",
    title: "Groceries",
    amount: 1200,
    category: "Food",
    date: "2026-03-10T10:00:00.000Z",
  },
  {
    _id: "exp-2",
    user: "user-1",
    title: "Metro Pass",
    amount: 500,
    category: "Transport",
    date: "2026-03-15T10:00:00.000Z",
  },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  const renderDashboard = () =>
    render(
      <AuthContext.Provider
        value={{
          user: {
            _id: "user-1",
            name: "Alice",
            email: "alice@example.com",
            token: "test-token",
          },
          token: "test-token",
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <DashboardPage />
      </AuthContext.Provider>
    );

  it("renders summary cards, charts, and fetched expenses", async () => {
    vi.mocked(expenseApi.getExpenses).mockResolvedValueOnce(sampleExpenses);

    renderDashboard();

    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Metro Pass")).toBeInTheDocument();
    expect(screen.getByText("Logged in as alice@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders empty state when user has no expenses", async () => {
    vi.mocked(expenseApi.getExpenses).mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText(/No expenses yet/i)).toBeInTheDocument();
  });

  it("handles API error when loading expenses fails", async () => {
    vi.mocked(expenseApi.getExpenses).mockRejectedValueOnce(
      new Error("Network failure")
    );

    renderDashboard();

    expect(
      await screen.findByText(/Error: Network failure/i)
    ).toBeInTheDocument();
  });

  it("creates a new expense and refreshes the list", async () => {
    const user = userEvent.setup();
    vi.mocked(expenseApi.getExpenses)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          _id: "exp-3",
          user: "user-1",
          title: "Coffee",
          amount: 250,
          category: "Food",
          date: "2026-03-20T10:00:00.000Z",
        },
      ]);
    vi.mocked(expenseApi.addExpense).mockResolvedValueOnce({
      _id: "exp-3",
      user: "user-1",
      title: "Coffee",
      amount: 250,
      category: "Food",
      date: "2026-03-20T10:00:00.000Z",
    });

    renderDashboard();
    await screen.findByText(/No expenses yet/i);

    await user.type(screen.getByPlaceholderText("Groceries"), "Coffee");
    await user.type(screen.getByPlaceholderText("1200"), "250");
    const catInput = screen.getByPlaceholderText("Food");
    await user.clear(catInput);
    await user.type(catInput, "Food");

    await user.click(screen.getByRole("button", { name: /Add Expense/i }));

    expect(expenseApi.addExpense).toHaveBeenCalledWith(
      { title: "Coffee", amount: 250, category: "Food" },
      "test-token"
    );
    expect(await screen.findByText("Coffee")).toBeInTheDocument();
  });

  it("edits an existing expense", async () => {
    const user = userEvent.setup();
    vi.mocked(expenseApi.getExpenses)
      .mockResolvedValueOnce(sampleExpenses)
      .mockResolvedValueOnce([
        { ...sampleExpenses[0], title: "Supermarket" },
        sampleExpenses[1],
      ]);
    vi.mocked(expenseApi.updateExpense).mockResolvedValueOnce({
      ...sampleExpenses[0],
      title: "Supermarket",
    });

    renderDashboard();
    await screen.findByText("Groceries");

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[0]);

    const titleInput = screen.getByPlaceholderText("Groceries");
    await user.clear(titleInput);
    await user.type(titleInput, "Supermarket");

    await user.click(screen.getByRole("button", { name: /Update Expense/i }));

    expect(expenseApi.updateExpense).toHaveBeenCalledWith(
      "exp-1",
      { title: "Supermarket", amount: 1200, category: "Food" },
      "test-token"
    );
    expect(await screen.findByText("Supermarket")).toBeInTheDocument();
  });

  it("deletes an expense after confirmation modal", async () => {
    const user = userEvent.setup();
    vi.mocked(expenseApi.getExpenses).mockResolvedValueOnce(sampleExpenses);
    vi.mocked(expenseApi.deleteExpense).mockResolvedValueOnce({
      message: "Expense removed",
    });

    renderDashboard();
    await screen.findByText("Groceries");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    const modal = screen.getByText("Are you sure?").closest(".modal") as HTMLElement;
    await user.click(within(modal).getByRole("button", { name: "Delete" }));

    expect(expenseApi.deleteExpense).toHaveBeenCalledWith(
      "exp-1",
      "test-token"
    );
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
    expect(screen.getByText("Metro Pass")).toBeInTheDocument();
  });

  it("filters by search, category, and sorts expenses", async () => {
    const user = userEvent.setup();
    vi.mocked(expenseApi.getExpenses).mockResolvedValueOnce(sampleExpenses);

    renderDashboard();
    await screen.findByText("Groceries");

    // Search
    const searchInput = screen.getByPlaceholderText("Search by title...");
    await user.type(searchInput, "Metro");
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
    expect(screen.getByText("Metro Pass")).toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getByText("Groceries")).toBeInTheDocument();

    // Category filter
    const categorySelect = screen.getByLabelText("Filter by category");
    await user.selectOptions(categorySelect, "Food");
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Metro Pass")).not.toBeInTheDocument();

    await user.selectOptions(categorySelect, "");

    // Sort amount ascending -> Metro Pass (500) before Groceries (1200)
    const sortSelect = screen.getByLabelText("Sort expenses");
    await user.selectOptions(sortSelect, "amount_asc");
    const items = screen.getAllByRole("article");
    const expenseArticles = items.filter((el) =>
      el.classList.contains("expense-item")
    );
    expect(expenseArticles[0]).toHaveTextContent("Metro Pass");
    expect(expenseArticles[1]).toHaveTextContent("Groceries");
  });
});
