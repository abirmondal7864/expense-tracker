import type { Request, Response } from "express";
import mongoose from "mongoose";
import Expense from "../models/expenseModel.js";
import type { ExpenseRequestBody } from "../types/index.js";

// @desc Add expense
export const addExpense = async (
  req: Request<Record<string, never>, unknown, ExpenseRequestBody>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { title, amount, category } = req.body ?? {};

  if (!title || amount === undefined || Number.isNaN(Number(amount))) {
    res.status(400).json({ message: "Title and valid amount are required" });
    return;
  }

  const expense = await Expense.create({
    user: req.user._id,
    title,
    amount: Number(amount),
    category,
  });

  res.status(201).json(expense);
};

// @desc Get all expenses (of logged user)
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const expenses = await Expense.find({ user: req.user._id });

  res.json(expenses);
};

// @desc Delete expense
export const deleteExpense = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid expense id" });
    return;
  }

  const expense = await Expense.findById(req.params.id);

  if (expense && expense.user.toString() === req.user._id.toString()) {
    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};

// @desc Update expense
export const updateExpense = async (
  req: Request<{ id: string }, unknown, ExpenseRequestBody>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { title, amount, category } = req.body ?? {};

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid expense id" });
      return;
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    // check owner
    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;

    const updated = await expense.save();

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update expense" });
  }
};
