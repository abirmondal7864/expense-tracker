import axios from "./axios";

// Get all expenses
export const getExpenses = async (token) => {
  const res = await axios.get("/expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Add expense
export const addExpense = async (data, token) => {
  const res = await axios.post("/expenses", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Delete expense
export const deleteExpense = async (id, token) => {
  const res = await axios.delete(`/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
