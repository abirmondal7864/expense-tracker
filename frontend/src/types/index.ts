export type ExpenseCategory = string;

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface AuthResponse extends User {
  message?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | undefined;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

export interface Expense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpensePayload {
  title: string;
  amount: number;
  category?: ExpenseCategory;
  date?: string;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  category: ExpenseCategory;
}

export type SortOption =
  | ""
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc";

export interface ExpenseFiltersState {
  search: string;
  category: ExpenseCategory;
  sort: SortOption;
}

export interface DashboardSummary {
  total: number;
  count: number;
  categoryCount: number;
  average: number;
  largestExpense: number;
}

export interface ApiErrorResponse {
  message?: string;
}

export interface DeleteExpenseResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}
