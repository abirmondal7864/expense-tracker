import jwt from "jsonwebtoken";
import type { Types } from "mongoose";

const generateToken = (id: string | Types.ObjectId): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not set. Create a backend .env or set the environment variable before starting the server."
    );
  }

  return jwt.sign({ id: String(id) }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
