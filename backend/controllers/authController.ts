import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import type {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
} from "../types/index.js";

interface MongoErrorLike {
  name?: string;
  code?: number;
  message?: string;
}

function isMongoErrorLike(err: unknown): err is MongoErrorLike {
  return typeof err === "object" && err !== null;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (
  req: Request<Record<string, never>, unknown, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required" });
      return;
    }

    // check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: unknown) {
    console.error("Register error:", error);

    if (isMongoErrorLike(error)) {
      // Mongoose validation errors
      if (error.name === "ValidationError") {
        res.status(400).json({ message: error.message || "Validation error" });
        return;
      }

      // Duplicate key error (e.g., unique email)
      if (error.code === 11000) {
        res.status(400).json({ message: "User already exists" });
        return;
      }
    }

    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (
  req: Request<Record<string, never>, unknown, LoginRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // find user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (
  req: Request<Record<string, never>, unknown, ForgotPasswordRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body?.email });
    if (!user) {
      res
        .status(404)
        .json({ message: "There is no user with that email address." });
      return;
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173";

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Forgot your password? Reset it here: \n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
        html: `<p>Forgot your password?</p><p>Click <a href="${resetUrl}">here</a> to reset it.</p>`,
      });

      res.status(200).json({ message: "Token sent to email!" });
    } catch (err: unknown) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error(err);
      res
        .status(500)
        .json({ message: "There was an error sending the email." });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = async (
  req: Request<{ token: string }, unknown, ResetPasswordRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Token is invalid or has expired" });
      return;
    }

    const password = req.body?.password;
    if (!password || password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: "Password reset successful",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ message });
  }
};
