import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ExpenseItem from "../components/ExpenseItem";
import {
  addExpense,
  deleteExpense,
  updateExpense,
} from "../api/expenseApi";

export default function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  
  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load expenses";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchExpenses();
  }, [token]);

  // Delete expense
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteExpense(id, token);
      setExpenses(expenses.filter((e) => e._id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete expense";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    setShowForm(true);
    setForm({
      title: expense.title ?? "",
      amount: expense.amount ?? "",
      category: expense.category ?? "",
    });
  };
  // Update expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      if (editId) {
        await updateExpense(editId, form, token);
        toast.success("Expense updated successfully");
      } else {
        await addExpense(form, token);
        toast.success("Expense added successfully");
      }

      await fetchExpenses();

      setForm({ title: "", amount: "", category: "" });
      setEditId(null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save expense";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  if (loading) return <Loader />;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <p>Logged in as: {user?.email}</p>
      <button onClick={logout}>Logout</button>

      <hr />

      {showForm ? (
        <>
          <h3>{editId ? "Edit Expense" : "Add Expense"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <button type="submit">{editId ? "Update Expense" : "Add Expense"}</button>
            {editId ? (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({ title: "", amount: "", category: "" });
                }}
              >
                Cancel
              </button>
            ) : (
              <button type="button" onClick={() => setShowForm(false)}>
                Hide
              </button>
            )}
          </form>
        </>
      ) : (
        <button type="button" onClick={() => setShowForm(true)}>
          Add Expense
        </button>
      )}

      <hr />

      <h3>Expenses</h3>
      <h2>Total: ₹{total}</h2>
      {expenses.length === 0 ? (
        <EmptyState
          message="No expenses yet 💸"
          actionText="Add your first expense"
          onAction={() => setShowForm(true)}
        />
      ) : (
        expenses.map((e) => (
          <ExpenseItem
            key={e._id}
            expense={e}
            onDelete={handleDelete}
            onEdit={() => handleEdit(e)}
          />
        ))
      )}
    </div>
  );
}
