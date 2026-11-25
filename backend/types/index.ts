import type { HydratedDocument, Model, Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

export interface IExpense {
  user: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ExpenseDocument = HydratedDocument<IExpense>;

export interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequestBody {
  email?: string;
  password?: string;
}

export interface ForgotPasswordRequestBody {
  email?: string;
}

export interface ResetPasswordRequestBody {
  password?: string;
}

export interface ExpenseRequestBody {
  title?: string;
  amount?: number;
  category?: string;
  date?: string | Date;
}
