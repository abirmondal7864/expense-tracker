const deleteHandler = async (id) => {
  await axios.delete(`/api/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  setExpenses((prev) => prev.filter((exp) => exp._id !== id));
};
