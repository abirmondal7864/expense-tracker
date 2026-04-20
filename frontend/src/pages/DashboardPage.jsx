import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getExpenses, addExpense, deleteExpense } from "../api/expenseApi";

export default function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");

  // Fetch expenses
  const fetchExpenses = async () => {
    const data = await getExpenses(token);
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add expense
  const handleAdd = async () => {
    await addExpense({ title, amount }, token);
    setTitle("");
    setAmount("");
    fetchExpenses();
  };

  // Delete expense
  const handleDelete = async (id) => {
    await deleteExpense(id, token);
    setExpenses(expenses.filter((e) => e._id !== id));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <p>Logged in as: {user?.email}</p>
      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Add Expense</h3>
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
      <button onClick={handleAdd}>Add</button>

      <hr />

      <h3>Expenses</h3>
      {expenses.map((e) => (
        <div key={e._id}>
          {e.title} - ₹{e.amount}
          <button onClick={() => handleDelete(e._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}