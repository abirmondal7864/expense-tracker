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

// @desc Update expense
export const updateExpense = async (req, res) => {
  const { title, amount, category } = req.body;

  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  // ensure user owns this expense
  if (expense.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  expense.title = title || expense.title;
  expense.amount = amount || expense.amount;
  expense.category = category || expense.category;

  const updatedExpense = await expense.save();

  res.json(updatedExpense);
};
