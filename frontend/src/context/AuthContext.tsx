import { createContext, useContext, useState, type ReactNode } from "react";
import API, { getStoredUser } from "../api/axios";
import type { AuthContextType, User } from "../types";
import { getErrorMessage } from "../utils/error";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await API.post<User>("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Login failed"));
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const { data } = await API.post<User>("/auth/register", {
        name,
        email,
        password,
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Registration failed"));
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token: user?.token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
