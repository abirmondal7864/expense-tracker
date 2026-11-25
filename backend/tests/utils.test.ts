import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import generateToken from "../utils/generateToken.js";

describe("Backend Utils & Health Check", () => {
  it("GET / returns API Running...", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("API Running...");
  });

  it("generateToken signs a valid JWT when JWT_SECRET is set", () => {
    process.env.JWT_SECRET = "unit-test-secret";
    const token = generateToken("user-123");
    const decoded = jwt.verify(token, "unit-test-secret") as { id: string };
    expect(decoded.id).toBe("user-123");
  });

  it("generateToken throws if JWT_SECRET is not set", () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => generateToken("user-123")).toThrow(/JWT_SECRET is not set/);

    process.env.JWT_SECRET = original;
  });
});
