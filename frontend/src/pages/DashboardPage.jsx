import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ExpenseItem from "../components/ExpenseItem";
import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../api/expenseApi";

export default function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "General" });
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses(token);
      setExpenses(data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load expenses";
      setError(msg);
      errorToast(msg);
    } finally {
      setLoading(false);
    }
  };
      errorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchExpenses();
  }, [token]);

  // Delete expense
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      setError(null);
      await deleteExpense(selectedId, token);
      setExpenses((current) => current.filter((e) => e._id !== selectedId));
      setShowModal(false);
      successToast("Deleted successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete expense";
  const handleEdit = (expense) => {
    setEditId(expense._id);
    setShowForm(true);
    setForm({
      title: expense.title ?? "",
      amount: expense.amount ?? "",
      category: expense.category ?? "General",
    });
  };

  // Update expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...form,
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
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save expense";
      setError(msg);
      errorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const largestExpense = expenses.reduce(
    (max, expense) => Math.max(max, Number(expense.amount) || 0),
    0,
  );
  const categories = new Set(expenses.map((expense) => expense.category || "General"));
  const average = expenses.length ? total / expenses.length : 0;
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  if (loading) return <Loader />;

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Expense Tracker</p>
          <h1>Dashboard</h1>
          <p className="muted">Logged in as {user?.email}</p>
        </div>
        <button className="ghost-button" onClick={logout}>
          Logout
        </button>
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
              <button className="secondary-button" type="button" onClick={() => setShowForm(true)}>
                Add Expense
              </button>
            ) : null}
          </div>

          {showForm ? (
            <form className="stack" onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  placeholder="Groceries"
                  value={form.title}
                  required
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1200"
                  value={form.amount}
                  required
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </label>
              <label>
                Category
                <input
                  placeholder="Food"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </label>
              <div className="form-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Expense" : "Add Expense"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({ title: "", amount: "", category: "General" });
                    setShowForm(!editId ? false : true);
                  }}
                >
                  {editId ? "Cancel" : "Hide"}
                </button>
              </div>
            </form>
          ) : (
            <p className="muted">Open the form when you are ready to add another expense.</p>
          )}
        </div>

        <div className="expense-list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Expenses</h2>
            </div>
            <span className="pill">Largest {formatter.format(largestExpense)}</span>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              message="No expenses yet 😐"
              subMessage="Start by adding your first expense"
              actionText="Add your first expense"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div className="expense-list">
              {expenses.map((e) => (
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>This action cannot be undone.</p>

            <button onClick={() => setShowModal(false)}>
              Cancel
            </button>

            <button onClick={confirmDelete} style={{ color: "red" }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
