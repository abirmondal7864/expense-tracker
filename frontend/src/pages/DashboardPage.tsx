import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/EmptyState";
import ExpenseFilters from "../components/ExpenseFilters";
import Analytics from "../components/Analytics";
import ExpenseItem from "../components/ExpenseItem";
import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../api/expenseApi";
import { logout } from "../utils/auth";
import { getErrorMessage } from "../utils/error";
import type {
  Expense,
  ExpenseFiltersState,
  ExpenseFormData,
  ExpensePayload,
} from "../types";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<ExpenseFormData>({
    title: "",
    amount: "",
    category: "General",
  });
  const [showForm, setShowForm] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFiltersState>({
    search: "",
    category: "",
    sort: "",
  });

  // Fetch expenses
  const fetchExpenses = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses(token);
      setExpenses(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to load expenses");
      setError(msg);
      errorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Delete expense
  const handleDeleteClick = (id: string): void => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedId) return;

    try {
      setSaving(true);
      setError(null);
      await deleteExpense(selectedId, token);
      setExpenses((current) => current.filter((e) => e._id !== selectedId));
      setShowModal(false);
      successToast("Deleted successfully");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to delete expense");
      setError(msg);
      errorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense: Expense): void => {
    setEditId(expense._id);
    setShowForm(true);
    setForm({
      title: expense.title ?? "",
      amount: expense.amount !== undefined ? String(expense.amount) : "",
      category: expense.category ?? "General",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add or update expense
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      const payload: ExpensePayload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category || "General",
      };

      if (editId) {
        await updateExpense(editId, payload, token);
        successToast("Expense updated successfully");
      } else {
        await addExpense(payload, token);
        successToast("Expense added successfully");
      }

      await fetchExpenses();

      setForm({ title: "", amount: "", category: "General" });
      setEditId(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to save expense");
      setError(msg);
      errorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = Array.from(
    new Set(expenses.map((e) => e.category || "General"))
  );

  const getFilteredExpenses = (): Expense[] => {
    let data = [...expenses];

    // 1. Filter by category
    if (filters.category) {
      data = data.filter(
        (exp) => (exp.category || "General") === filters.category
      );
    }

    // 2. Search by title
    if (filters.search) {
      data = data.filter((exp) =>
        (exp.title || "").toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 3. Sort
    if (filters.sort === "date_desc") {
      data.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
    } else if (filters.sort === "date_asc") {
      data.sort(
        (a, b) =>
          new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      );
    } else if (filters.sort === "amount_desc") {
      data.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (filters.sort === "amount_asc") {
      data.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    }

    return data;
  };

  const filteredExpenses = getFilteredExpenses();

  const total = expenses.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );
  const largestExpense = expenses.reduce(
    (max, expense) => Math.max(max, Number(expense.amount) || 0),
    0
  );
  const categories = new Set(
    expenses.map((expense) => expense.category || "General")
  );
  const average = expenses.length ? total / expenses.length : 0;
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  if (loading) return <Loader fullPage={true} />;

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Expense Tracker</p>
          <h1>Dashboard</h1>
          <p className="muted">Logged in as {user?.email}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </header>

      {error ? <p className="alert">Error: {error}</p> : null}

      <section className="summary-grid" aria-label="Expense summary">
        <article className="summary-tile primary">
          <span>Total spent</span>
          <strong>{formatter.format(total)}</strong>
        </article>
        <article className="summary-tile">
          <span>Entries</span>
          <strong>{expenses.length}</strong>
        </article>
        <article className="summary-tile">
          <span>Categories</span>
          <strong>{categories.size}</strong>
        </article>
        <article className="summary-tile">
          <span>Average</span>
          <strong>{formatter.format(average)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <div className="expense-form-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Manage</p>
              <h2>{editId ? "Edit expense" : "Add expense"}</h2>
            </div>
            {!showForm ? (
              <Button variant="secondary" onClick={() => setShowForm(true)}>
                Add Expense
              </Button>
            ) : null}
          </div>

          {showForm ? (
            <form className="stack" onSubmit={handleSubmit}>
              <Input
                label="Title"
                placeholder="Groceries"
                value={form.title}
                required
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Input
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1200"
                value={form.amount}
                required
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
              <Input
                label="Category"
                placeholder="Food"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
              <div className="form-actions">
                <Button variant="primary" type="submit" loading={saving}>
                  {editId ? "Update Expense" : "Add Expense"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setEditId(null);
                    setForm({ title: "", amount: "", category: "General" });
                  }}
                >
                  {editId ? "Cancel Edit" : "Clear"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="muted">
              Open the form when you are ready to add another expense.
            </p>
          )}
        </div>

        <div className="expense-list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Expenses</h2>
            </div>
            <span className="pill">
              Largest {formatter.format(largestExpense)}
            </span>
          </div>

          {expenses.length > 0 && (
            <ExpenseFilters
              filters={filters}
              setFilters={setFilters}
              categories={categoriesList}
            />
          )}

          <Analytics expenses={filteredExpenses} />

          {expenses.length === 0 ? (
            <EmptyState
              message="No expenses yet 😐"
              subMessage="Start by adding your first expense"
              actionText="Add your first expense"
              onAction={() => setShowForm(true)}
            />
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              message="No matches found"
              subMessage="Try adjusting your search or filters"
              actionText="Clear Filters"
              onAction={() =>
                setFilters({ search: "", category: "", sort: "" })
              }
            />
          ) : (
            <div className="expense-list">
              {filteredExpenses.map((e) => (
                <ExpenseItem
                  key={e._id}
                  expense={e}
                  onDelete={handleDeleteClick}
                  onEdit={() => handleEdit(e)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "10px" }}>Are you sure?</h3>
          <p className="muted" style={{ marginBottom: "20px" }}>
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={saving}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
