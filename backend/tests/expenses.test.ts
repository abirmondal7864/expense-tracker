import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const mockUserFindById = vi.fn();
const mockExpenseFind = vi.fn();
const mockExpenseCreate = vi.fn();
const mockExpenseFindById = vi.fn();

vi.mock("../models/User.js", () => ({
  default: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

vi.mock("../models/expenseModel.js", () => ({
  default: {
    find: (...args: unknown[]) => mockExpenseFind(...args),
    create: (...args: unknown[]) => mockExpenseCreate(...args),
    findById: (...args: unknown[]) => mockExpenseFindById(...args),
  },
}));

import app from "../app.js";

describe("Expenses API", () => {
  const userId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();
  let authToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-jwt-secret-key";
    authToken = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: userId,
        name: "Alice",
        email: "alice@example.com",
      }),
    });
  });

  describe("GET /api/expenses", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(app).get("/api/expenses");
      expect(res.status).toBe(401);
    });

    it("returns all expenses for the authenticated user", async () => {
      const sampleExpenses = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          user: userId.toString(),
          title: "Groceries",
          amount: 500,
          category: "Food",
        },
      ];
      mockExpenseFind.mockResolvedValueOnce(sampleExpenses);

      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Groceries");
      expect(mockExpenseFind).toHaveBeenCalledWith({ user: userId });
    });
  });

  describe("POST /api/expenses", () => {
    it("creates a new expense", async () => {
      const created = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: userId.toString(),
        title: "Coffee",
        amount: 150,
        category: "Food",
      };
      mockExpenseCreate.mockResolvedValueOnce(created);

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Coffee", amount: 150, category: "Food" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Coffee");
      expect(res.body.amount).toBe(150);
    });

    it("returns 400 when title or amount is invalid", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Title and valid amount are required");
    });
  });

  describe("PUT /api/expenses/:id", () => {
    it("updates an existing expense owned by the user", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      const saveMock = vi.fn().mockResolvedValueOnce({
        _id: expenseId,
        user: userId,
        title: "Updated Groceries",
        amount: 750,
        category: "Food",
      });

      mockExpenseFindById.mockResolvedValueOnce({
        _id: expenseId,
        user: userId,
        title: "Groceries",
        amount: 500,
        category: "Food",
        save: saveMock,
      });

      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Groceries", amount: 750 });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Groceries");
      expect(res.body.amount).toBe(750);
    });

    it("returns 400 for invalid expense id", async () => {
      const res = await request(app)
        .put("/api/expenses/not-an-object-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid expense id");
    });

    it("returns 404 when expense is not found", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      mockExpenseFindById.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Expense not found");
    });

    it("returns 401 when updating another user's expense", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      mockExpenseFindById.mockResolvedValueOnce({
        _id: expenseId,
        user: otherUserId,
        title: "Other Expense",
      });

      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Hijacked" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Not authorized");
    });

    it("returns 500 when database throws an unexpected error", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      mockExpenseFindById.mockRejectedValueOnce(new Error("DB down"));

      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to update expense");
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("deletes an expense owned by the user", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      const deleteOneMock = vi.fn().mockResolvedValueOnce(undefined);
      mockExpenseFindById.mockResolvedValueOnce({
        _id: expenseId,
        user: userId,
        deleteOne: deleteOneMock,
      });

      const res = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Expense removed");
      expect(deleteOneMock).toHaveBeenCalledTimes(1);
    });

    it("returns 400 for invalid expense id", async () => {
      const res = await request(app)
        .delete("/api/expenses/bad-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid expense id");
    });

    it("returns 404 when expense belongs to another user or is missing", async () => {
      const expenseId = new mongoose.Types.ObjectId().toString();
      mockExpenseFindById.mockResolvedValueOnce({
        _id: expenseId,
        user: otherUserId,
      });

      const res = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Expense not found");
    });
  });
});
