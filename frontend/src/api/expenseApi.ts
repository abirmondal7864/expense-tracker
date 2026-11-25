import API from "./axios";
import type {
  DeleteExpenseResponse,
  Expense,
  ExpensePayload,
} from "../types";

// Get all expenses
export const getExpenses = async (token?: string): Promise<Expense[]> => {
  const res = await API.get<Expense[]>("/expenses", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};

// Add expense
export const addExpense = async (
  data: ExpensePayload,
  token?: string
): Promise<Expense> => {
  const res = await API.post<Expense>("/expenses", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};

// Delete expense
export const deleteExpense = async (
  id: string,
  token?: string
): Promise<DeleteExpenseResponse> => {
  const res = await API.delete<DeleteExpenseResponse>(`/expenses/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};

// Update expense
export const updateExpense = async (
  id: string,
  data: Partial<ExpensePayload>,
  token?: string
): Promise<Expense> => {
  const res = await API.put<Expense>(`/expenses/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};
