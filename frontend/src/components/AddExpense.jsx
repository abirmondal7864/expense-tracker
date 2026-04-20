const addExpenseHandler = async () => {
  if (!title || !amount) {
    alert("Please fill all fields");
    return;
  }

  const res = await axios.post(
    "/api/expenses",
    { title, amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  setExpenses((prev) => [...prev, res.data]);
};
