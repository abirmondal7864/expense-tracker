import Expense from "../models/expenseModel.js";
import mongoose from "mongoose";

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
  try {
    const { title, amount, category } = req.body ?? {};

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // check owner
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;

    const updated = await expense.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense" });
  }
};
