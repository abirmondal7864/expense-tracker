import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindById = vi.fn();
const mockSendEmail = vi.fn();

vi.mock("../models/User.js", () => ({
  default: {
    findOne: (...args: unknown[]) => mockUserFindOne(...args),
    create: (...args: unknown[]) => mockUserCreate(...args),
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

vi.mock("../utils/sendEmail.js", () => ({
  default: (...args: unknown[]) => mockSendEmail(...args),
}));

import app from "../app.js";

describe("Auth API", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-jwt-secret-key";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a JWT token", async () => {
      const userId = new mongoose.Types.ObjectId();
      mockUserFindOne.mockResolvedValueOnce(null);
      mockUserCreate.mockResolvedValueOnce({
        _id: userId,
        name: "Alice",
        email: "alice@example.com",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Alice");
      expect(res.body.email).toBe("alice@example.com");
      expect(res.body.token).toBeTypeOf("string");

      const decoded = jwt.verify(
        res.body.token,
        process.env.JWT_SECRET!
      ) as { id: string };
      expect(decoded.id).toBe(userId.toString());
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "alice@example.com",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Name, email, and password are required");
    });

    it("returns 400 when user already exists", async () => {
      mockUserFindOne.mockResolvedValueOnce({ email: "alice@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });

    it("handles Mongoose ValidationError with 400", async () => {
      mockUserFindOne.mockResolvedValueOnce(null);
      mockUserCreate.mockRejectedValueOnce({
        name: "ValidationError",
        message: "Password must be at least 6 characters",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password must be at least 6 characters");
    });

    it("handles duplicate key error (11000) with 400", async () => {
      mockUserFindOne.mockResolvedValueOnce(null);
      mockUserCreate.mockRejectedValueOnce({ code: 11000 });

      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in a valid user and returns token", async () => {
      const userId = new mongoose.Types.ObjectId();
      mockUserFindOne.mockResolvedValueOnce({
        _id: userId,
        name: "Alice",
        email: "alice@example.com",
        matchPassword: vi.fn().mockResolvedValueOnce(true),
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("alice@example.com");
      expect(res.body.token).toBeTypeOf("string");
    });

    it("returns 401 when password does not match", async () => {
      mockUserFindOne.mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        name: "Alice",
        email: "alice@example.com",
        matchPassword: vi.fn().mockResolvedValueOnce(false),
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("returns 401 when credentials are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/profile (protected)", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).get("/api/auth/profile");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token");
    });

    it("returns 401 when token is invalid", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token failed");
    });

    it("returns 401 when user is not found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET!);

      mockUserFindById.mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(null),
      });

      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("User not found");
    });

    it("returns user profile when token is valid", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET!);

      mockUserFindById.mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({
          _id: userId.toString(),
          name: "Alice",
          email: "alice@example.com",
        }),
      });

      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("alice@example.com");
    });
  });

  describe("POST /api/auth/forgotpassword", () => {
    it("sends reset email when user exists", async () => {
      const saveMock = vi.fn().mockResolvedValueOnce(undefined);
      mockUserFindOne.mockResolvedValueOnce({
        email: "alice@example.com",
        getResetPasswordToken: vi.fn().mockReturnValueOnce("raw-reset-token"),
        save: saveMock,
      });
      mockSendEmail.mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post("/api/auth/forgotpassword")
        .send({ email: "alice@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token sent to email!");
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when user does not exist", async () => {
      mockUserFindOne.mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/auth/forgotpassword")
        .send({ email: "missing@example.com" });

      expect(res.status).toBe(404);
    });

    it("clears reset token and returns 500 if email sending fails", async () => {
      const userObj = {
        email: "alice@example.com",
        resetPasswordToken: "hashed" as string | undefined,
        resetPasswordExpires: new Date() as Date | undefined,
        getResetPasswordToken: vi.fn().mockReturnValueOnce("raw-reset-token"),
        save: vi.fn().mockResolvedValue(undefined),
      };
      mockUserFindOne.mockResolvedValueOnce(userObj);
      mockSendEmail.mockRejectedValueOnce(new Error("SMTP failure"));

      const res = await request(app)
        .post("/api/auth/forgotpassword")
        .send({ email: "alice@example.com" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("There was an error sending the email.");
      expect(userObj.resetPasswordToken).toBeUndefined();
      expect(userObj.resetPasswordExpires).toBeUndefined();
    });
  });

  describe("PUT /api/auth/resetpassword/:token", () => {
    it("resets password for valid token", async () => {
      const userId = new mongoose.Types.ObjectId();
      const userObj = {
        _id: userId,
        name: "Alice",
        email: "alice@example.com",
        password: "oldpassword",
        resetPasswordToken: "hashed" as string | undefined,
        resetPasswordExpires: new Date(Date.now() + 60000) as Date | undefined,
        save: vi.fn().mockResolvedValueOnce(undefined),
      };
      mockUserFindOne.mockResolvedValueOnce(userObj);

      const res = await request(app)
        .put("/api/auth/resetpassword/valid-token")
        .send({ password: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset successful");
      expect(res.body.token).toBeTypeOf("string");
      expect(userObj.password).toBe("newpassword123");
      expect(userObj.resetPasswordToken).toBeUndefined();
    });

    it("returns 400 when token is invalid or expired", async () => {
      mockUserFindOne.mockResolvedValueOnce(null);

      const res = await request(app)
        .put("/api/auth/resetpassword/bad-token")
        .send({ password: "newpassword123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Token is invalid or has expired");
    });

    it("returns 400 when new password is too short", async () => {
      mockUserFindOne.mockResolvedValueOnce({
        save: vi.fn(),
      });

      const res = await request(app)
        .put("/api/auth/resetpassword/valid-token")
        .send({ password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password must be at least 6 characters");
    });
  });
});
