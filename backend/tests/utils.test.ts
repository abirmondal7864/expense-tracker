import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import generateToken from "../utils/generateToken.js";

describe("Backend Utils, CORS & Health Check", () => {
  beforeEach(() => {
    delete process.env.FRONTEND_URL;
  });

  it("GET / returns API Running...", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("API Running...");
  });

  it("allows CORS requests from deployed Vercel URL", async () => {
    const res = await request(app)
      .get("/")
      .set("Origin", "https://expense-tracker-xi-blue-21.vercel.app");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://expense-tracker-xi-blue-21.vercel.app"
    );
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("allows CORS requests from localhost development URL", async () => {
    const res = await request(app)
      .get("/")
      .set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
  });

  it("allows CORS requests from FRONTEND_URL environment variable", async () => {
    process.env.FRONTEND_URL = "https://preview-expense.vercel.app/";
    const res = await request(app)
      .get("/")
      .set("Origin", "https://preview-expense.vercel.app");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://preview-expense.vercel.app"
    );
  });

  it("blocks CORS requests from unauthorized origins", async () => {
    const res = await request(app)
      .get("/")
      .set("Origin", "https://malicious-site.example.com");

    expect(res.status).toBe(500);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
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
