import Expense from "../models/expenseModel.js";

// @desc Add expense
export const addExpense = async (req, res) => {
  const { title, amount, category } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    title,
    amount,
    category,
  });

  res.status(201).json(expense);
};

// @desc Get all expenses (of logged user)
export const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id });

  res.json(expenses);
};

// @desc Delete expense
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (expense && expense.user.toString() === req.user._id.toString()) {
    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};
