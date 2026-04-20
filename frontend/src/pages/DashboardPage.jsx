import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import {
  addExpense,
  deleteExpense,
  updateExpense,
} from "../api/expenseApi";

export default function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });
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
      setError("Failed to load expenses");
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
    await deleteExpense(id, token);
    setExpenses(expenses.filter((e) => e._id !== id));
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
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
      if (editId) {
        await updateExpense(editId, form, token);
      } else {
        await addExpense(form, token);
      }

      fetchExpenses();

      setForm({ title: "", amount: "", category: "" });
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <p>Logged in as: {user?.email}</p>
      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Add Expense</h3>
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
        <button type="submit">
          {editId ? "Update Expense" : "Add Expense"}
        </button>
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
        ) : null}
      </form>

      <hr />

      <h3>Expenses</h3>
      <h2>Total: ₹{total}</h2>
      {expenses.map((e) => (
        <div key={e._id}>
          {e.title} - ₹{e.amount}
          <button onClick={() => handleDelete(e._id)}>Delete</button>
          <button onClick={() => handleEdit(e)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
