import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

interface MongooseHooksInternal {
  s: {
    hooks: {
      execPre(name: string, context: unknown): Promise<void>;
    };
  };
}

describe("User Model", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hashes password in pre-save hook when password is modified", async () => {
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "plainPassword123",
    });

    await (User.schema as unknown as MongooseHooksInternal).s.hooks.execPre(
      "save",
      user
    );

    expect(user.password).not.toBe("plainPassword123");
    const isMatch = await bcrypt.compare("plainPassword123", user.password);
    expect(isMatch).toBe(true);
  });

  it("does not re-hash password in pre-save hook when password is not modified", async () => {
    const hashed = await bcrypt.hash("plainPassword123", 10);
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: hashed,
    });

    // Simulate an already-persisted document where password was not modified
    vi.spyOn(user, "isModified").mockReturnValue(false);
    const hashSpy = vi.spyOn(bcrypt, "hash");

    await (User.schema as unknown as MongooseHooksInternal).s.hooks.execPre(
      "save",
      user
    );

    expect(hashSpy).not.toHaveBeenCalled();
    expect(user.password).toBe(hashed);
  });

  it("matchPassword returns true for valid password and false for invalid password", async () => {
    const hashed = await bcrypt.hash("secret123", 10);
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: hashed,
    });

    expect(await user.matchPassword("secret123")).toBe(true);
    expect(await user.matchPassword("wrongPassword")).toBe(false);
  });

  it("getResetPasswordToken generates token, stores SHA-256 hash, and sets 10-minute expiration", () => {
    const before = Date.now();
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
    });

    const rawToken = user.getResetPasswordToken();
    const after = Date.now();

    expect(rawToken).toMatch(/^[a-f0-9]{40}$/);

    const expectedHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    expect(user.resetPasswordToken).toBe(expectedHash);

    expect(user.resetPasswordExpires).toBeInstanceOf(Date);
    const expiresMs = user.resetPasswordExpires!.getTime();
    const tenMinutesMs = 10 * 60 * 1000;
    expect(expiresMs).toBeGreaterThanOrEqual(before + tenMinutesMs - 50);
    expect(expiresMs).toBeLessThanOrEqual(after + tenMinutesMs + 50);
    expect(expiresMs).toBeGreaterThan(Date.now());
  });
});
