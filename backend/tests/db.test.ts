import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

describe("Database connection (connectDB)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("connects to MongoDB when MONGO_URI is set", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/test-db";
    const connectSpy = vi.spyOn(mongoose, "connect").mockResolvedValueOnce({
      connection: { host: "localhost" },
    } as unknown as typeof mongoose);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith("mongodb://localhost:27017/test-db");
    expect(logSpy).toHaveBeenCalledWith("MongoDB Connected: localhost");
  });

  it("logs error and exits process when MONGO_URI is missing", async () => {
    const original = process.env.MONGO_URI;
    delete process.env.MONGO_URI;

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    await connectDB();

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: MONGO_URI is not defined in environment variables"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    process.env.MONGO_URI = original;
  });

  it("logs error and exits process when mongoose.connect rejects", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/test-db";
    vi.spyOn(mongoose, "connect").mockRejectedValueOnce(
      new Error("Connection refused")
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    await connectDB();

    expect(errorSpy).toHaveBeenCalledWith("Error: Connection refused");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
