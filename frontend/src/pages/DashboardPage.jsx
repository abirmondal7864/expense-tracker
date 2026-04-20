import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../api/expenseApi";

export default function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);

  // Fetch expenses
  const fetchExpenses = async () => {
    const data = await getExpenses(token);
    setExpenses(data);
  };

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  // Delete expense
  const handleDelete = async (id) => {
    await deleteExpense(id, token);
    setExpenses(expenses.filter((e) => e._id !== id));
  };
  // Update expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await updateExpense(
          editingExpense._id,
          { title, amount, category },
          token,
        );
      } else {
        await addExpense({ title, amount, category }, token);
      }

      fetchExpenses();

      setEditingExpense(null);
      setTitle("");
      setAmount("");
      setCategory("");
    } catch (err) {
      console.error(err);
    }
  };

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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button type="submit">
          {editingExpense ? "Update" : "Add"}
        </button>
        {editingExpense ? (
          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setTitle("");
              setAmount("");
              setCategory("");
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>

      <hr />

      <h3>Expenses</h3>
      {expenses.map((e) => (
        <div key={e._id}>
          {e.title} - ₹{e.amount}
          <button onClick={() => handleDelete(e._id)}>Delete</button>
          <button
            onClick={() => {
              setEditingExpense(e);
              setTitle(e.title ?? "");
              setAmount(e.amount ?? "");
              setCategory(e.category ?? "");
            }}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
