import type { AxiosResponse } from "axios";
import API from "./axios";
import type {
  AuthResponse,
  LoginFormData,
  MessageResponse,
  RegisterFormData,
  User,
} from "../types";

export const loginUser = async (
  data: LoginFormData
): Promise<AxiosResponse<AuthResponse>> => {
  return API.post<AuthResponse>("/auth/login", data);
};

export const registerUser = async (
  data: RegisterFormData
): Promise<AxiosResponse<AuthResponse>> => {
  return API.post<AuthResponse>("/auth/register", data);
};

export const forgotPassword = async (
  email: string
): Promise<AxiosResponse<MessageResponse>> => {
  return API.post<MessageResponse>("/auth/forgotpassword", { email });
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<AxiosResponse<AuthResponse>> => {
  return API.put<AuthResponse>(`/auth/resetpassword/${token}`, { password });
};

export const getUserProfile = async (): Promise<
  AxiosResponse<Omit<User, "token">>
> => {
  return API.get<Omit<User, "token">>("/auth/profile");
};
