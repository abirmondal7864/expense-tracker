import API from "../api/axios";
import type {
  AuthResponse,
  LoginFormData,
  MessageResponse,
  RegisterFormData,
} from "../types";
import { getErrorMessage } from "../utils/error";

export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  try {
    const res = await API.post<AuthResponse>("/auth/login", data);
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Login failed"));
  }
};

export const registerUser = async (
  data: RegisterFormData
): Promise<AuthResponse> => {
  try {
    const res = await API.post<AuthResponse>("/auth/register", data);
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Registration failed"));
  }
};

export const forgotPassword = async (
  email: string
): Promise<MessageResponse> => {
  try {
    const res = await API.post<MessageResponse>("/auth/forgotpassword", {
      email,
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to send reset email"));
  }
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const res = await API.put<AuthResponse>(`/auth/resetpassword/${token}`, {
      password,
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to reset password"));
  }
};
