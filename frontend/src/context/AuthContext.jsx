import { createContext, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token: user?.token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

