import axios, { type InternalAxiosRequestConfig } from "axios";
import type { User } from "../types";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://expense-tracker-fgcc.onrender.com/api",
  timeout: 60000,
});

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// Attach token automatically
API.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const user = getStoredUser();

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;
