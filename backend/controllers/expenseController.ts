import type { Request, Response } from "express";
import mongoose from "mongoose";
import Expense from "../models/expenseModel.js";
import type { ExpenseRequestBody } from "../types/index.js";

const isValidPositiveAmount = (value: unknown): value is number | string => {
  if (
    value === undefined ||
    value === null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  ) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

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

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  if (!isValidPositiveAmount(amount)) {
    res.status(400).json({ message: "Amount must be a positive number" });
    return;
  }

  if (category !== undefined && typeof category !== "string") {
    res.status(400).json({ message: "Category must be a string" });
    return;
  }

  const normalizedCategory =
    typeof category === "string" && category.trim().length > 0
      ? category.trim()
      : undefined;

  const expense = await Expense.create({
    user: req.user._id,
    title: title.trim(),
    amount: Number(amount),
    category: normalizedCategory,
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

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid expense id" });
      return;
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({ message: "Invalid update payload" });
      return;
    }

    const { title, amount, category } = req.body;

    if (
      title === undefined &&
      amount === undefined &&
      category === undefined
    ) {
      res.status(400).json({
        message: "At least one field (title, amount, or category) is required",
      });
      return;
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    ) {
      res.status(400).json({ message: "Title must be a non-empty string" });
      return;
    }

    if (amount !== undefined && !isValidPositiveAmount(amount)) {
      res.status(400).json({ message: "Amount must be a positive number" });
      return;
    }

    if (
      category !== undefined &&
      (typeof category !== "string" || category.trim().length === 0)
    ) {
      res.status(400).json({ message: "Category must be a non-empty string" });
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

    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category.trim();

    const updated = await expense.save();

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update expense" });
  }
};
