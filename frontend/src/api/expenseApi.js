import API from "./axios";

// GET all expenses
export const getExpenses = async () => {
  const { data } = await API.get("/expenses");
  return data;
};

// ADD expense
export const addExpense = async (expense) => {
  const { data } = await API.post("/expenses", expense);
  return data;
};

// DELETE expense
export const deleteExpense = async (id) => {
  const { data } = await API.delete(`/expenses/${id}`);
  return data;
};
